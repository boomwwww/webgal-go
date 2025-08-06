/**  根据索引获取行和列 */
export const getPositionByIndex = (str: string, index: number): { line: number; column: number } => {
  if (!str) {
    if (index !== 0) {
      throw new Error(`str is empty, and index(${index}) out of bounds`);
    }
    return { line: 1, column: 0 }; // 查询空字符串索引为0时返回行1列0
  }

  if (!Number.isInteger(index) || index < 0 || index > str.length) {
    throw new Error(`index(${index}) out of bounds`);
  }

  if (index === str.length && str[index - 1] !== '\n' && str[index - 1] !== '\r') {
    throw new Error(`index(${index}) out of bounds`);
  }

  let p = 0;

  let line = 1;
  let column = 1;

  while (p < index) {
    if (p !== 0 && str[p - 1] === '\r' && str[p] === '\n') {
      // 处理 \r\n 换行符组合
      line++;
      column = 1;
    } else if (str[p] === '\r' && str[p + 1] === '\n') {
      // 处理 \r\n 换行符组合
      column++;
    } else if (str[p] === '\n' || str[p] === '\r') {
      // 处理其他换行符（\n 或 \r）
      line++;
      column = 1;
    } else {
      // 普通字符
      column++;
    }
    p++;
  }

  if (index === str.length) column = 0; // 字符串末尾空行列数设为0

  return { line, column };
};

/** 函数管道 */
export const pipe = <T>(
  ...fns: Array<(arg: T, ...rest: Array<unknown>) => T>
): ((arg: T, ...rest: Array<unknown>) => T) => {
  return (initialValue) => fns.reduce((acc, fn) => fn(acc), initialValue);
};
