import { PluginParser } from './config';

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
// export const createSetAssetsPlugin = (
//   assetSetter: (fileName: string, assetType: fileType) => string,
// ) => ({
//   parse: (input) => {},
// });
// export const createAssetsPrefetcherPlugin = (
//   assetsPrefetcher: (assetList: IAsset[]) => void,
// ): PluginParser => ({
//   name: 'assetsPrefetcher',
//   parse: (input) => {
//     assetsPrefetcher(
//       input.sentenceList.flatMap(
//         (sentence) => (sentence as any).sentenceAssets,
//       ),
//     );
//     return input;
//   },
// });
