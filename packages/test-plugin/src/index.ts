import { type Webgal } from 'webgal-go';

export const myPlugin = {
  install: (wg: Webgal) => {
    wg.ctx.myPlugin = {
      name: 'myPlugin',
    };
  },
};
