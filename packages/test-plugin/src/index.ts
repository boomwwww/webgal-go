import { type Webgal, type Plugin } from 'webgal-go';

declare module 'webgal-go' {
  export interface Context {
    x: number;
  }
  export interface BusEvents {
    aabbcc: null;
  }
}

export const myPlugin: Plugin = {
  install: (wg: Webgal) => {
    wg.ctx.x = 1;
  },
};
