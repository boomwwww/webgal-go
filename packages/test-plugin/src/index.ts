import { type Webgal, type WebgalPlugin } from 'webgal-go';

export const createStage = (): WebgalPlugin => {
  return {
    install: (webgal: Webgal) => {
      webgal.ctx.stage = { pixi: 'pipixixi' };
    },
  };
};

export * from './types';
export * from './bus';
