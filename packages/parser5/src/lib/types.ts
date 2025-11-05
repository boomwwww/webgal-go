export namespace WebgalScript {
  export namespace Token {
    export type Type = 'blank' | 'unquoted' | 'quote' | 'comment'
    export interface Base {
      type: Type
      raw: string
    }
    export interface Blank extends Base {
      type: 'blank'
    }
    export interface Unquoted extends Base {
      type: 'unquoted'
    }
    export interface Quote extends Base {
      type: 'quote'
      start: string
      end: string
    }
    export interface Comment extends Base {
      type: 'comment'
      start: string
      end: string
    }
  }
  export type Token = Token.Blank | Token.Unquoted | Token.Quote | Token.Comment

  export namespace Node {
    export type Type = 'auxiliary' | 'sentence'
    export interface Base {
      type: Type
      tokens: Token[]
    }
    export interface Auxiliary extends Base {
      type: 'auxiliary'
    }
    export interface Sentence extends Base {
      type: 'sentence'
    }
  }
  export type Node = Node.Auxiliary | Node.Sentence

  export namespace Sentence {
    export interface Head {}
    export interface Body {}
    export interface Attributes {}
  }
  export interface Sentence {
    head: Sentence.Head
    body: Sentence.Body
    attributes: Sentence.Attributes
  }

  export namespace Parser {
    export namespace Options {
      export interface QuotationMark {
        start: string
        end: string
        isMultiLine: boolean
      }
      export interface SingleLineCommentSymbol {
        isMultiLine: false
        start: string
      }
      export interface MultiLineCommentSymbol {
        isMultiLine: true
        start: string
        end: string
      }
      export type CommentSymbol = SingleLineCommentSymbol | MultiLineCommentSymbol
    }
    export interface Options {
      customQuotationMarks?: Options.QuotationMark[]
      customCommentSymbols?: Options.CommentSymbol[]
      node?: {
        separator: {
          // 'head-body': string[]
          // 'attribute-start': string[]
          // 'attribute-key-value': string[]
        }
      }
      sentence?: {
        // separator: string
      }
    }
  }
  export interface Parser {
    options: Parser.Options
    tokenParse(raw: string): Token[]
    nodeParse(tokens: Token[]): Node[]
    sentenceParse(nodes: Node[]): Sentence[]
    parse(raw: string): Sentence[]
  }
}
