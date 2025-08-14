import type { Section, ParserConfig, CompleteParserConfig } from './config';
import { getCompleteConfig } from './config';
import { concat, getPositionByIndex } from './utils';

/** 预解析器 */
export type PreParser = {
  parse: (str: string) => Array<Section>;
  stringify: (input: Array<Section>, options?: { raw: boolean }) => string;
  config: CompleteParserConfig;
};

/** 解析上下文 */
type Context = {
  raw: string; // 原始字符串
  state: State; // 当前状态
  p: number; // 当前指针位置
  sections: Array<Section>; // 结果数组
  current: Current; // 当前语句的临时数据
  config: CompleteParserConfig; // 配置
};

/** 状态 */
type State = 'header' | 'body' | 'attributeKey' | 'attributeValue' | 'comment';

/** 当前语句的临时数据 */
type Current = Record<State, string | undefined> & {
  attributes: Array<{ key: string | undefined; value: string | true | undefined }>;
  commentStart: string;
  str: string; // 语句字符串(转义后)
  raw: string; // 语句原始字符串(转义前)
  startIndex: number; // 语句起始索引
};

/** Create a pre parser */
export const createPreParser = (parserConfig?: ParserConfig): PreParser => {
  const _parserConfig = getCompleteConfig(parserConfig);

  return {
    parse: (str) => {
      const ctx = createContext(str, _parserConfig); // 初始化上下文
      ctx.current.header = ''; // 语句头初始化为字符串

      while (ctx.p < ctx.raw.length) {
        stateHandlers[ctx.state](ctx); // 主循环：根据当前状态调用对应处理函数，直到指针结束
      }

      if (ctx.current.str !== '') {
        ctx.current.attributeKey && pushCurrentAttribute(ctx);
        pushCurrentSection(ctx); // 处理可能遗漏的最后一条语句
      }

      return ctx.sections;
    },

    stringify: (sections, options = { raw: false }): string => {
      return sections.map((section) => section[options.raw ? 'raw' : 'str']).join('');
    },

    config: _parserConfig,
  };
};

/** 辅助函数：新建上下文对象 */
const createContext = (str: string, parserConfig: CompleteParserConfig): Context => ({
  raw: str,
  state: 'header',
  p: 0,
  sections: [],
  current: {
    header: undefined,
    body: undefined,
    attributeKey: undefined,
    attributeValue: undefined,
    comment: undefined,
    attributes: [],
    commentStart: '',
    str: '',
    raw: '',
    startIndex: 0,
  },
  config: parserConfig,
});

/** 辅助函数：添加值到当前语句 */
const pushValue = (ctx: Context, value: string, rawValue?: string): void => {
  const _rawValue = rawValue ?? value;
  ctx.current[ctx.state] = concat(ctx.current[ctx.state], value);
  ctx.current.str = concat(ctx.current.str, value);
  ctx.current.raw = concat(ctx.current.raw, _rawValue);
  ctx.p += _rawValue.length;
};

/** 辅助函数：添加分隔符到当前语句 */
const pushSeparator = (ctx: Context, separator: string): void => {
  ctx.current.str = concat(ctx.current.str, separator);
  ctx.current.raw = concat(ctx.current.raw, separator);
  ctx.p += separator.length;
};

/** 辅助函数：将当前属性加入到属性列表中，并重置当前属性 */
const pushCurrentAttribute = (ctx: Context): void => {
  ctx.current.attributes.push({
    key: ctx.current.attributeKey,
    value: ctx.current.attributeValue ?? true,
  });
  ctx.current.attributeKey = undefined;
  ctx.current.attributeValue = undefined;
};

/** 辅助函数：将当前语句推入结果数组并重置当前语句 */
const pushCurrentSection = (ctx: Context): void => {
  ctx.sections.push({
    header: ctx.current.header,
    body: ctx.current.body,
    attributes: ctx.current.attributes,
    comment: ctx.current.comment,
    str: ctx.current.str,
    raw: ctx.current.raw,
    position: {
      index: ctx.current.startIndex,
      ...getPositionByIndex(ctx.raw, ctx.current.startIndex),
    },
  });
  ctx.current = {
    header: undefined,
    body: undefined,
    attributeKey: undefined,
    attributeValue: undefined,
    comment: undefined,
    attributes: [],
    commentStart: '',
    str: '',
    raw: '',
    startIndex: ctx.p,
  };
};

/** 辅助函数，尝试处理转义 */
const unescape = (ctx: Context): boolean => {
  const { escapeConfigs } = ctx.config;
  const matchedEscapeConfig = escapeConfigs.find((cfg) => ctx.raw.startsWith(cfg.key, ctx.p));
  if (!matchedEscapeConfig) return false;
  const { value, rawValue } = matchedEscapeConfig.handle(ctx.raw, ctx.p);
  pushValue(ctx, value, rawValue);
  return true;
};

/** 辅助函数：尝试进入body状态 */
const enterBody = (ctx: Context): boolean => {
  const { bodyStart } = ctx.config.separators;
  const matchedBodyStart = bodyStart.find((sep) => ctx.raw.startsWith(sep, ctx.p));
  if (!matchedBodyStart) return false;
  pushSeparator(ctx, matchedBodyStart);
  ctx.state = 'body';
  ctx.current.body = '';
  return true;
};

/** 辅助函数：尝试进入attributeKey状态 */
const enterAttributeKey = (ctx: Context): boolean => {
  const { attributeStart } = ctx.config.separators;
  const matchedAttributeStart = attributeStart.find((sep) => ctx.raw.startsWith(sep, ctx.p));
  if (!matchedAttributeStart) return false;
  (ctx.state === 'attributeKey' || ctx.state === 'attributeValue') && pushCurrentAttribute(ctx);
  pushSeparator(ctx, matchedAttributeStart);
  ctx.state = 'attributeKey';
  ctx.current.attributeKey = '';
  return true;
};

/** 辅助函数：尝试进入attributeValue状态 */
const enterAttributeValue = (ctx: Context): boolean => {
  const { attributeKeyValue } = ctx.config.separators;
  const matchedAttributeKeyValue = attributeKeyValue.find((sep) => ctx.raw.startsWith(sep, ctx.p));
  if (!matchedAttributeKeyValue) return false;
  pushSeparator(ctx, matchedAttributeKeyValue);
  ctx.state = 'attributeValue';
  ctx.current.attributeValue = '';
  return true;
};

/** 辅助函数，尝试进入comment状态 */
const enterComment = (ctx: Context): boolean => {
  const { commentSeparators } = ctx.config.separators;
  const matchedCommentStart = commentSeparators.find((sep) => ctx.raw.startsWith(sep.start, ctx.p))?.start;
  if (!matchedCommentStart) return false;
  ctx.current.commentStart = matchedCommentStart;
  (ctx.state === 'attributeKey' || ctx.state === 'attributeValue') && pushCurrentAttribute(ctx);
  pushSeparator(ctx, matchedCommentStart);
  ctx.state = 'comment';
  ctx.current.comment = '';
  return true;
};

/** 辅助函数：尝试退出comment状态 */
const exitComment = (ctx: Context): boolean => {
  const { commentSeparators } = ctx.config.separators;
  const commentEndSeparators = commentSeparators.find((sep) => sep.start === ctx.current.commentStart);
  const matchedCommentEnd = commentEndSeparators?.end.find((sep) => ctx.raw.startsWith(sep, ctx.p));
  if (!matchedCommentEnd) return false;
  ctx.current.commentStart = '';
  pushSeparator(ctx, matchedCommentEnd);
  pushCurrentSection(ctx);
  ctx.state = 'header';
  return true;
};

/** 辅助函数：尝试退出当前语句 */
const exitSection = (ctx: Context): boolean => {
  const { sectionEnd } = ctx.config.separators;
  const matchedSectionEnd = sectionEnd.find((sep) => ctx.raw.startsWith(sep, ctx.p));
  if (!matchedSectionEnd) return false;
  (ctx.state === 'attributeKey' || ctx.state === 'attributeValue') && pushCurrentAttribute(ctx);
  pushSeparator(ctx, matchedSectionEnd);
  pushCurrentSection(ctx);
  ctx.state = 'header';
  ctx.current.header = '';
  return true;
};

/** 辅助函数：添加单个字符到当前语句 */
const pushChar = (ctx: Context): boolean => {
  pushValue(ctx, ctx.raw[ctx.p]);
  return true;
};

/** 创建状态处理函数的工厂函数 */
const handle = (fns: Array<(ctx: Context) => boolean>): ((ctx: Context) => void) => {
  return (ctx) => {
    for (const fn of fns) {
      if (fn(ctx)) return;
    }
  };
};

/* 状态处理映射表(每个状态对应独立处理函数) */
const stateHandlers: Record<State, (ctx: Context) => void> = {
  header: handle([unescape, exitSection, enterComment, enterBody, pushChar]),
  body: handle([unescape, exitSection, enterComment, enterAttributeKey, pushChar]),
  attributeKey: handle([unescape, exitSection, enterComment, enterAttributeKey, enterAttributeValue, pushChar]),
  attributeValue: handle([unescape, exitSection, enterComment, enterAttributeKey, pushChar]),
  comment: handle([unescape, exitSection, exitComment, pushChar]),
};
