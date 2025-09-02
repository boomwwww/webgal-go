import { createParser } from '@/lib/parser'
import * as plugins from '@/lib/plugins'
import { type CompatArticle, type Scene, compatParserConfig } from './config'
import { type WebgalConfig, type WebGALStyle } from './config'

/**
 * Preprocessor for scene text.
 *
 * Use two-pass to generate a new scene text that concats multiline sequences
 * into a single line and add placeholder lines to preserve the original number
 * of lines.
 *
 * @param sceneText The original scene text
 * @returns The processed scene text
 */
export function sceneTextPreProcess(sceneText: string): string {
  let lines = sceneText.replaceAll('\r', '').split('\n')

  lines = sceneTextPreProcessPassOne(lines)
  lines = sceneTextPreProcessPassTwo(lines)

  return lines.join('\n')
}

/**
 * Pass one.
 *
 * Add escape character to all lines that should be multiline.
 *
 * @param lines The original lines
 * @returns The processed lines
 */
function sceneTextPreProcessPassOne(lines: string[]): string[] {
  const processedLines: string[] = []
  let lastLineIsMultiline = false
  let thisLineIsMultiline = false

  for (const line of lines) {
    thisLineIsMultiline = false

    if (canBeMultiline(line)) {
      thisLineIsMultiline = true
    }

    if (shouldNotBeMultiline(line, lastLineIsMultiline)) {
      thisLineIsMultiline = false
    }

    if (thisLineIsMultiline) {
      processedLines[processedLines.length - 1] += '\\'
    }

    processedLines.push(line)

    lastLineIsMultiline = thisLineIsMultiline
  }

  return processedLines
}

function canBeMultiline(line: string): boolean {
  if (!line.startsWith(' ')) {
    return false
  }

  const trimmedLine = line.trimStart()
  return trimmedLine.startsWith('|') || trimmedLine.startsWith('-')
}

/**
 * Logic to check if a line should not be multiline.
 *
 * @param line The line to check
 * @returns If the line should not be multiline
 */
function shouldNotBeMultiline(line: string, lastLineIsMultiline: boolean): boolean {
  if (!lastLineIsMultiline && isEmptyLine(line)) {
    return true
  }

  // Custom logic: if the line contains -concat, it should not be multiline
  if (line.indexOf('-concat') !== -1) {
    return true
  }

  return false
}

function isEmptyLine(line: string): boolean {
  return line.trim() === ''
}

/**
 * Pass two.
 *
 * Traverse the lines to
 * - remove escape characters
 * - add placeholder lines to preserve the original number of lines.
 *
 * @param lines The lines in pass one
 * @returns The processed lines
 */
function sceneTextPreProcessPassTwo(lines: string[]): string[] {
  const processedLines: string[] = []
  let currentMultilineContent = ''
  let placeHolderLines: string[] = []

  function _concat(line: string) {
    let trimmed = line.trim()
    if (trimmed.startsWith('-')) {
      trimmed = ' ' + trimmed
    }
    currentMultilineContent = currentMultilineContent + trimmed
    placeHolderLines.push(placeholderLine(line))
  }

  for (const line of lines) {
    // console.log(line);
    if (line.endsWith('\\')) {
      const trueLine = line.slice(0, -1)

      if (currentMultilineContent === '') {
        // first line
        currentMultilineContent = trueLine
      } else {
        // middle line
        _concat(trueLine)
      }
      continue
    }

    if (currentMultilineContent !== '') {
      // end line
      _concat(line)
      processedLines.push(currentMultilineContent)
      processedLines.push(...placeHolderLines)

      placeHolderLines = []
      currentMultilineContent = ''
      continue
    }

    processedLines.push(line)
  }

  return processedLines
}

/**
 * Placeholder Line. Adding this line preserves the original number of lines
 * in the scene text, so that it can be compatible with the graphical editor.
 *
 * @param content The original content on this line
 * @returns The placeholder line
 */
function placeholderLine(content = '') {
  return ';_WEBGAL_LINE_BREAK_' + content
}

// export function sceneTextPreProcess(sceneText: string): string {
//   const lines = sceneText.replaceAll('\r', '').split('\n');
//   const processedLines: string[] = [];
//   let lastNonMultilineIndex = -1;
//   let isInMultilineSequence = false;

//   function isMultiline(line: string): boolean {
//     if (!line.startsWith(' ')) return false;
//     const trimmedLine = line.trimStart();
//     return trimmedLine.startsWith('|') || trimmedLine.startsWith('-');
//   }

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     if (line.trim() === '') {
//       // Empty line handling
//       if (isInMultilineSequence) {
//         // Check if the next line is a multiline line

//         let isStillInMulti = false;
//         for (let j = i + 1; j < lines.length; j++) {
//           const lookForwardLine = lines[j] || '';
//           // 遇到正常语句了，直接中断
//           if (lookForwardLine.trim() !== '' && !isMultiline(lookForwardLine)) {
//             isStillInMulti = false;
//             break;
//           }
//           // 必须找到后面接的是参数，并且中间没有遇到任何正常语句才行
//           if (lookForwardLine.trim() !== '' && isMultiline(lookForwardLine)) {
//             isStillInMulti = true;
//             break;
//           }
//         }
//         if (isStillInMulti) {
//           // Still within a multiline sequence
//           processedLines.push(';_WEBGAL_LINE_BREAK_');
//         } else {
//           // End of multiline sequence
//           isInMultilineSequence = false;
//           processedLines.push(line);
//         }
//       } else {
//         // Preserve empty lines outside of multiline sequences
//         processedLines.push(line);
//       }
//     } else if (isMultiline(line)) {
//       // Multiline statement handling
//       if (lastNonMultilineIndex >= 0) {
//         // Concatenate to the previous non-multiline statement
//         const trimedLine = line.trimStart();
//         const addBlank = trimedLine.startsWith('-') ? ' ' : '';
//         processedLines[lastNonMultilineIndex] += addBlank + trimedLine;
//       }

//       // Add the special comment line
//       processedLines.push(';_WEBGAL_LINE_BREAK_' + line);
//       isInMultilineSequence = true;
//     } else {
//       // Non-multiline statement handling
//       processedLines.push(line);
//       lastNonMultilineIndex = processedLines.length - 1;
//       isInMultilineSequence = false;
//     }
//   }

//   return processedLines.join('\n');
// }

/**
 * 处理兼容性场景
 * @param inputArticle
 * @returns 处理后的场景
 * @pure
 */
export const getCompatScene = (inputArticle: CompatArticle): Scene => ({
  sceneName: inputArticle.name,
  sceneUrl: inputArticle.url,
  sentenceList: inputArticle.sections.map((section) => ({
    command: section.commandCode!,
    commandRaw: section.header!,
    content: section.body!,
    args: section.attributes.map((attribute) => ({
      key: attribute.key!,
      value: attribute.value!,
    })),
    sentenceAssets: section.assets!,
    subScene: section.sub!,
  })),
  assetsList: inputArticle.assets!,
  subSceneList: inputArticle.sub!,
})

const _configPreParser = createParser(compatParserConfig)
  .use(plugins.trimPlugin)
  .use(plugins.attributePlugin)
  .use(plugins.undefinedPlugin)

export const configParser = {
  _configPreParser,
  parse(configText: string): WebgalConfig {
    const parsed = this._configPreParser.parse({
      str: configText,
      name: '@config',
      url: '@config',
    })
    return getCompatConfig(parsed)
  },
  stringify(input: WebgalConfig): string {
    return input.reduce(
      (previousValue, curr) =>
        previousValue +
        (curr.command + ':') +
        curr.args.join('|') +
        curr.options.reduce((p, c) => `${p} -${c.key}=${c.value}`, '') +
        ';\n',
      ''
    )
  },
}

/**
 * 获取兼容的配置
 * @param inputArticle
 * @returns 兼容的配置
 * @pure
 */
const getCompatConfig = (inputArticle: CompatArticle): WebgalConfig => {
  return inputArticle.sections.map((section) => ({
    command: section.header!,
    args: section
      .body!.split('|')
      .map((arg) => arg.trim())
      .filter((arg) => arg !== ''),
    options: section.attributes.map((attribute) => ({
      key: attribute.key!,
      value: attribute.value!,
    })),
  }))
}

// todo
export const styleParser = {
  parse: (scssText: string): WebGALStyle => {
    return scss2cssinjsParser(scssText)
  },
}

export function scss2cssinjsParser(scssString: string): WebGALStyle {
  const [classNameStyles, others] = parseCSS(scssString)
  return {
    classNameStyles,
    others,
  }
}

/**
 * GPT 4 写的，临时用，以后要重构！！！
 * TODO：用人类智能重构，要是用着一直没问题，也不是不可以 trust AI
 * @param css
 */
function parseCSS(css: string): [Record<string, string>, string] {
  const result: Record<string, string> = {}
  let specialRules = ''
  let matches

  // 使用非贪婪匹配，尝试正确处理任意层次的嵌套
  const classRegex = /\.([^{\s]+)\s*{((?:[^{}]*|{[^}]*})*)}/g
  const specialRegex = /(@[^{]+{\s*(?:[^{}]*{[^}]*}[^{}]*)+\s*})/g

  while ((matches = classRegex.exec(css)) !== null) {
    const key = matches[1]
    const value = matches[2].trim().replace(/\s*;\s*/g, ';\n')
    result[key] = value
  }

  while ((matches = specialRegex.exec(css)) !== null) {
    specialRules += matches[1].trim() + '\n'
  }

  return [result, specialRules.trim()]
}
