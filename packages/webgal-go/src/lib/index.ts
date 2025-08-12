import { createBus } from '@/utils/bus';
import { config } from '@/config';

export interface Webgal {
  ctx: Context;
  use: (plugin: Plugin) => Webgal;
  bus: ReturnType<typeof createBus>;
}

export interface Context {
  version: string;
}

export interface Plugin {
  install: (wg: Webgal) => void;
}

export const createWebgal = (): Webgal => {
  const wg: Webgal = {
    ctx: {
      version: config.version,
    },
    use: <P extends Plugin>(plugin: P) => {
      plugin.install(wg);
      return wg;
    },
    bus: createBus(),
  };
  return wg;
};
const wg = createWebgal();
