export type SentencesParserConfig = {
  /**
   * 语句头
   */
  header: string;
  /**
   * 语句头正则
   */
  headerReg: RegExp;
  /**
   * 语句头长度
   */
  headerLength: number;
  /**
   * 语句头是否包含引号
   */
  headerIncludeQuote: boolean;
  /**
   * 语句头是否包含括号
   */
};

/**
 * 单条语句接口
 */
export type Sentence = {
  header: string; // 语句头
  body: string; // 语句体
  attributes: Array<{
    // 属性数组
    key: string; // 属性键
    value: string | true; // 属性值
  }>;
  comment: string; // 语句注释
  sentenceRaw: string; // 语句原始字符串(转义前)
  position: { index: number; line: number; column: number }; // 语句起始位置在整个字符串中的索引
};
// 状态
export type State =
  | 'header'
  | 'body'
  | 'attributeKey'
  | 'attributeValue'
  | 'comment';

// 解析上下文（集中管理所有临时状态）
export type Context = {
  str: string; // 待解析的字符串
  p: number; // 当前指针位置
  sentences: Array<Sentence>; // 结果数组

  // 当前语句的临时数据
  current: {
    header: string;
    body: string;
    attributes: Array<{ key: string; value: string | true }>;
    comment: string;
    raw: string; // 原始字符串
    startIndex: number; // 语句起始索引
    attributeKey: string; // 当前属性键
    attributeValue: string; // 当前属性值
  };
};
/**
 * 状态处理函数类型
 * @param str 输入字符串
 * @param ctx 解析上下文
 * @returns 下一个状态
 */
export type StateHandler = (ctx: Context) => State;

export type SentencesParser = {
  parse: (str: string) => Array<Sentence>;
};
