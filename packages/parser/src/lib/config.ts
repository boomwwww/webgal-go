/** 文章 */
export interface Article {
  name: string // 文章名
  url: string // 文章url
  sections: Array<Section> // 段落列表
  readonly raw: string // 原始文章字符串
}

/** 段落 */
export interface Section {
  header: string | undefined // 段落头
  body: string | undefined // 段落体
  attributes: Array<Attribute>
  comment: string | undefined // 段落注释
  str: string // 段落字符串(转义后)
  readonly raw: string // 段落原始字符串(转义前)
  readonly position: { index: number; line: number; column: number } // 段落起始位置在整个字符串中的索引
}

/** 属性 */
export interface Attribute {
  key: string | undefined // 属性键
  value: string | boolean | number | undefined // 属性值
}

/** 预解析器 */
export interface PreParser {
  _config: PreParserConfig
  parse: (str: string) => Array<Section>
  stringify: (input: Array<Section>, options?: { raw: boolean }) => string
}

/** 解析器 */
export interface Parser {
  _config: ParserConfig
  _preParser: PreParser
  use: (plugin: ParserPlugin) => this
  preParse: (str: string) => Array<Section>
  parse: (rawArticle: { name: string; url: string; str: string }) => Article
  stringify: (input: Article | Array<Section>, options?: { raw: boolean }) => string
}

/** 预解析器配置 */
export interface PreParserConfig {
  separators: Required<SeparatorConfig>
  escapeConfigs: Array<EscapeConfig>
}

/** 解析器选项 */
export interface ParserOptions {
  separators?: SeparatorConfig // 分隔符配置
  escapeConfigs?: Array<EscapeConfig> // 转义规则配置
  plugins?: Array<ParserPlugin> // 解析器插件
}

/** 解析器配置 */
export interface ParserConfig {
  separators: Required<SeparatorConfig>
  escapeConfigs: Array<EscapeConfig>
  plugins: Array<ParserPlugin>
}

/** 解析器插件 */
export type ParserPlugin = (input: Article) => Article

/** 分隔符配置 */
export interface SeparatorConfig {
  bodyStart?: Array<string> // 用于分隔header和body的字符(如':')
  attributeStart?: Array<string> // 用于开始新属性的字符(如' -')
  attributeKeyValue?: Array<string> // 用于分隔属性键值的字符(如'=')
  commentSeparators?: Array<{ start: string; end: Array<string> }> // 用于分隔注释的分隔符(如';')
  sectionEnd?: Array<string> // 用于结束section的分隔符(如'\n')
}

/**  转义配置 */
export interface EscapeConfig {
  key: string // 字符如果匹配，则让handler处理
  handle: (str: string, index: number) => { value: string; rawValue: string }
}

const handleEscapeU = (str: string, index: number) => {
  // 验证索引有效性
  if (!Number.isInteger(index) || index < 0 || index >= str.length) {
    throw new Error('Invalid index')
  }
  // 检查是否以 \u \U 开头
  if (str[index] !== '\\' || index + 1 >= str.length || !(str[index + 1] === 'u' || str[index + 1] === 'U')) {
    throw new Error('Escape sequence must start with \\u')
  }
  // 检查是否为扩展格式 \u{XXXXX}
  if (index + 2 < str.length && str[index + 2] === '{') {
    // 寻找闭合大括号
    const closingBraceIndex = str.indexOf('}', index + 3)
    if (closingBraceIndex === -1) {
      throw new Error("Incomplete extended escape sequence (missing '}')")
    }
    // 提取大括号内的十六进制字符
    const hexContent = str.slice(index + 3, closingBraceIndex)
    if (hexContent.length < 1 || hexContent.length > 6) {
      throw new Error('Extended escape sequence must contain 1-6 hex characters')
    }
    if (!/^[0-9a-fA-F]+$/.test(hexContent)) {
      throw new Error('Invalid hex characters in extended escape sequence')
    }
    // 解析代码点
    const codePoint = parseInt(hexContent, 16)
    if (isNaN(codePoint) || codePoint < 0x0 || codePoint > 0x10ffff) {
      throw new Error('Invalid Unicode code point in extended sequence')
    }
    return {
      value: String.fromCodePoint(codePoint),
      rawValue: str.slice(index, closingBraceIndex + 1),
    }
  } else {
    // 处理传统格式 \uXXXX (4个十六进制字符)
    if (index + 6 > str.length) {
      throw new Error('Incomplete traditional escape sequence (needs 4 hex chars)')
    }
    const hexContent = str.slice(index + 2, index + 6)
    if (!/^[0-9a-fA-F]{4}$/.test(hexContent)) {
      throw new Error('Traditional escape sequence must contain 4 hex characters')
    }
    const codePoint = parseInt(hexContent, 16)
    if (isNaN(codePoint)) {
      throw new Error('Invalid Unicode escape sequence')
    }
    return {
      value: String.fromCodePoint(codePoint),
      rawValue: str.slice(index, index + 6),
    }
  }
}

const handleEscapeX = (str: string, index: number) => {
  if (!Number.isInteger(index) || index < 0) throw new Error('Invalid index')
  if (index + 4 > str.length) throw new Error('Incomplete escape sequence')
  const cut = str.slice(index, index + 4)
  const code = parseInt(cut.slice(2), 16)
  if (isNaN(code) || code > 0xff) throw new Error('Invalid hexadecimal escape sequence')
  return { value: String.fromCharCode(code), rawValue: cut }
}

/** 默认转义配置
 * @return DefaultEscapeConfigs
 * @pure
 */
export const getDefaultEscapeConfigs = (): Array<EscapeConfig> => [
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
]

/** 默认解析器配置
 * @return DefaultParserConfig
 * @pure
 */
export const getDefaultParserConfig = (): ParserConfig => ({
  separators: {
    bodyStart: [':'],
    attributeStart: [' -'],
    attributeKeyValue: ['='],
    commentSeparators: [{ start: ';', end: ['\r\n', '\n', '\r'] }],
    sectionEnd: [],
  },
  escapeConfigs: getDefaultEscapeConfigs(),
  plugins: [],
})

/** 合并用户配置与默认配置
 * @param parserOptions 用户配置
 * @return 合并后的配置
 * @pure
 */
export const defineParserConfig = (parserOptions?: ParserOptions): ParserConfig => {
  const defaultParserConfig = getDefaultParserConfig()
  return {
    separators: {
      ...defaultParserConfig.separators,
      ...parserOptions?.separators,
    },
    escapeConfigs: [
      ...(parserOptions?.escapeConfigs || []),
      ...defaultParserConfig.escapeConfigs.filter(
        (defCfg) => !parserOptions?.escapeConfigs?.some((cfg) => cfg.key === defCfg.key)
      ),
    ],
    plugins: [...defaultParserConfig.plugins, ...(parserOptions?.plugins || [])],
  }
}
