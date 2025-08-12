import { type Webgal, type Plugin } from 'webgal-go';

declare module 'webgal-go' {
  export interface Context {
    x: number;
  }
}

export const myPlugin: Plugin = {
  install: (wg: Webgal) => {
    wg.ctx.x = 1;
  },
};
