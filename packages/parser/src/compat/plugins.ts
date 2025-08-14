import type { Article, Section } from '@/lib/config';
import { concat, pipe } from '@/lib/utils';
import type { PreParser } from '@/lib/pre';
import type { ParserPlugin } from '@/lib/parser';
import type { ArticleWithAssets, SectionWithAssets } from '@/lib/plugins';
import * as plugins from '@/lib/plugins';
import { type IAsset, fileType, type AssetsPrefetcher, type AssetSetter } from './config';
import type { CommandList, ConfigMap } from './config';
import { commandType } from './config';

export const undefinedPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    header: concat(section.header),
    body: concat(section.body),
    attributes: section.attributes.map((attribute) => ({
      key: concat(attribute.key),
      value: attribute.value === undefined ? '' : attribute.value,
    })),
    comment: concat(section.comment),
  })),
});

interface ArticleWithCommandCode extends Article {
  sections: Array<SectionWithCommandCode>;
}

interface SectionWithCommandCode extends Section {
  commandCode?: number;
}

export type CompatArticle = ArticleWithCommandCode & ArticleWithAssets<IAsset>;

export type CompatSection = SectionWithCommandCode & SectionWithAssets<IAsset>;

// todo
export const createScriptPlugin = (scriptConfigMap: ConfigMap): ParserPlugin => {
  const _scriptConfigMap = scriptConfigMap;
  return (input): ArticleWithCommandCode => ({
    ...input,
    sections: input.sections.map((section) => {
      return section;
    }),
  });
};

// todo
export const createAddNextArgPlugin = (addNextArgList: CommandList): ParserPlugin => {
  return (input) => ({
    ...input,
    sections: input.sections.map((section) => {
      let commandCode = 0;
      while (true) {
        if (commandType[commandCode] === section.header) {
          break;
        }
        if (commandType[commandCode] === undefined) {
          commandCode = 0;
          break;
        }
        commandCode++;
      }
      if (addNextArgList.includes(commandCode)) {
        section.attributes.push({
          key: 'addNext',
          value: true,
        });
      }
      return section;
    }),
  });
};

function getChooseContent(contentRaw: string, assetSetter: AssetSetter): string {
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
}

export const createAssetsPrefetcherPlugin = (assetsPrefetcher: AssetsPrefetcher): ParserPlugin => {
  const _assetsPrefetcher = assetsPrefetcher;
  return (input: CompatArticle) => {
    if (input.assets) {
      _assetsPrefetcher(input.assets);
    }
    return input;
  };
};

export const createAssetSetterPlugin = (assetSetter: AssetSetter): ParserPlugin => {
  const _assetSetter = assetSetter;
  return (input: CompatArticle) => ({
    ...input,
    sections: input.sections.map((section) => {
      let body = '';
      switch (section.header) {
        case 'playEffect': {
          body = _assetSetter(String(section.body), fileType.vocal); // todo fix String
          break;
        }
        case 'changeBg': {
          body = _assetSetter(String(section.body), fileType.background);
          break;
        }
        case 'changeFigure': {
          body = _assetSetter(String(section.body), fileType.figure);
          break;
        }
        case 'bgm': {
          body = _assetSetter(String(section.body), fileType.bgm);
          break;
        }
        case 'callScene': {
          body = _assetSetter(String(section.body), fileType.scene);
          break;
        }
        case 'changeScene': {
          body = _assetSetter(String(section.body), fileType.scene);
          break;
        }
        case 'miniAvatar': {
          body = _assetSetter(String(section.body), fileType.figure);
          break;
        }
        case 'video': {
          body = _assetSetter(String(section.body), fileType.video);
          break;
        }
        case 'choose': {
          body = getChooseContent(String(section.body), _assetSetter);
          break;
        }
        case 'unlockBgm': {
          body = _assetSetter(String(section.body), fileType.bgm);
          break;
        }
        case 'unlockCg': {
          body = _assetSetter(String(section.body), fileType.background);
          break;
        }
        default: {
          body = String(section.body);
          break;
        }
      }
      return {
        ...section,
        body: body,
        attributes: section.attributes.map((attribute) => {
          if (attribute.value === true) {
            // todo fix String
            if (
              String(attribute.key)
                .toLowerCase()
                .match(/\.(ogg|mp3|wav)$/)
            ) {
              return {
                key: 'vocal',
                value: _assetSetter(String(attribute.key), fileType.vocal),
              };
            }
          }
          switch (String(attribute.key).toLowerCase()) {
            case 'vocal': {
              return {
                key: 'vocal',
                value: _assetSetter(String(attribute.value).toString(), fileType.vocal),
              };
            }
            default: {
              break;
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
    plugins.commentPlugin,
    undefinedPlugin,
    createScriptPlugin(options.scriptConfigMap),
    createAddNextArgPlugin(options.addNextArgList),
    // todo
    createAssetSetterPlugin(options.assetSetter),
    createAssetsPrefetcherPlugin(options.assetsPrefetcher)
  );
  return (input) => {
    return _compatPluginPipe(input);
  };
};
