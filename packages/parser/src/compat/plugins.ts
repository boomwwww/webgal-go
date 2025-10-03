import { type ParserPlugin } from '@/lib/config'
import { pipe, unique } from '@/lib/utils'
import * as plugins from '@/lib/plugins'
import { type CompatArticle } from './config'
import { type Asset, FileCode, type AssetsPrefetcher, type AssetSetter } from './config'
import { CommandCode, type CommandCodeList, type CommandCodeMap } from './config'

export const createCommandCodePlugin = (scriptConfigMap: CommandCodeMap): ParserPlugin => {
  return (inputArticle): CompatArticle => ({
    ...inputArticle,
    sections: inputArticle.sections.map((section) => {
      if (section.header === '' && section.body === undefined) {
        return {
          ...section,
          commandCode: CommandCode.comment,
          body: section.comment,
          attributes: [
            {
              key: 'next',
              value: true,
            },
          ],
        }
      }
      return {
        ...section,
        commandCode: scriptConfigMap.get(section.header!)?.scriptType ?? CommandCode.say,
      }
    }),
  })
}

export const sayPlugin: ParserPlugin = (inputArticle: CompatArticle) => ({
  ...inputArticle,
  sections: inputArticle.sections.map((section) => {
    if (section.commandCode !== CommandCode.say) return section
    if (section.body === undefined) {
      return {
        ...section,
        body: section.header,
      }
    }
    if (section.header === '') return section
    const _attributes = section.attributes
    let _flag = _attributes.findIndex((attr) => attr.key === 'speaker')
    if (_flag === -1) {
      _attributes.unshift({
        key: 'speaker',
        value: section.header,
      })
    }
    return {
      ...section,
      attributes: _attributes,
    }
  }),
})

export const createAddNextArgPlugin = (addNextArgList: CommandCodeList): ParserPlugin => {
  return (inputArticle: CompatArticle) => ({
    ...inputArticle,
    sections: inputArticle.sections.map((section) => {
      if (addNextArgList.includes(section.commandCode!)) {
        section.attributes.push({
          key: 'next',
          value: true,
        })
      }
      return section
    }),
  })
}

export const createAssetSetterPlugin = (assetSetter: AssetSetter): ParserPlugin => {
  const _getChooseContent = (contentRaw: string): string => {
    const chooseList = contentRaw.split(/(?<!\\)\|/)
    const chooseKeyList: Array<string> = []
    const chooseValueList: Array<string> = []
    for (const choose of chooseList) {
      chooseKeyList.push(choose.split(/(?<!\\):/)[0] ?? '')
      chooseValueList.push(choose.split(/(?<!\\):/)[1] ?? '')
    }
    const parsedChooseList = chooseValueList.map((chooseValue) => {
      if (chooseValue.match(/\./)) {
        return assetSetter(chooseValue, FileCode.scene)
      } else {
        return chooseValue
      }
    })
    let ret = ''
    for (let i = 0; i < chooseKeyList.length; i++) {
      if (i !== 0) {
        ret = ret + '|'
      }
      ret = ret + `${chooseKeyList[i]}:${parsedChooseList[i]}`
    }
    return ret
  }
  return (inputArticle: CompatArticle) => ({
    ...inputArticle,
    sections: inputArticle.sections.map((section) => {
      let _body: string
      if (section.body === 'none' || section.body === '') {
        _body = ''
      } else {
        switch (section.commandCode) {
          case CommandCode.playEffect: {
            _body = assetSetter(section.body!, FileCode.vocal)
            break
          }
          case CommandCode.changeBg: {
            _body = assetSetter(section.body!, FileCode.background)
            break
          }
          case CommandCode.changeFigure: {
            _body = assetSetter(section.body!, FileCode.figure)
            break
          }
          case CommandCode.bgm: {
            _body = assetSetter(section.body!, FileCode.bgm)
            break
          }
          case CommandCode.callScene: {
            _body = assetSetter(section.body!, FileCode.scene)
            break
          }
          case CommandCode.changeScene: {
            _body = assetSetter(section.body!, FileCode.scene)
            break
          }
          case CommandCode.miniAvatar: {
            _body = assetSetter(section.body!, FileCode.figure)
            break
          }
          case CommandCode.video: {
            _body = assetSetter(section.body!, FileCode.video)
            break
          }
          case CommandCode.choose: {
            _body = _getChooseContent(section.body!)
            break
          }
          case CommandCode.unlockBgm: {
            _body = assetSetter(section.body!, FileCode.bgm)
            break
          }
          case CommandCode.unlockCg: {
            _body = assetSetter(section.body!, FileCode.background)
            break
          }
          default: {
            _body = section.body!
            break
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
                value: assetSetter(attribute.key!, FileCode.vocal),
              }
            }
          }
          return attribute
        }),
      }
    }),
  })
}

export const assetsScannerPlugin: ParserPlugin = (inputArticle: CompatArticle): CompatArticle => {
  const _sections = inputArticle.sections.map((section) => {
    const _assets: Array<Asset> = []
    if (section.commandCode === CommandCode.say) {
      section.attributes.forEach((attribute) => {
        if (attribute.key === 'vocal') {
          _assets.push({
            name: attribute.value as string,
            url: attribute.value as string,
            lineNumber: section.position.line,
            type: FileCode.vocal,
          })
        }
      })
    }
    if (!section.body || section.body === 'none') {
      return { ...section, assets: _assets }
    }
    switch (section.commandCode) {
      case CommandCode.changeBg: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: section.position.line,
          type: FileCode.background,
        })
        break
      }
      case CommandCode.changeFigure: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: section.position.line,
          type: FileCode.figure,
        })
        break
      }
      case CommandCode.miniAvatar: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: section.position.line,
          type: FileCode.figure,
        })
        break
      }
      case CommandCode.video: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: section.position.line,
          type: FileCode.video,
        })
        break
      }
      case CommandCode.bgm: {
        _assets.push({
          name: section.body,
          url: section.body,
          lineNumber: section.position.line,
          type: FileCode.bgm,
        })
        break
      }
      default: {
        break
      }
    }
    return { ...section, assets: _assets }
  })
  return {
    ...inputArticle,
    sections: _sections,
    assets: unique(_sections.map((section) => section.assets).flat()),
  }
}

export const subSceneScannerPlugin: ParserPlugin = (inputArticle: CompatArticle): CompatArticle => {
  const _sections = inputArticle.sections.map((section) => {
    const _sub: Array<string> = []
    if (section.commandCode === CommandCode.changeScene || section.commandCode === CommandCode.callScene) {
      _sub.push(section.body!)
    }
    if (section.commandCode === CommandCode.choose) {
      const chooseList = section.body!.split('|')
      const chooseValueList = chooseList.map((choose) => choose.split(':')[1] ?? '')
      chooseValueList.forEach((chooseValue) => {
        if (chooseValue.match(/\./)) {
          _sub.push(chooseValue)
        }
      })
    }
    return { ...section, sub: _sub }
  })
  return {
    ...inputArticle,
    sections: _sections,
    sub: unique(_sections.map((section) => section.sub).flat()),
  }
}

export const createAssetsPrefetcherPlugin = (assetsPrefetcher: AssetsPrefetcher): ParserPlugin => {
  return (inputArticle: CompatArticle) => {
    if (inputArticle.assets) assetsPrefetcher(inputArticle.assets)
    return inputArticle
  }
}

export const createCompatPlugin = (options: {
  assetsPrefetcher: AssetsPrefetcher
  assetSetter: AssetSetter
  addNextArgList: CommandCodeList
  scriptConfigMap: CommandCodeMap
  prePlugins?: Array<ParserPlugin>
  middlePlugins?: Array<ParserPlugin>
  postPlugins?: Array<ParserPlugin>
}): ParserPlugin => {
  const _prePlugin = pipe(...(options.prePlugins ?? []))
  const _middlePlugin = pipe(...(options.middlePlugins ?? []))
  const _postPlugin = pipe(...(options.postPlugins ?? []))
  const _compatPlugin = pipe(
    _prePlugin,
    plugins.trimPlugin,
    plugins.attributePlugin,
    createCommandCodePlugin(options.scriptConfigMap),
    _middlePlugin,
    sayPlugin,
    plugins.undefinedPlugin,
    createAddNextArgPlugin(options.addNextArgList),
    createAssetSetterPlugin(options.assetSetter),
    assetsScannerPlugin,
    subSceneScannerPlugin,
    createAssetsPrefetcherPlugin(options.assetsPrefetcher),
    _postPlugin,
  )
  return _compatPlugin
}
