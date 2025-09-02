import * as fsp from 'fs/promises'
import * as path from 'node:path'
import SceneParser from '@/index'
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from '@/index'
import { commandType, type ISentence } from '@/index'
import { fileType } from '@/index'

describe('compat: parser', () => {
  const parser = new SceneParser(
    (_assetList) => {},
    (fileName, _assetType) => fileName,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG
  )

  test('label', async () => {
    const sceneRaw = await fsp.readFile(path.join(__dirname, './scene/test-resources/start.txt'))
    const sceneText = sceneRaw.toString()

    const result = parser.parse(sceneText, 'start', '/start.txt')
    const expectSentenceItem: ISentence = {
      command: commandType.label,
      commandRaw: 'label',
      content: 'end',
      args: [{ key: 'next', value: true }],
      sentenceAssets: [],
      subScene: [],
    }
    expect(result.sentenceList).toContainEqual(expectSentenceItem)
  })

  test('args', async () => {
    const sceneRaw = await fsp.readFile(path.join(__dirname, './scene/test-resources/start.txt'))
    const sceneText = sceneRaw.toString()

    const result = parser.parse(sceneText, 'start', '/start.txt')
    const expectSentenceItem: ISentence = {
      command: commandType.changeFigure,
      commandRaw: 'changeFigure',
      content: 'm2.png',
      args: [
        { key: 'left', value: true },
        { key: 'next', value: true },
      ],
      sentenceAssets: [{ name: 'm2.png', url: 'm2.png', type: fileType.figure, lineNumber: 25 }],
      subScene: [],
    }
    expect(result.sentenceList).toContainEqual(expectSentenceItem)
  })

  test('choose', async () => {
    const sceneRaw = await fsp.readFile(path.join(__dirname, './scene/test-resources/choose.txt'))
    const sceneText = sceneRaw.toString()

    const result = parser.parse(sceneText, 'choose', '/choose.txt')
    const expectSentenceItem: ISentence = {
      command: commandType.choose,
      commandRaw: 'choose',
      content: '',
      args: [],
      sentenceAssets: [],
      subScene: [],
    }
    expect(result.sentenceList).toContainEqual(expectSentenceItem)
  })

  test('long-script', async () => {
    const sceneRaw = await fsp.readFile(path.join(__dirname, './scene/test-resources/long-script.txt'))
    const sceneText = sceneRaw.toString()

    // console.log('line count:', sceneText.split('\n').length);
    console.time('parse-time-consumed')
    const result = parser.parse(sceneText, 'start', '/start.txt')
    console.timeEnd('parse-time-consumed')
    const expectSentenceItem: ISentence = {
      command: commandType.label,
      commandRaw: 'label',
      content: 'end',
      args: [{ key: 'next', value: true }],
      sentenceAssets: [],
      subScene: [],
    }
    expect(result.sentenceList).toContainEqual(expectSentenceItem)
  })

  test('var', async () => {
    const sceneRaw = await fsp.readFile(path.join(__dirname, './scene/test-resources/var.txt'))
    const sceneText = sceneRaw.toString()

    const result = parser.parse(sceneText, 'var', '/var.txt')
    const expectSentenceItem: ISentence = {
      command: commandType.say,
      commandRaw: 'WebGAL',
      content: 'a=1?',
      args: [
        { key: 'speaker', value: 'WebGAL' },
        { key: 'when', value: 'a==1' },
      ],
      sentenceAssets: [],
      subScene: [],
    }
    expect(result.sentenceList).toContainEqual(expectSentenceItem)
  })

  test('config', async () => {
    const configFesult = parser.parseConfig(`
Game_name:欢迎使用WebGAL！;
Game_key:0f86dstRf;
Title_img:WebGAL_New_Enter_Image.png;
Title_bgm:s_Title.mp3;
Title_logos: 1.png | 2.png | Image Logo.png| -show -active=false -add=op! -count=3;This is a fake config, do not reference anything.
  `)
    expect(configFesult).toContainEqual({
      command: 'Title_logos',
      args: ['1.png', '2.png', 'Image Logo.png'],
      options: [
        { key: 'show', value: true },
        { key: 'active', value: false },
        { key: 'add', value: 'op!' },
        { key: 'count', value: 3 },
      ],
    })
  })

  test('config-stringify', async () => {
    const configFesult = parser.parseConfig(`
Game_name:欢迎使用WebGAL！;
Game_key:0f86dstRf;
Title_img:WebGAL_New_Enter_Image.png;
Title_bgm:s_Title.mp3;
Title_logos: 1.png | 2.png | Image Logo.png| -show -active=false -add=op! -count=3;This is a fake config, do not reference anything.
  `)
    const stringifyResult = parser.stringifyConfig(configFesult)
    const configResult2 = parser.parseConfig(stringifyResult)
    expect(configResult2).toContainEqual({
      command: 'Title_logos',
      args: ['1.png', '2.png', 'Image Logo.png'],
      options: [
        { key: 'show', value: true },
        { key: 'active', value: false },
        { key: 'add', value: 'op!' },
        { key: 'count', value: 3 },
      ],
    })
  })

  test('say statement', async () => {
    const result = parser.parse(`say:123 -speaker=xx;`, 'test', 'test')
    expect(result.sentenceList).toContainEqual({
      command: commandType.say,
      commandRaw: 'say',
      content: '123',
      args: [{ key: 'speaker', value: 'xx' }],
      sentenceAssets: [],
      subScene: [],
    })
  })

  test('wait command', async () => {
    const parser = new SceneParser(
      (_assetList) => {},
      (fileName, _assetType) => fileName,
      ADD_NEXT_ARG_LIST,
      SCRIPT_CONFIG
    )

    const result = parser.parse(`wait:1000;`, 'test', 'test')
    expect(result.sentenceList).toContainEqual({
      command: commandType.wait,
      commandRaw: 'wait',
      content: '1000',
      args: [],
      sentenceAssets: [],
      subScene: [],
    })
  })

  test('changeFigure with duration and animation args', async () => {
    const result = parser.parse(`changeFigure:stand.png -duration=1000 -enter=fadeIn -exit=fadeOut;`, 'test', 'test')
    expect(result.sentenceList).toContainEqual({
      command: commandType.changeFigure,
      commandRaw: 'changeFigure',
      content: 'stand.png',
      args: [
        { key: 'duration', value: 1000 },
        { key: 'enter', value: 'fadeIn' },
        { key: 'exit', value: 'fadeOut' },
      ],
      sentenceAssets: [{ name: 'stand.png', url: 'stand.png', type: fileType.figure, lineNumber: 1 }],
      subScene: [],
    })
  })

  test('changeBg with animation parameters', async () => {
    const result = parser.parse(
      `changeBg:background.jpg -duration=2000 -enter=slideIn -transform={"alpha":0.8};`,
      'test',
      'test'
    )
    expect(result.sentenceList).toContainEqual({
      command: commandType.changeBg,
      commandRaw: 'changeBg',
      content: 'background.jpg',
      args: [
        { key: 'duration', value: 2000 },
        { key: 'enter', value: 'slideIn' },
        { key: 'transform', value: '{"alpha":0.8}' },
      ],
      sentenceAssets: [{ name: 'background.jpg', url: 'background.jpg', type: fileType.background, lineNumber: 1 }],
      subScene: [],
    })
  })
})
