import { type Webgal, type Plugin } from 'webgal-go';

export const myPlugin: Plugin = {
  install: (webgal: Webgal) => {
    webgal.ctx.stage = { pixi: 'pipixixi' };
  },
};

export * from './types';
export * from './bus';
