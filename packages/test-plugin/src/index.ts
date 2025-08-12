import { type Webgal, type Plugin } from 'webgal-go';
// import 'webgal-go';

declare module 'webgal-go' {
  export interface Context {
    x: number;
  }
}

type MyPlugin = Plugin;

export const myPlugin: Plugin = {
  install: (wg: Webgal) => {
    wg.ctx.x = 1;
  },
};
