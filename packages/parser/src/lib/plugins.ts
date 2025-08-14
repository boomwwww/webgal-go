import { commandType } from '@/compat/config';
import type { Article, Section } from './config';
import type { ParserPlugin } from './parser';

export const trimPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    header: section.header.trim(),
    body: section.body.trim(),
    attributes: section.attributes.map((attribute) => ({
      key: attribute.key.trim(),
      value: typeof attribute.value === 'string' ? attribute.value.trim() : attribute.value,
    })),
  })),
});

export const createDequotationPlugin = (quotations: Array<[string, string]>): ParserPlugin => {
  const removeQuotation = (str: string) => {
    for (const [quotationStart, quotationEnd] of quotations) {
      if (str.startsWith(quotationStart) && str.endsWith(quotationEnd)) {
        return str.slice(quotationStart.length, -quotationEnd.length);
      }
    }
    return str;
  };
  return (input) => ({
    ...input,
    sections: input.sections.map((section) => ({
      ...section,
      header: removeQuotation(section.header),
      body: removeQuotation(section.body),
      attributes: section.attributes.map((attribute) => ({
        key: removeQuotation(attribute.key),
        value: typeof attribute.value === 'string' ? removeQuotation(attribute.value) : attribute.value,
      })),
    })),
  });
};

export const attributePlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    attributes: section.attributes.map((attribute) => ({
      key: attribute.key,
      value: ['true', 'True', 'TRUE'].includes(attribute.value.toString())
        ? true
        : ['false', 'False', 'FALSE'].includes(attribute.value.toString())
        ? false
        : attribute.value !== '' && !isNaN(Number(attribute.value))
        ? Number(attribute.value)
        : attribute.value,
    })),
  })),
});

interface ArticleWithAssets<T> extends Article {
  sections: Array<SectionWithAssets<T>>;
  assets?: Array<T>;
}

interface SectionWithAssets<T> extends Section {
  assets?: Array<T>;
}

function getChooseContent<T extends { [key: string]: number }>(
  contentRaw: string,
  assetSetter: (fileName: string, assetType: T[keyof T]) => string,
  fileType: T
): string {
  const chooseList = contentRaw.split(/(?<!\\)\|/);
  const chooseKeyList: Array<string> = [];
  const chooseValueList: Array<string> = [];
  for (const e of chooseList) {
    chooseKeyList.push(e.split(/(?<!\\):/)[0] ?? '');
    chooseValueList.push(e.split(/(?<!\\):/)[1] ?? '');
  }
  const parsedChooseList = chooseValueList.map((e) => {
    if (e.match(/\./)) {
      return assetSetter(e, fileType.scene as T[keyof T]);
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

// assetSetter
export const createAssetSetterPlugin = <T extends { [key: string]: number }>(
  assetSetter: (fileName: string, assetType: T[keyof T]) => string,
  fileType: T
): ParserPlugin => {
  return (input) => ({
    ...input,
    sections: input.sections.map((section) => {
      let body = '';
      switch (section.header) {
        case 'playEffect': {
          body = assetSetter(section.body, fileType.vocal as T[keyof T]);
          break;
        }
        case 'changeBg': {
          body = assetSetter(section.body, fileType.background as T[keyof T]);
          break;
        }
        case 'changeFigure': {
          body = assetSetter(section.body, fileType.figure as T[keyof T]);
          break;
        }
        case 'bgm': {
          body = assetSetter(section.body, fileType.bgm as T[keyof T]);
          break;
        }
        case 'callScene': {
          body = assetSetter(section.body, fileType.scene as T[keyof T]);
          break;
        }
        case 'changeScene': {
          body = assetSetter(section.body, fileType.scene as T[keyof T]);
          break;
        }
        case 'miniAvatar': {
          body = assetSetter(section.body, fileType.figure as T[keyof T]);
          break;
        }
        case 'video': {
          body = assetSetter(section.body, fileType.video as T[keyof T]);
          break;
        }
        case 'choose': {
          body = getChooseContent<T>(section.body, assetSetter, fileType);
          break;
        }
        case 'unlockBgm': {
          body = assetSetter(section.body, fileType.bgm as T[keyof T]);
          break;
        }
        case 'unlockCg': {
          body = assetSetter(section.body, fileType.background as T[keyof T]);
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
                value: assetSetter(attribute.key, fileType.vocal as T[keyof T]),
              };
            }
          }
          switch (attribute.key.toLowerCase()) {
            case 'vocal': {
              return {
                key: 'vocal',
                value: assetSetter(attribute.value.toString(), fileType.vocal as T[keyof T]),
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

export const createAssetsPrefetcherPlugin = <T>(assetsPrefetcher: (assets: Array<T>) => void): ParserPlugin => {
  return (input: ArticleWithAssets<T>) => {
    if (input.assets) {
      assetsPrefetcher(input.assets);
    }
    return input;
  };
};

// todo
export const createAddNextArgPlugin = (addNextArgList: Array<commandType>): ParserPlugin => {
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

// todo
export const createScriptPlugin = (
  scriptConfigMap: Map<string, { scriptString: string; scriptType: commandType }>
): ParserPlugin => {
  return (input) => ({
    ...input,
    sections: input.sections.map((section) => {
      return section;
    }),
  });
};
