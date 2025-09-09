import { ISceneData } from './sceneInterface'

interface SceneManager {
  settledScenes: Array<string>
  settledAssets: Array<string>
  sceneData: ISceneData
  lockSceneWrite: boolean
  reset: () => void
}

const createSceneContext = () => {
  return {
    currentSentenceId: 0, // 当前语句ID
    sceneStack: [],
    // 默认场景，没有数据
    currentScene: {
      sceneName: '', // 场景名称
      sceneUrl: '', // 场景url
      sentenceList: [], // 语句列表
      assetsList: [], // 资源列表
      subSceneList: [], // 子场景列表
    },
  }
}

// export class SceneManager {
//   public settledScenes: Array<string> = [];
//   public settledAssets: Array<string> = [];
//   public sceneData: ISceneData = createSceneContext();
//   public lockSceneWrite = false;

//   public resetScene() {
//     this.sceneData = createSceneContext();
//   }
// }

export const createSceneManager = (): SceneManager => {
  const sceneManager: SceneManager = {
    settledScenes: [],
    settledAssets: [],
    sceneData: createSceneContext(),
    lockSceneWrite: false,
    reset: () => {
      sceneManager.sceneData = createSceneContext()
    },
  }
  return sceneManager
}
