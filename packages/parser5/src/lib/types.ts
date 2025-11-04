export namespace WebgalScript {
  export interface Attribute {
    key: string | undefined // 属性键
    value: string | boolean | number | undefined // 属性值
  }
  export interface Section {
    header: string | undefined // 段落头
    body: string | undefined // 段落体
    attributes: Array<Attribute> // 段落属性列表
    comment: string | undefined // 段落注释
    str: string // 段落字符串(转义后)
    readonly raw: string // 段落原始字符串(转义前)
    readonly position: {
      readonly index: number
      readonly line: number
    }
  }
  export interface Article {
    name: string // 文章名
    url: string // 文章url
    sections: Array<Section> // 文章段落列表
    readonly raw: string // 文章原始字符串
  }

  export interface QuotationOption {
    start: string
    end: string[]
    allowLineBreak: boolean
  }

  export type CommentOption =
    | {
        start: string
        end: string[]
        allowLineBreak: boolean
      }
    | {
        start: string
        delimiter: (string | { symbols: 'eol' | 'eof' })[]
        allowLineBreak: boolean
      }

  export interface ParserOptions {
    token: {
      eol: string[]
      whitespace: string[]
      quotation: QuotationOption[]
      comment: CommentOption[]
    }
  }

  export interface Parser {
    parse(rawArticle: { name: string; url: string; str: string }): Article
    stringify(input: Article | Array<Section>, options?: { raw: boolean }): string
  }
}
