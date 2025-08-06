import type { CommonSentence } from './strToCommonSentenceArr';

export const trimCommonSentence = (
  commonSentence: CommonSentence,
): CommonSentence => {
  const commandSentence = {
    ...commonSentence,
    header: trimQuote(commonSentence.header.trim()).innerValue,
    body: trimQuote(commonSentence.body.trim()).innerValue,
    attributes: commonSentence.attributes.map((attr) => {
      return {
        key: trimQuote(attr.key.trim()).innerValue,
        value:
          attr.value === true
            ? (true as const)
            : trimQuote(attr.value.trim()).innerValue,
      };
    }),
  };
  return commandSentence;
};

/** 辅助函数 去除字符串两端引号 */
const trimQuote = (str: string): { innerValue: string; quote: string[] } => {
  if (str.startsWith("'") && str.endsWith("'")) {
    return { innerValue: str.slice(1, -1), quote: ["'", "'"] };
  } else if (str.startsWith('"') && str.endsWith('"')) {
    return { innerValue: str.slice(1, -1), quote: ['"', '"'] };
  } else if (str.startsWith('`') && str.endsWith('`')) {
    return { innerValue: str.slice(1, -1), quote: ['`', '`'] };
  } else if (str.startsWith('“') && str.endsWith('”')) {
    // 中文引号
    return { innerValue: str.slice(1, -1), quote: ['“', '”'] };
  } else {
    return { innerValue: str, quote: ['', ''] };
  }
};
