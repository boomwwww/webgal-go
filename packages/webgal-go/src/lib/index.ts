import { createSceneManager } from '@/plugins/scene';
import { createBus } from '@/utils/bus';
// import { BacklogManager } from './backlog';

// export const createWebgal0 = () => {
//   const wg = {
//     sceneManager: createSceneManager(),
//     backlogManager: new BacklogManager(this.sceneManager),
//     animationManager: new AnimationManager(),
//     gameplay: new Gameplay(),
//     gameName: '',
//     gameKey: '',
//     eventBus: 0,
//   };
//   return wg;
// };

export interface Webgal {
  ctx: Record<string, any>;
  use: (plugin: Plugin) => Webgal;
  bus: ReturnType<typeof createBus>;
}
export interface Plugin {
  install: (wg: Webgal) => void;
}

export const createWebgal = (): Webgal => {
  const wg: Webgal = {
    ctx: {},
    use: (plugin: Plugin) => {
      plugin.install(wg);
      return wg;
    },
    bus: createBus(),
  };
  return wg;
};
