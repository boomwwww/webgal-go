import type {
  SentencesParser,
  Sentence,
  SentencesParserConfig,
  Context,
  State,
  StateHandler,
} from './types';

export const createSentencesParser = (
  config?: SentencesParserConfig,
): SentencesParser => {
  return {
    parse: (str: string): Array<Sentence> => {
      // 初始化上下文
      const ctx: Context = {
        str: str,
        p: 0,
        sentences: [],
        current: {
          header: '',
          body: '',
          attributes: [],
          comment: '',
          raw: '',
          startIndex: 0,
          attributeKey: '',
          attributeValue: '',
        },
      };
      // 状态处理映射表（每个状态对应独立处理函数）
      const stateHandlers: Record<State, StateHandler> = {
        header: handleHeader,
        body: handleBody,
        attributeKey: handleAttributeKey,
        attributeValue: handleAttributeValue,
        comment: handleComment,
      };

      // 主循环：根据当前状态调用对应处理函数，直到指针结束
      let currentState: State = 'header';
      while (ctx.p < str.length) {
        currentState = stateHandlers[currentState](ctx);
      }

      // 处理最后一条语句
      pushCurrentSentence(ctx, str);

      return ctx.sentences;
    },
  };
};

/** 处理header状态 */
function handleHeader(ctx: Context): State {
  const { p } = ctx;
  const char = ctx.str[p];

  if (char === '\\') {
    // 处理转义
    const { value, rawValue, next } = handleEscape(ctx.str, p);
    ctx.current.header += value;
    ctx.current.raw += rawValue;
    ctx.p = next;
    return 'header';
  } else if (char === ':' || char === '：') {
    // 特殊处理：支持中文冒号
    // 切换到body状态
    ctx.current.raw += char;
    ctx.p += 1;
    return 'body';
  } else if (char === ';') {
    // 切换到comment状态
    ctx.current.raw += char;
    ctx.p += 1;
    return 'comment';
  } else {
    // 普通字符
    ctx.current.header += char;
    ctx.current.raw += char;
    ctx.p += 1;
    return 'header';
  }
}
/** 处理body状态 */
function handleBody(ctx: Context): State {
  const { p } = ctx;
  const char = ctx.str[p];

  if (char === '\\') {
    const { value, rawValue, next } = handleEscape(ctx.str, p);
    ctx.current.body += value;
    ctx.current.raw += rawValue;
    ctx.p = next;
    return 'body';
  } else if (char === ';') {
    ctx.current.raw += char;
    ctx.p += 1;
    return 'comment';
  } else if (char === ' ' && ctx.str[p + 1] === '-') {
    // 切换到attributeKey状态（匹配" -"）
    ctx.current.raw += ' -';
    ctx.p += 2;
    return 'attributeKey';
  } else {
    ctx.current.body += char;
    ctx.current.raw += char;
    ctx.p += 1;
    return 'body';
  }
}
/** 处理attributeKey状态 */
function handleAttributeKey(ctx: Context): State {
  const { p } = ctx;
  const char = ctx.str[p];

  if (char === '\\') {
    const { value, rawValue, next } = handleEscape(ctx.str, p);
    ctx.current.attributeKey += value;
    ctx.current.raw += rawValue;
    ctx.p = next;
    return 'attributeKey';
  } else if (char === ';') {
    // 结束当前属性（无值），切换到comment
    ctx.current.attributes.push({
      key: ctx.current.attributeKey,
      value: true,
    });
    ctx.current.attributeKey = '';
    ctx.current.raw += char;
    ctx.p += 1;
    return 'comment';
  } else if (char === ' ' && ctx.str[p + 1] === '-') {
    // 结束当前属性（无值），切换到下一个attributeKey
    ctx.current.attributes.push({
      key: ctx.current.attributeKey,
      value: true,
    });
    ctx.current.attributeKey = '';
    ctx.current.raw += ' -';
    ctx.p += 2;
    return 'attributeKey';
  } else if (char === '=') {
    // 切换到attributeValue
    ctx.current.raw += char;
    ctx.p += 1;
    return 'attributeValue';
  } else {
    // 普通字符
    ctx.current.attributeKey += char;
    ctx.current.raw += char;
    ctx.p += 1;
    return 'attributeKey';
  }
}
/** 处理attributeValue状态 */
function handleAttributeValue(ctx: Context): State {
  const { p } = ctx;
  const char = ctx.str[p];

  if (char === '\\') {
    const { value, rawValue, next } = handleEscape(ctx.str, p);
    ctx.current.attributeValue += value;
    ctx.current.raw += rawValue;
    ctx.p = next;
    return 'attributeValue';
  } else if (char === ';') {
    // 结束当前属性（有值），切换到comment
    ctx.current.attributes.push({
      key: ctx.current.attributeKey,
      value: ctx.current.attributeValue,
    });
    resetAttributeTemp(ctx);
    ctx.current.raw += char;
    ctx.p += 1;
    return 'comment';
  } else if (char === ' ' && ctx.str[p + 1] === '-') {
    // 结束当前属性（有值），切换到下一个attributeKey
    ctx.current.attributes.push({
      key: ctx.current.attributeKey,
      value: ctx.current.attributeValue,
    });
    resetAttributeTemp(ctx);
    ctx.current.raw += ' -';
    ctx.p += 2;
    return 'attributeKey';
  } else {
    // 普通字符
    ctx.current.attributeValue += char;
    ctx.current.raw += char;
    ctx.p += 1;
    return 'attributeValue';
  }
}
/** 处理comment状态 */
function handleComment(ctx: Context): State {
  const { p } = ctx;
  const char = ctx.str[p];

  if (char === '\\') {
    const { value, rawValue, next } = handleEscape(ctx.str, p);
    ctx.current.comment += value;
    ctx.current.raw += rawValue;
    ctx.p = next;
    return 'comment';
  } else if (isLineBreak(char)) {
    // 换行：结束当前语句，开始新语句
    const lineBreakStr = getLineBreakStr(ctx.str, p);
    ctx.current.raw += lineBreakStr;
    ctx.p += lineBreakStr.length;
    pushCurrentSentence(ctx, ctx.str);
    resetCurrentSentence(ctx);
    return 'header';
  } else {
    // 普通字符
    ctx.current.comment += char;
    ctx.current.raw += char;
    ctx.p += 1;
    return 'comment';
  }
}

/** 辅助函数：判断是否为换行符 */
function isLineBreak(char: string): boolean {
  return char === '\n' || char === '\r';
}

/** 辅助函数：获取换行符字符串（\n、\r、\r\n） */
function getLineBreakStr(str: string, p: number): string {
  const char = str[p];
  if (char === '\r' && str[p + 1] === '\n') {
    return '\r\n';
  } else if (char === '\n' || char === '\r') {
    return char;
  } else {
    return '';
  }
}

/** 辅助函数：重置属性临时变量 */
function resetAttributeTemp(ctx: Context): void {
  ctx.current.attributeKey = '';
  ctx.current.attributeValue = '';
}

/** 辅助函数：将当前语句推入结果数组 */
function pushCurrentSentence(ctx: Context, str: string): void {
  // 计算位置信息
  const position = getPositionByIndex(str, ctx.current.startIndex);

  ctx.sentences.push({
    header: ctx.current.header,
    body: ctx.current.body,
    attributes: ctx.current.attributes,
    comment: ctx.current.comment,
    sentenceRaw: ctx.current.raw,
    position: { ...position, index: ctx.current.startIndex },
  });
}

/** 辅助函数：重置当前语句临时变量 */
function resetCurrentSentence(ctx: Context): void {
  const newStartIndex = ctx.p;
  ctx.current = {
    header: '',
    body: '',
    attributes: [],
    comment: '',
    raw: '',
    startIndex: newStartIndex,
    attributeKey: '',
    attributeValue: '',
  };
}

// 处理转义字段
const handleEscape = (
  str: string,
  index: number,
): { value: string; rawValue: string; next: number } => {
  let value: string, rawValue: string, next: number;
  const config = escapeConfigs.find((config) =>
    str.slice(index + 1).startsWith(config.key),
  );
  if (config) {
    const handleResult = config.handler(str, index);
    value = handleResult.value;
    rawValue = handleResult.rawValue;
    next = handleResult.next;
  } else {
    if (str[index + 1] !== undefined) {
      value = str[index + 1];
      rawValue = '\\' + str[index + 1];
      next = index + 2;
    } else {
      value = '';
      rawValue = '\\';
      next = index + 1;
    }
  }
  return { value, rawValue, next };
};

// 转义配置
type EscapeConfig = {
  /** 捺斜杠之后紧跟的字符如果匹配，则让handler处理 */
  key: string;
  /**
   * @param str 待处理的字符串
   * @param index 捺斜杠的索引
   * @returns value 处理后的值, rawValue 处理前的值, next 下一个索引
   */
  handler: (
    str: string,
    index: number,
  ) => { value: string; rawValue: string; next: number };
};
const escapeConfigs: Array<EscapeConfig> = [
  {
    key: 'a',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 2 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 2);
      if (cut !== '\\a') throw new Error('Escape sequence must start with \\n');
      return {
        value: '\u0007',
        rawValue: cut,
        next: index + 2,
      };
    },
  },
  {
    key: 'b',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 2 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 2);
      if (cut !== '\\b') throw new Error('Escape sequence must start with \\n');
      return {
        value: '\b',
        rawValue: cut,
        next: index + 2,
      };
    },
  },
  {
    key: 'n',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 2 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 2);
      if (cut !== '\\n') throw new Error('Escape sequence must start with \\n');
      return {
        value: '\n',
        rawValue: cut,
        next: index + 2,
      };
    },
  },
  {
    key: 't',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 2 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 2);
      if (cut !== '\\t') throw new Error('Escape sequence must start with \\n');
      return {
        value: '\t',
        rawValue: cut,
        next: index + 2,
      };
    },
  },
  {
    key: 'u',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 6 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 6);
      if (!cut.startsWith('\\u'))
        throw new Error('Escape sequence must start with \\u');
      const code = parseInt(cut.slice(2), 16);
      if (isNaN(code)) throw new Error('Invalid Unicode escape sequence');
      return {
        value: String.fromCharCode(code),
        rawValue: cut,
        next: index + 6,
      };
    },
  },
  {
    key: '\r\n',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 3 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 3);
      if (cut !== '\\\r\n')
        throw new Error('Escape sequence must start with \\\r\n');
      return {
        value: '',
        rawValue: cut,
        next: index + 3,
      };
    },
  },
  {
    key: '\n',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 2 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 2);
      if (cut !== '\\\n')
        throw new Error('Escape sequence must start with \\\n');
      return {
        value: '',
        rawValue: cut,
        next: index + 2,
      };
    },
  },
  {
    key: '\r',
    handler: (str: string, index: number) => {
      if (!Number.isInteger(index) || index < 0)
        throw new Error('Invalid index');
      if (index + 2 > str.length) throw new Error('Incomplete escape sequence');
      const cut = str.slice(index, index + 2);
      if (cut !== '\\\r')
        throw new Error('Escape sequence must start with \\\r');
      return {
        value: '',
        rawValue: cut,
        next: index + 2,
      };
    },
  },
];

/**  根据索引获取行和列 */
export const getPositionByIndex = (
  str: string,
  index: number,
): { line: number; column: number } => {
  if (!str) throw new Error('str is empty');
  if (!Number.isInteger(index) || index < 0 || index >= str.length) {
    throw new Error('Index out of bounds');
  }

  let p = 0;

  let line = 1;
  let column = 1;

  while (p < index) {
    if (p !== 0 && str[p - 1] === '\r' && str[p] === '\n') {
      // 处理 \r\n 换行符组合
      line++;
      column = 1;
    } else if (str[p] === '\r' && str[p + 1] === '\n') {
      // 处理 \r\n 换行符组合
      column++;
    } else if (str[p] === '\n' || str[p] === '\r') {
      // 处理其他换行符（\n 或 \r）
      line++;
      column = 1;
    } else {
      // 普通字符
      column++;
    }
    p++;
  }

  return { line, column };
};
