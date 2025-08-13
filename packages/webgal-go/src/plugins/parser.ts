import { createParserFactory } from '@webgal-go/parser';

const parserFactory = createParserFactory();

export const parser = parserFactory.create();

export const parserPlugin = {
  install: (wg: any) => {
    wg.parser = parser;
  },
};
parserFactory.use((i) => i);
