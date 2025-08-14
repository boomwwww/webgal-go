import * as fs from 'node:fs';
import * as path from 'node:path';
import { type ParserConfig } from '@/lib/config';
import { createPreParser } from '@/lib/pre';
import { compatParserConfig } from '@/compat/config';

describe('PreParser', () => {
  const test1Txt = fs.readFileSync(path.join(__dirname, './scene/test1.txt'), 'utf-8');

  const parser = createPreParser();

  it('should parse basic header, body and comment', () => {
    const input = 'webgal:hello;say hello\n';
    const result = parser.parse(input);
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        header: 'webgal',
        body: 'hello',
        attributes: [],
        comment: 'say hello',
        str: 'webgal:hello;say hello\n',
        raw: 'webgal:hello;say hello\n',
        position: { index: 0, line: 1, column: 1 },
      },
    ]);
  });

  it('should parse attributes with key-value pairs', () => {
    const input = 'webgal:hello -name=Alice -age=30;user info\n';
    const result = parser.parse(input);
    expect(result[0].attributes).toEqual([
      { key: 'name', value: 'Alice' },
      { key: 'age', value: '30' },
    ]);
  });

  it('should handle attributes without value (flag attributes)', () => {
    const input = 'a:b -next -notend;\n';
    const result = parser.parse(input);
    expect(result[0].attributes).toEqual([
      { key: 'next', value: true },
      { key: 'notend', value: true },
    ]);
  });

  it('should handle escaped characters', () => {
    const input = 'a:Hello\\;World \\-test -id=\\u0031;with escape\n';
    const result = parser.parse(input);
    expect(result[0].body).toBe('Hello;World -test');
    expect(result[0].attributes[0]).toEqual({
      key: 'id',
      value: '1',
    });
    const input2 = '\\u{1F600}';
    const result2 = parser.parse(input2);
    expect(parser.stringify(result2)).toEqual('\u{1f600}');
  });

  it('should parse multiple sentences', () => {
    const input = 'first:sentence;end1\nsecond:another -attr=1;end2\n';
    const result = parser.parse(input);
    expect(result[0].header).toBe('first');
    expect(result[1].header).toBe('second');
    expect(result[1].attributes[0].value).toBe('1');
  });

  it('should handle empty header', () => {
    const input = ':emptyHeader;comment\n';
    const result = parser.parse(input);
    expect(result[0].header).toBe('');
    expect(result[0].body).toBe('emptyHeader');
  });

  it('should handle multi-character separators', () => {
    const config: ParserConfig = {
      separators: {
        bodyStart: ['==>'],
        attributeStart: ['|>>'],
      },
    };
    const customParser = createPreParser(config);
    const input = 'test==>body|>>key=val|>>boo;comment\n';
    const result = customParser.parse(input);
    expect(result[0].header).toBe('test');
    expect(result[0].body).toBe('body');
    expect(result[0].attributes[0].key).toBe('key');
    expect(result[0].attributes[0].value).toBe('val');
    expect(result[0].attributes[1].key).toBe('boo');
    expect(result[0].attributes[1].value).toBe(true);
  });

  it('should calculate correct positions', () => {
    const input = 'line1;\nline2:content;comment\n';
    const result = parser.parse(input);
    expect(result[1].position.index).toBe(7);
    expect(result[1].position.line).toBe(2);
    expect(result[1].position.column).toBe(1);
  });

  it('should handle custom escape configs', () => {
    const config: ParserConfig = {
      escapeConfigs: [
        {
          key: '&lt;',
          handle: (_str, _p) => ({
            value: '<',
            rawValue: '&lt;',
          }),
        },
        {
          key: '&gt;',
          handle: (_str, _p) => ({
            value: '>',
            rawValue: '&gt;',
          }),
        },
      ],
    };
    const customParser = createPreParser(config);
    const input = 'header:&lt;body&gt; -key=&lt;value&gt;;\n';
    const result = customParser.parse(input);
    expect(result[0].body).toBe('<body>');
    expect(result[0].attributes[0].value).toBe('<value>');
  });

  it('should handle last line break', () => {
    const input = 'header:body';
    const result = parser.parse(input);
    expect(result[0].body).toBe('body');
    const input2 = 'header:body -key=value\\';
    const result2 = parser.parse(input2);
    expect(result2[0].body).toBe('body');
    expect(result2[0].attributes[0].value).toBe('value');
  });

  it('should handle empty input', () => {
    expect(parser.parse('')).toEqual([]);
    const commentOnly = parser.parse(';pure comment');
    expect(commentOnly[0].header).toBe('');
    expect(commentOnly[0].comment).toBe('pure comment');
    const noBody = parser.parse('header: -key=value;');
    expect(noBody[0].body).toBe('');
  });

  it('should stringify sentences', () => {
    expect(parser.stringify(parser.parse(test1Txt), { raw: true })).toBe(test1Txt);
  });

  it('should handle test1.txt', () => {
    const result = parser.parse(test1Txt);
    expect(result).toEqual([
      {
        attributes: [
          {
            key: 'speaker',
            value: 'WebGAL -',
          },
          {
            key: 'next',
            value: true,
          },
        ],
        body: ' 你好！',
        comment: '',
        header: 'say',
        position: {
          column: 1,
          index: 0,
          line: 1,
        },
        raw: 'say: 你好！ -speaker=WebGAL\\ \\- -next;\n',
        str: 'say: 你好！ -speaker=WebGAL - -next;\n',
      },
      {
        attributes: [
          {
            key: ' speaker ',
            value: ' WebGAL \n',
          },
          {
            key: ' next',
            value: true,
          },
        ],
        body: ' 你好！\n',
        comment: '',
        header: 'say',
        position: {
          column: 1,
          index: 36,
          line: 2,
        },
        raw: 'say: 你好！\n - speaker = WebGAL \n - next;\n',
        str: 'say: 你好！\n - speaker = WebGAL \n - next;\n',
      },
      {
        attributes: [
          {
            key: 'next',
            value: true,
          },
        ],
        body: ' 你好！',
        comment: '',
        header: 'WebGAL',
        position: {
          column: 1,
          index: 75,
          line: 5,
        },
        raw: 'WebGAL: 你好！ -next;\n',
        str: 'WebGAL: 你好！ -next;\n',
      },
      {
        attributes: [
          {
            key: ' next',
            value: true,
          },
        ],
        body: ' 你好！\n',
        comment: '',
        header: 'WebGAL',
        position: {
          column: 1,
          index: 94,
          line: 6,
        },
        raw: 'WebGAL: 你好！\n - next;\n',
        str: 'WebGAL: 你好！\n - next;\n',
      },
      {
        attributes: [],
        body: '',
        comment: '',
        header: 'WebGAL：“你好！” -next',
        position: {
          column: 1,
          index: 115,
          line: 8,
        },
        raw: 'WebGAL：“你好！” -next;\n',
        str: 'WebGAL：“你好！” -next;\n',
      },
    ]);
  });

  it('test compatibleParserConfig', () => {
    const compatParser = createPreParser(compatParserConfig);
    const input = 'WebGAL: 你好！\n你好';
    expect(compatParser.parse(input)).toEqual([
      {
        header: 'WebGAL',
        body: ' 你好！',
        attributes: [],
        comment: '',
        raw: 'WebGAL: 你好！\n',
        str: 'WebGAL: 你好！\n',
        position: {
          index: 0,
          line: 1,
          column: 1,
        },
      },
      {
        header: '你好',
        body: '',
        attributes: [],
        comment: '',
        raw: '你好',
        str: '你好',
        position: {
          index: 12,
          line: 2,
          column: 1,
        },
      },
    ]);
  });
});
