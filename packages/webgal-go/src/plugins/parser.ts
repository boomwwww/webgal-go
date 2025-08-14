import { commandType, createParserFactory } from '@webgal-go/parser';

const parserFactory = createParserFactory();

export const parser = parserFactory.create();

export const parserPlugin = {
  install: (wg: any) => {
    wg.parser = parser;
  },
};
export let a: number = commandType.applyStyle;
parserFactory.use((i) => i);
