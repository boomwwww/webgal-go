export const createCommonSceneParser = (commonConfig: any) => {
  return {
    parse: (str: string) => {
      return {
        sentenceList: [],
      } as { sentenceList: any[]; assetList?: any[]; subSceneList?: any[] };
    },
  };
};
