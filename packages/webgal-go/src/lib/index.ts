import type { Webgal } from '@/types';
import { config } from '@/config';
import { createParser } from './parser';
import { createBus } from './bus';

export const createWebgal = (): Webgal => {
  const _webgal: Webgal = {
    version: config.version,
    ctx: {},
    parser: createParser(),
    bus: createBus(),
    use: (plugin) => {
      plugin.install(_webgal);
      return _webgal;
    },
  };
  return _webgal;
};
