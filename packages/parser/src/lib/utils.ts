/** 函数管道 */
export const pipe = <T>(...fns: Array<(arg: T) => T>): ((arg: T) => T) => {
  return (initialValue) => fns.reduce((acc, fn) => fn(acc), initialValue);
};

/** 拼接字符串 */
export const concat = (...args: Array<string | undefined>) => {
  return args.filter((arg) => arg !== undefined).join('');
};

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
      line++; // 处理 \r\n 换行符组合
      column = 1;
    } else if (str[p] === '\r' && str[p + 1] === '\n') {
      column++; // 处理 \r\n 换行符组合
    } else if (str[p] === '\n' || str[p] === '\r') {
      line++; // 处理其他换行符（\n 或 \r）
      column = 1;
    } else {
      column++; // 普通字符
    }
    p++;
  }

  if (index === str.length) column = 0; // 字符串末尾空行列数设为0

  return { line, column };
};
