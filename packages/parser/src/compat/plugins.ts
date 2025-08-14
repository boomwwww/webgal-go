import type { ArticleWithAssets, SectionWithAssets } from '@/lib/config';
import { concat, pipe } from '@/lib/utils';
import type { PreParser } from '@/lib/pre';
import type { ParserPlugin } from '@/lib/parser';
import * as plugins from '@/lib/plugins';
import { type IAsset, fileType, type AssetsPrefetcher, type AssetSetter } from './config';
import type { CommandList, ConfigMap } from './config';
import { commandType } from './config';

export const commentPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => {
    if (section.header === '' && section.body !== undefined) return section;
    return {
      ...section,
      header: 'comment',
      body: section.comment,
      attributes: [
        {
          key: 'next',
          value: true,
        },
      ],
    };
  }),
});

export const undefinedPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    header: concat(section.header),
    body: concat(section.body),
    attributes: section.attributes.map((attribute) => ({
      key: concat(attribute.key),
      value: attribute.value === undefined ? true : attribute.value,
    })),
    comment: concat(section.comment),
  })),
});

export interface CompatArticle extends ArticleWithAssets<IAsset> {
  sections: Array<CompatSection>;
}

export interface CompatSection extends SectionWithAssets<IAsset> {
  commandCode?: number;
}

// todo
export const createCommandCodePlugin = (scriptConfigMap: ConfigMap): ParserPlugin => {
  const _scriptConfigMap = scriptConfigMap;
  return (input): CompatArticle => ({
    ...input,
    sections: input.sections.map((section) => {
      return {
        ...section,
        commandCode: _scriptConfigMap.get(concat(section.header))?.scriptType ?? commandType.say,
      };
    }),
  });
};

export const createAddNextArgPlugin = (addNextArgList: CommandList): ParserPlugin => {
  return (input: CompatArticle) => ({
    ...input,
    sections: input.sections.map((section) => {
      if (addNextArgList.includes(section.commandCode!)) {
        section.attributes.push({
          key: 'next',
          value: true,
        });
      }
      return section;
    }),
  });
};

const getChooseContent = (contentRaw: string, assetSetter: AssetSetter): string => {
  const chooseList = contentRaw.split(/(?<!\\)\|/);
  const chooseKeyList: Array<string> = [];
  const chooseValueList: Array<string> = [];
  for (const e of chooseList) {
    chooseKeyList.push(e.split(/(?<!\\):/)[0] ?? '');
    chooseValueList.push(e.split(/(?<!\\):/)[1] ?? '');
  }
  const parsedChooseList = chooseValueList.map((e) => {
    if (e.match(/\./)) {
      return assetSetter(e, fileType.scene);
    } else {
      return e;
    }
  });
  let ret = '';
  for (let i = 0; i < chooseKeyList.length; i++) {
    if (i !== 0) {
      ret = ret + '|';
    }
    ret = ret + `${chooseKeyList[i]}:${parsedChooseList[i]}`;
  }
  return ret;
};

export const createAssetsPrefetcherPlugin = (assetsPrefetcher: AssetsPrefetcher): ParserPlugin => {
  return (input: CompatArticle) => {
    if (input.assets) assetsPrefetcher(input.assets);
    return input;
  };
};

export const createAssetSetterPlugin = (assetSetter: AssetSetter): ParserPlugin => {
  return (input: CompatArticle) => ({
    ...input,
    sections: input.sections.map((section) => {
      let body = '';
      switch (section.commandCode) {
        case commandType.playEffect: {
          body = assetSetter(section.body!, fileType.vocal);
          break;
        }
        case commandType.changeBg: {
          body = assetSetter(section.body!, fileType.background);
          break;
        }
        case commandType.changeFigure: {
          body = assetSetter(section.body!, fileType.figure);
          break;
        }
        case commandType.bgm: {
          body = assetSetter(section.body!, fileType.bgm);
          break;
        }
        case commandType.callScene: {
          body = assetSetter(section.body!, fileType.scene);
          break;
        }
        case commandType.changeScene: {
          body = assetSetter(section.body!, fileType.scene);
          break;
        }
        case commandType.miniAvatar: {
          body = assetSetter(section.body!, fileType.figure);
          break;
        }
        case commandType.video: {
          body = assetSetter(section.body!, fileType.video);
          break;
        }
        case commandType.choose: {
          body = getChooseContent(section.body!, assetSetter);
          break;
        }
        case commandType.unlockBgm: {
          body = assetSetter(section.body!, fileType.bgm);
          break;
        }
        case commandType.unlockCg: {
          body = assetSetter(section.body!, fileType.background);
          break;
        }
        default: {
          body = section.body!;
          break;
        }
      }
      return {
        ...section,
        body: body,
        attributes: section.attributes.map((attribute) => {
          if (attribute.value === true) {
            if (attribute.key!.toLowerCase().match(/\.(ogg|mp3|wav)$/)) {
              return {
                key: 'vocal',
                value: assetSetter(attribute.key!, fileType.vocal),
              };
            }
          }
          return attribute;
        }),
      };
    }),
  });
};

export const createCompatPlugin = (options: {
  preParser: PreParser;
  assetsPrefetcher: AssetsPrefetcher;
  assetSetter: AssetSetter;
  addNextArgList: CommandList;
  scriptConfigMap: ConfigMap;
}): ParserPlugin => {
  const _compatPluginPipe = pipe(
    plugins.trimPlugin,
    plugins.attributePlugin,
    commentPlugin,
    undefinedPlugin,
    createCommandCodePlugin(options.scriptConfigMap),
    createAddNextArgPlugin(options.addNextArgList),
    // todo
    createAssetSetterPlugin(options.assetSetter),
    createAssetsPrefetcherPlugin(options.assetsPrefetcher)
  );
  return (input) => _compatPluginPipe(input);
};
