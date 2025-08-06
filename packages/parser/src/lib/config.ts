/** 场景 */
export interface Scene {
  name: string; // 场景名
  url: string; // 场景url
  sentenceList: Array<Sentence>; // 语句列表
  raw: string; // 原始场景字符串
}

/** 语句 */
export interface Sentence {
  header: string; // 语句头
  body: string; // 语句体
  attributes: Array<{
    key: string; // 属性键
    value: string | boolean | number; // 属性值
  }>;
  comment: string; // 语句注释
  str: string; // 语句字符串(转义后)
  raw: string; // 语句原始字符串(转义前)
  position: { index: number; line: number; column: number }; // 语句起始位置在整个字符串中的索引
}

/** 普通解析器 */
export interface CommonParser {
  parse: (str: string) => Array<Sentence>;
  stringify: (input: Array<Sentence> | Sentence, options?: { raw: boolean }) => string;
}

/** 普通解析器配置 */
export interface CommonParserConfig {
  separators?: SeparatorConfig; // 分隔符配置
  escapeConfigs?: Array<EscapeConfig>; // 转义规则配置
}

/** 完整的普通解析器配置 */
export interface CompleteCommonParserConfig {
  separators: Required<SeparatorConfig>;
  escapeConfigs: Array<EscapeConfig>;
}

/** 分隔符配置 */
interface SeparatorConfig {
  bodyStart?: Array<string>; // 用于分隔header和body的字符（如':'）
  attributeStart?: Array<string>; // 用于开始新属性的字符（如' -'）
  attributeKeyValue?: Array<string>; // 用于分隔属性键值的字符（如'='）
  commentSeparators?: Array<{ start: string; end: Array<string> }>; // 用于分隔注释的分隔符（如';'）
  sentenceEnd?: Array<string>; // 用于结束sentence的分隔符（如'\n'）
}

/**  转义配置 */
interface EscapeConfig {
  key: string; // 字符如果匹配，则让handler处理
  handle: (str: string, index: number) => { value: string; rawValue: string };
}

const handleEscapeU = (str: string, index: number) => {
  // 验证索引有效性
  if (!Number.isInteger(index) || index < 0 || index >= str.length) {
    throw new Error('Invalid index');
  }
  // 检查是否以 \u \U 开头
  if (str[index] !== '\\' || index + 1 >= str.length || !(str[index + 1] === 'u' || str[index + 1] === 'U')) {
    throw new Error('Escape sequence must start with \\u');
  }
  // 检查是否为扩展格式 \u{XXXXX}
  if (index + 2 < str.length && str[index + 2] === '{') {
    // 寻找闭合大括号
    const closingBraceIndex = str.indexOf('}', index + 3);
    if (closingBraceIndex === -1) {
      throw new Error("Incomplete extended escape sequence (missing '}')");
    }
    // 提取大括号内的十六进制字符
    const hexContent = str.slice(index + 3, closingBraceIndex);
    if (hexContent.length < 1 || hexContent.length > 6) {
      throw new Error('Extended escape sequence must contain 1-6 hex characters');
    }
    if (!/^[0-9a-fA-F]+$/.test(hexContent)) {
      throw new Error('Invalid hex characters in extended escape sequence');
    }
    // 解析代码点
    const codePoint = parseInt(hexContent, 16);
    if (isNaN(codePoint) || codePoint < 0x0 || codePoint > 0x10ffff) {
      throw new Error('Invalid Unicode code point in extended sequence');
    }
    return {
      value: String.fromCodePoint(codePoint),
      rawValue: str.slice(index, closingBraceIndex + 1),
    };
  } else {
    // 处理传统格式 \uXXXX (4个十六进制字符)
    if (index + 6 > str.length) {
      throw new Error('Incomplete traditional escape sequence (needs 4 hex chars)');
    }
    const hexContent = str.slice(index + 2, index + 6);
    if (!/^[0-9a-fA-F]{4}$/.test(hexContent)) {
      throw new Error('Traditional escape sequence must contain 4 hex characters');
    }
    const codePoint = parseInt(hexContent, 16);
    if (isNaN(codePoint)) {
      throw new Error('Invalid Unicode escape sequence');
    }
    return {
      value: String.fromCodePoint(codePoint),
      rawValue: str.slice(index, index + 6),
    };
  }
};

const handleEscapeX = (str: string, index: number) => {
  if (!Number.isInteger(index) || index < 0) throw new Error('Invalid index');
  if (index + 4 > str.length) throw new Error('Incomplete escape sequence');
  const cut = str.slice(index, index + 4);
  const code = parseInt(cut.slice(2), 16);
  if (isNaN(code) || code > 0xff) throw new Error('Invalid hexadecimal escape sequence');
  return { value: String.fromCharCode(code), rawValue: cut };
};

/** 默认转义配置 */
export const defaultEscapeConfigs: Array<EscapeConfig> = [
  {
    key: '\\a',
    handle: () => ({ value: '\u0007', rawValue: '\\a' }),
  },
  {
    key: '\\b',
    handle: () => ({ value: '\b', rawValue: '\\b' }),
  },
  {
    key: '\\f',
    handle: () => ({ value: '\f', rawValue: '\\f' }),
  },
  {
    key: '\\n',
    handle: () => ({ value: '\n', rawValue: '\\n' }),
  },
  {
    key: '\\r',
    handle: () => ({ value: '\r', rawValue: '\\r' }),
  },
  {
    key: '\\t',
    handle: () => ({ value: '\t', rawValue: '\\t' }),
  },
  {
    key: '\\v',
    handle: () => ({ value: '\v', rawValue: '\\v' }),
  },
  {
    key: '\\u',
    handle: handleEscapeU,
  },
  {
    key: '\\U',
    handle: handleEscapeU,
  },
  {
    key: '\\x',
    handle: handleEscapeX,
  },
  {
    key: '\\X',
    handle: handleEscapeX,
  },
  {
    key: '\\\r\n',
    handle: () => ({ value: '', rawValue: '\\\r\n' }),
  },
  {
    key: '\\\n',
    handle: () => ({ value: '', rawValue: '\\\n' }),
  },
  {
    key: '\\\r',
    handle: () => ({ value: '', rawValue: '\\\r' }),
  },
  {
    key: '\\',
    handle: (str, index) =>
      str[index + 1] !== undefined
        ? { value: str[index + 1], rawValue: '\\' + str[index + 1] }
        : { value: '', rawValue: '\\' },
  },
];

// 解析器默认配置
export const defaultCommonParserConfig: CompleteCommonParserConfig = {
  separators: {
    bodyStart: [':'],
    attributeStart: [' -'],
    attributeKeyValue: ['='],
    commentSeparators: [{ start: ';', end: ['\r\n', '\n', '\r'] }],
    sentenceEnd: [],
  },
  escapeConfigs: defaultEscapeConfigs,
};

export const compatibleCommonParserConfig: CompleteCommonParserConfig = {
  separators: {
    bodyStart: [':'],
    attributeStart: [' -'],
    attributeKeyValue: ['='],
    commentSeparators: [{ start: ';', end: ['\r\n', '\n', '\r'] }],
    sentenceEnd: ['\r\n', '\n', '\r'],
  },
  escapeConfigs: defaultEscapeConfigs,
};

export interface ParserConfig {
  commonParserConfig?: CommonParserConfig;
  plugins?: Array<PluginParser>;
  pluginParsers?: Array<PluginParserLike>;
}

export type PluginParserLike = PluginParser | string | PluginParse;

export type CompleteParserConfig = Required<ParserConfig>;

export interface PluginParser {
  name: string;
  parse: PluginParse;
}

export type PluginParse = (input: Scene, ...args: unknown[]) => Scene;

export const defaultParserConfig: CompleteParserConfig = {
  commonParserConfig: {},
  plugins: [],
  pluginParsers: [],
};

export const defineParserConfig = (...args: unknown[]): CompleteParserConfig => {
  return {
    commonParserConfig: {},
    plugins: [],
    pluginParsers: [],
  };
};
