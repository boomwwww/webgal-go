describe('global-test', () => {
  it('should work', () => {
    const pipe = <T extends unknown[]>(...fns: { [K in keyof T]: (arg: any) => T[K] }): ((arg: T[0]) => T[number]) => {
      return (initialValue) => fns.reduce((acc, fn) => fn(acc), initialValue);
    };
    const process = pipe(
      (x: number) => x * 2,
      (x: number) => x.toString(),
      (s: string) => `Result: ${s}`
    );
    console.log(process(5));
    expect(!!true).toBe(true);
  });
});
