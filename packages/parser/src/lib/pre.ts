import {
  type PreParser,
  type PreParserConfig,
  type CompletePreParserConfig,
  defaultPreParserConfig,
  type Sentence,
} from './config';
import { getPositionByIndex } from './utils';

/** 状态 */
type State = 'header' | 'body' | 'attributeKey' | 'attributeValue' | 'comment';

/** 当前语句的临时数据 */
type Current = Record<State, string> & {
  attributes: Array<{ key: string; value: string | true }>;
  commentStart: string;
  str: string; // 语句字符串(转义后)
  raw: string; // 语句原始字符串(转义前)
  startIndex: number; // 语句起始索引
};

/** 解析上下文 */
type Context = {
  raw: string; // 原始字符串
  state: State; // 当前状态
  p: number; // 当前指针位置
  rest: string; // 剩余字符串
  sentences: Array<Sentence>; // 结果数组
  current: Current; // 当前语句的临时数据
  config: CompletePreParserConfig; // 配置
};

/** Create a pre parser */
export const createPreParser = (preParserConfig?: PreParserConfig): PreParser => {
  const config = getMergedConfig(preParserConfig);
  return {
    parse: (str) => {
      const ctx = createContext(str, config); // 初始化上下文
      while (ctx.p < ctx.raw.length) {
        stateHandlers[ctx.state](ctx); // 主循环：根据当前状态调用对应处理函数，直到指针结束
        ctx.rest = ctx.raw.slice(ctx.p);
      }
      if (ctx.current.str !== '') {
        ctx.current.attributeKey !== '' && pushCurrentAttribute(ctx);
        pushCurrentSentence(ctx); // 处理可能遗漏的最后一条语句
      }
      return ctx.sentences;
    },
    stringify: (input, options = { raw: false }): string => {
      if (!Array.isArray(input)) return options.raw ? input.raw : input.str;
      if (options.raw) return input.map((sentence) => sentence.raw).join('');
      return input.map((sentence) => sentence.str).join('');
    },
  };
};

/** 合并用户配置与默认配置 */
const getMergedConfig = (userConfig?: PreParserConfig): CompletePreParserConfig => ({
  separators: {
    ...defaultPreParserConfig.separators,
    ...userConfig?.separators,
  },
  escapeConfigs: [
    ...(userConfig?.escapeConfigs || []),
    ...defaultPreParserConfig.escapeConfigs.filter(
      (defCfg) => !userConfig?.escapeConfigs?.some((usrCfg) => usrCfg.key === defCfg.key)
    ),
  ],
});

/** 新建上下文对象 */
const createContext = (str: string, config: CompletePreParserConfig): Context => ({
  raw: str,
  state: 'header',
  p: 0,
  rest: str,
  sentences: [],
  current: {
    header: '',
    body: '',
    attributeKey: '',
    attributeValue: '',
    comment: '',
    attributes: [],
    commentStart: '',
    str: '',
    raw: '',
    startIndex: 0,
  },
  config: config,
});

/** 辅助函数：添加值到当前语句 */
const pushValue = (ctx: Context, value: string, rawValue?: string): void => {
  const _rawValue = rawValue ?? value;
  ctx.current[ctx.state] += value;
  ctx.current.str += value;
  ctx.current.raw += _rawValue;
  ctx.p += _rawValue.length;
};

/** 辅助函数：添加分隔符到当前语句 */
const pushSeparator = (ctx: Context, separator: string): void => {
  ctx.current.str += separator;
  ctx.current.raw += separator;
  ctx.p += separator.length;
};

/** 辅助函数：将当前属性加入到属性列表中，并重置当前属性 */
const pushCurrentAttribute = (ctx: Context): void => {
  ctx.current.attributes.push({
    key: ctx.current.attributeKey,
    value: ctx.current.attributeValue === '' ? true : ctx.current.attributeValue,
  });
  ctx.current.attributeKey = '';
  ctx.current.attributeValue = '';
};

/** 辅助函数：将当前语句推入结果数组并重置当前语句 */
const pushCurrentSentence = (ctx: Context): void => {
  ctx.sentences.push({
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
    header: '',
    body: '',
    attributeKey: '',
    attributeValue: '',
    comment: '',
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
  const matchedEscapeConfig = escapeConfigs.find((cfg) => ctx.rest.startsWith(cfg.key));
  if (!matchedEscapeConfig) return false;
  const { value, rawValue } = matchedEscapeConfig.handle(ctx.raw, ctx.p);
  pushValue(ctx, value, rawValue);
  return true;
};

/** 辅助函数：尝试进入body状态 */
const enterBody = (ctx: Context): boolean => {
  const { bodyStart } = ctx.config.separators;
  const matchedBodyStart = bodyStart.find((sep) => ctx.rest.startsWith(sep));
  if (!matchedBodyStart) return false;
  pushSeparator(ctx, matchedBodyStart);
  ctx.state = 'body';
  return true;
};

/** 辅助函数：尝试进入attributeKey状态 */
const enterAttributeKey = (ctx: Context): boolean => {
  const { attributeStart } = ctx.config.separators;
  const matchedAttributeStart = attributeStart.find((sep) => ctx.rest.startsWith(sep));
  if (!matchedAttributeStart) return false;
  (ctx.state === 'attributeKey' || ctx.state === 'attributeValue') && pushCurrentAttribute(ctx);
  pushSeparator(ctx, matchedAttributeStart);
  ctx.state = 'attributeKey';
  return true;
};

/** 辅助函数：尝试进入attributeValue状态 */
const enterAttributeValue = (ctx: Context): boolean => {
  const { attributeKeyValue } = ctx.config.separators;
  const matchedAttributeKeyValue = attributeKeyValue.find((sep) => ctx.rest.startsWith(sep));
  if (!matchedAttributeKeyValue) return false;
  pushSeparator(ctx, matchedAttributeKeyValue);
  ctx.state = 'attributeValue';
  return true;
};

/** 辅助函数，尝试进入comment状态 */
const enterComment = (ctx: Context): boolean => {
  const { commentSeparators } = ctx.config.separators;
  const matchedCommentStart = commentSeparators.find((sep) => ctx.rest.startsWith(sep.start))?.start;
  if (!matchedCommentStart) return false;
  ctx.current.commentStart = matchedCommentStart;
  (ctx.state === 'attributeKey' || ctx.state === 'attributeValue') && pushCurrentAttribute(ctx);
  pushSeparator(ctx, matchedCommentStart);
  ctx.state = 'comment';
  return true;
};

/** 辅助函数：尝试退出comment状态 */
const exitComment = (ctx: Context): boolean => {
  const { commentSeparators } = ctx.config.separators;
  const commentEndSeparators = commentSeparators.find((sep) => sep.start === ctx.current.commentStart);
  const matchedCommentEnd = commentEndSeparators?.end.find((sep) => ctx.rest.startsWith(sep));
  if (!matchedCommentEnd) return false;
  ctx.current.commentStart = '';
  pushSeparator(ctx, matchedCommentEnd);
  pushCurrentSentence(ctx);
  ctx.state = 'header';
  return true;
};

/** 辅助函数：尝试退出当前语句 */
const exitSentence = (ctx: Context): boolean => {
  const { sentenceEnd } = ctx.config.separators;
  const matchedSentenceEnd = sentenceEnd.find((sep) => ctx.rest.startsWith(sep));
  if (!matchedSentenceEnd) return false;
  (ctx.state === 'attributeKey' || ctx.state === 'attributeValue') && pushCurrentAttribute(ctx);
  pushSeparator(ctx, matchedSentenceEnd);
  pushCurrentSentence(ctx);
  ctx.state = 'header';
  return true;
};

/** 辅助函数：添加单个字符到当前语句 */
const pushChar = (ctx: Context): boolean => {
  pushValue(ctx, ctx.rest[0]);
  return true;
};

/** 创建状态处理函数的工厂函数 */
const handle = (checks: Array<(ctx: Context) => boolean>): ((ctx: Context) => void) => {
  return (ctx) => {
    for (const check of checks) {
      if (check(ctx)) return;
    }
  };
};

/* 状态处理映射表(每个状态对应独立处理函数) */
const stateHandlers: Record<State, (ctx: Context) => void> = {
  header: handle([unescape, exitSentence, enterComment, enterBody, pushChar]),
  body: handle([unescape, exitSentence, enterComment, enterAttributeKey, pushChar]),
  attributeKey: handle([unescape, exitSentence, enterComment, enterAttributeKey, enterAttributeValue, pushChar]),
  attributeValue: handle([unescape, exitSentence, enterComment, enterAttributeKey, pushChar]),
  comment: handle([unescape, exitSentence, exitComment, pushChar]),
};
