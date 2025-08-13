import { createBus } from '@/utils/bus';
import { config } from '@/config';

export interface Webgal {
  readonly version: string;
  readonly ctx: Context;
  readonly bus: ReturnType<typeof createBus<Events>>;
  readonly use: (plugin: Plugin) => Webgal;
}

export interface Context {}

export interface BusEvents {
  'text-settle': null;
  'user-interact-next': null;
  'fullscreen-db-click': null;
  'style-update': null;
}

type Events = Required<BusEvents>;

export interface Plugin {
  install: (wg: Webgal) => void;
}

export const createWebgal = (): Webgal => {
  const wg: Webgal = {
    version: config.version,
    ctx: {},
    bus: createBus<Events>(),
    use: <P extends Plugin>(plugin: P) => {
      plugin.install(wg);
      return wg;
    },
  };
  return wg;
};

// import { parserPlugin } from '@/plugins/parser';
// const wg = createWebgal();
// wg.use(parserPlugin);
