import type { Article, Section } from '@/lib/config';
import { pipe } from '@/lib/utils';
import type { ParserPlugin } from '@/lib/parser';
import type { ArticleWithAssets } from '@/lib/plugins';
import * as plugins from '@/lib/plugins';
import {
  type IAsset,
  fileType,
  type AssetsPrefetcher,
  type AssetSetter,
  type ConfigMap,
  commandType,
  CommandList,
} from './config';

interface ArticleWithCommandCode extends Article {
  sections: Array<SectionWithCommandCode>;
}

interface SectionWithCommandCode extends Section {
  commandCode?: number;
}

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

function getChooseContent(contentRaw: string, assetSetter: (fileName: string, assetType: fileType) => string): string {
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
  return (input: ArticleWithCommandCode & ArticleWithAssets<IAsset>) => {
    if (input.assets) {
      _assetsPrefetcher(input.assets);
    }
    return input;
  };
};

export const createAssetSetterPlugin = (assetSetter: AssetSetter): ParserPlugin => {
  const _assetSetter = assetSetter;
  return (input: ArticleWithCommandCode & ArticleWithAssets<IAsset>) => ({
    ...input,
    sections: input.sections.map((section) => {
      let body = '';
      switch (section.header) {
        case 'playEffect': {
          body = _assetSetter(section.body, fileType.vocal);
          break;
        }
        case 'changeBg': {
          body = _assetSetter(section.body, fileType.background);
          break;
        }
        case 'changeFigure': {
          body = _assetSetter(section.body, fileType.figure);
          break;
        }
        case 'bgm': {
          body = _assetSetter(section.body, fileType.bgm);
          break;
        }
        case 'callScene': {
          body = _assetSetter(section.body, fileType.scene);
          break;
        }
        case 'changeScene': {
          body = _assetSetter(section.body, fileType.scene);
          break;
        }
        case 'miniAvatar': {
          body = _assetSetter(section.body, fileType.figure);
          break;
        }
        case 'video': {
          body = _assetSetter(section.body, fileType.video);
          break;
        }
        case 'choose': {
          body = getChooseContent(section.body, _assetSetter);
          break;
        }
        case 'unlockBgm': {
          body = _assetSetter(section.body, fileType.bgm);
          break;
        }
        case 'unlockCg': {
          body = _assetSetter(section.body, fileType.background);
          break;
        }
        default: {
          body = section.body;
          break;
        }
      }
      return {
        ...section,
        body: body,
        attributes: section.attributes.map((attribute) => {
          if (attribute.value === true) {
            if (attribute.key.toLowerCase().match(/\.(ogg|mp3|wav)$/)) {
              return {
                key: 'vocal',
                value: _assetSetter(attribute.key, fileType.vocal),
              };
            }
          }
          switch (attribute.key.toLowerCase()) {
            case 'vocal': {
              return {
                key: 'vocal',
                value: _assetSetter(attribute.value.toString(), fileType.vocal),
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
  assetsPrefetcher: AssetsPrefetcher;
  assetSetter: AssetSetter;
  addNextArgList: CommandList;
  scriptConfigMap: ConfigMap;
}): ParserPlugin => {
  const _compatPluginPipe = pipe(
    plugins.trimPlugin,
    plugins.attributePlugin,
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
