import type { CompatArticle } from './config';
import { concat, pipe } from '@/lib/utils';
import type { ParserPlugin } from '@/lib/parser';
import * as plugins from '@/lib/plugins';
import { type IAsset, fileType, type AssetsPrefetcher, type AssetSetter } from './config';
import type { CommandCodeList, ConfigMap } from './config';
import { commandType } from './config';
import { unique } from './utils';

export const commentPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => {
    if (section.header !== '' || section.body !== undefined) return section;
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

export const createCommandCodePlugin = (scriptConfigMap: ConfigMap): ParserPlugin => {
  return (input): CompatArticle => ({
    ...input,
    sections: input.sections.map((section) => {
      return {
        ...section,
        commandCode: scriptConfigMap.get(concat(section.header))?.scriptType ?? commandType.say,
      };
    }),
  });
};

export const sayPlugin: ParserPlugin = (input: CompatArticle) => ({
  ...input,
  sections: input.sections.map((section) => {
    if (section.commandCode !== commandType.say) return section;
    if (section.header === '' && section.body !== undefined) return section;
    return {
      ...section,
      attributes: [...section.attributes, { key: 'speaker', value: section.header }],
    };
  }),
});

export const createAddNextArgPlugin = (addNextArgList: CommandCodeList): ParserPlugin => {
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

export const createAssetSetterPlugin = (assetSetter: AssetSetter): ParserPlugin => {
  const _getChooseContent = (contentRaw: string): string => {
    const chooseList = contentRaw.split(/(?<!\\)\|/);
    const chooseKeyList: Array<string> = [];
    const chooseValueList: Array<string> = [];
    for (const choose of chooseList) {
      chooseKeyList.push(choose.split(/(?<!\\):/)[0] ?? '');
      chooseValueList.push(choose.split(/(?<!\\):/)[1] ?? '');
    }
    const parsedChooseList = chooseValueList.map((chooseValue) => {
      if (chooseValue.match(/\./)) {
        return assetSetter(chooseValue, fileType.scene);
      } else {
        return chooseValue;
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
  return (input: CompatArticle) => ({
    ...input,
    sections: input.sections.map((section) => {
      let _body;
      if (section.body === 'none' || section.body === '') {
        _body = '';
      } else {
        switch (section.commandCode) {
          case commandType.playEffect: {
            _body = assetSetter(section.body!, fileType.vocal);
            break;
          }
          case commandType.changeBg: {
            _body = assetSetter(section.body!, fileType.background);
            break;
          }
          case commandType.changeFigure: {
            _body = assetSetter(section.body!, fileType.figure);
            break;
          }
          case commandType.bgm: {
            _body = assetSetter(section.body!, fileType.bgm);
            break;
          }
          case commandType.callScene: {
            _body = assetSetter(section.body!, fileType.scene);
            break;
          }
          case commandType.changeScene: {
            _body = assetSetter(section.body!, fileType.scene);
            break;
          }
          case commandType.miniAvatar: {
            _body = assetSetter(section.body!, fileType.figure);
            break;
          }
          case commandType.video: {
            _body = assetSetter(section.body!, fileType.video);
            break;
          }
          case commandType.choose: {
            _body = _getChooseContent(section.body!);
            break;
          }
          case commandType.unlockBgm: {
            _body = assetSetter(section.body!, fileType.bgm);
            break;
          }
          case commandType.unlockCg: {
            _body = assetSetter(section.body!, fileType.background);
            break;
          }
          default: {
            _body = section.body!;
            break;
          }
        }
      }
      return {
        ...section,
        body: _body,
        attributes: section.attributes.map((attribute) => {
          if (attribute.value === true) {
            if (attribute.key!.toLowerCase().match(/\.(ogg|mp3|wav|flac)$/)) {
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

export const assetsScannerPlugin: ParserPlugin = (input: CompatArticle): CompatArticle => {
  const _sections = input.sections.map((section) => {
    const _assets: Array<IAsset> = [];
    if (section.commandCode === commandType.say) {
      section.attributes.forEach((attribute) => {
        if (attribute.key === 'vocal') {
          _assets.push({
            name: attribute.value as string,
            url: attribute.value as string,
            lineNumber: 0, // ?? TODO: 获取语句行号
            // lineNumber: section.position.line,
            type: fileType.vocal,
          });
        }
      });
    }
    if (!section.body || section.body === 'none') {
      return { ...section, assets: _assets };
    }
    switch (section.commandCode) {
      case commandType.changeBg: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: 0,
          type: fileType.background,
        });
        break;
      }
      case commandType.changeFigure: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: 0,
          type: fileType.figure,
        });
        break;
      }
      case commandType.miniAvatar: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: 0,
          type: fileType.figure,
        });
        break;
      }
      case commandType.video: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: 0,
          type: fileType.video,
        });
        break;
      }
      case commandType.bgm: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: 0,
          type: fileType.bgm,
        });
        break;
      }
      default: {
        break;
      }
    }
    return { ...section, assets: _assets };
  });
  return {
    ...input,
    sections: _sections,
    assets: unique(_sections.map((section) => section.assets).flat()),
  };
};

export const subSceneScannerPlugin: ParserPlugin = (input: CompatArticle): CompatArticle => {
  const _sections = input.sections.map((section) => {
    const _sub: Array<string> = [];
    if (section.commandCode === commandType.changeScene || section.commandCode === commandType.callScene) {
      _sub.push(section.body!);
    }
    if (section.commandCode === commandType.choose) {
      const chooseList = section.body!.split('|');
      const chooseValueList = chooseList.map((choose) => choose.split(':')[1] ?? '');
      chooseValueList.forEach((chooseValue) => {
        if (chooseValue.match(/\./)) {
          _sub.push(chooseValue);
        }
      });
    }
    return { ...section, sub: _sub };
  });
  return {
    ...input,
    sections: _sections,
    sub: [...new Set(_sections.map((section) => section.sub).flat())],
  };
};

export const createAssetsPrefetcherPlugin = (assetsPrefetcher: AssetsPrefetcher): ParserPlugin => {
  return (input: CompatArticle) => {
    if (input.assets) assetsPrefetcher(input.assets);
    return input;
  };
};

export const createCompatPlugin = (options: {
  assetsPrefetcher: AssetsPrefetcher;
  assetSetter: AssetSetter;
  addNextArgList: CommandCodeList;
  scriptConfigMap: ConfigMap;
}): ParserPlugin => {
  const _compatPluginComposer = pipe(
    plugins.trimPlugin,
    plugins.attributePlugin,
    commentPlugin,
    undefinedPlugin,
    createCommandCodePlugin(options.scriptConfigMap),
    sayPlugin,
    createAddNextArgPlugin(options.addNextArgList),
    createAssetSetterPlugin(options.assetSetter),
    assetsScannerPlugin,
    subSceneScannerPlugin,
    createAssetsPrefetcherPlugin(options.assetsPrefetcher)
  );
  return (input) => _compatPluginComposer(input);
};
