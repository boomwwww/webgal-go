import { Sentence, Scene, PluginParser } from './config';

export const trimPlugin: PluginParser = {
  name: 'trim',
  parse: (input) => ({
    ...input,
    sentenceList: input.sentenceList.map((sentence) => ({
      ...sentence,
      header: sentence.header.trim(),
      body: sentence.body.trim(),
      attributes: sentence.attributes.map((attribute) => ({
        key: attribute.key.trim(),
        value: typeof attribute.value === 'string' ? attribute.value.trim() : attribute.value,
      })),
    })),
  }),
};

export const createDequotationPlugin = (quotations: Array<[string, string]>): PluginParser => {
  const removeQuotation = (str: string) => {
    for (const [quotationStart, quotationEnd] of quotations) {
      if (str.startsWith(quotationStart) && str.endsWith(quotationEnd)) {
        return str.slice(quotationStart.length, -quotationEnd.length);
      }
    }
    return str;
  };
  return {
    name: 'dequotation',
    parse: (input) => ({
      ...input,
      sentenceList: input.sentenceList.map((sentence) => ({
        ...sentence,
        header: removeQuotation(sentence.header),
        body: removeQuotation(sentence.body),
        attributes: sentence.attributes.map((attribute) => ({
          key: removeQuotation(attribute.key),
          value: typeof attribute.value === 'string' ? removeQuotation(attribute.value) : attribute.value,
        })),
      })),
    }),
  };
};

export const attributePlugin: PluginParser = {
  name: 'attribute',
  parse: (input) => ({
    ...input,
    sentenceList: input.sentenceList.map((sentence) => ({
      ...sentence,
      attributes: sentence.attributes.map((attribute) => ({
        key: attribute.key,
        value:
          attribute.value === 'true'
            ? true
            : attribute.value === 'false'
            ? false
            : attribute.value !== '' && !isNaN(Number(attribute.value))
            ? Number(attribute.value)
            : attribute.value,
      })),
    })),
  }),
};
//assetSetter
// export const createSetAssetsPlugin = <T>(assetSetter: (fileName: string, assetType: T) => string): PluginParser => ({
//   name: 'setAssets',
//   parse: (input) => {
//     return {
//       ...input,
//       sentenceList: input.sentenceList.map((sentence) => ({
//         ...sentence,
//       })),
//     };
//   },
// });

// interface SentenceWithAssets extends Sentence {
//   sentenceAssets: Array<IAsset>;
// }

interface SceneWithAssets<T> extends Scene {
  assetList?: Array<T>;
}

export const createAssetsPrefetcherPlugin = <T>(assetsPrefetcher: (assetList: T[]) => void): PluginParser => ({
  name: 'assetsPrefetcher',
  parse: (input: SceneWithAssets<T>) => {
    if (input.assetList) {
      assetsPrefetcher(input.assetList);
    }
    return input;
  },
});
