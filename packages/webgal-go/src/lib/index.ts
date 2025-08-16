import { type CompatSceneParser } from '@webgal-go/parser';
import { createBus } from '@/utils/bus';
import { config } from '@/config';
import { parser as _parser } from '@/plugins/parser';

export interface Webgal {
  readonly version: string;
  readonly ctx: Context;
  readonly parser: CompatSceneParser;
  readonly bus: ReturnType<typeof createBus<Events>>;
  readonly use: (plugin: Plugin) => Webgal;
}

export interface Context {

}

export interface BusEvents {
  'text-settle': null;
  'user-interact-next': null;
  'fullscreen-db-click': null;
  'style-update': null;
}

type Events = Required<BusEvents>;

export interface Plugin {
  install: (webgal: Webgal) => void;
}

export const createWebgal = (): Webgal => {
  const _webgal: Webgal = {
    version: config.version,
    ctx: {},
    parser: _parser,
    bus: createBus<Events>(),
    use: <P extends Plugin>(plugin: P) => {
      plugin.install(_webgal);
      return _webgal;
    },
  };
  return _webgal;
};
