import * as fs from 'node:fs'
import * as path from 'node:path'
import { SceneParser, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from '@/compat'

describe('SceneParser', () => {
  const test2Txt = fs.readFileSync(path.join(__dirname, './scene/test2.txt'), 'utf-8')
  const sceneParser = new SceneParser(
    (_assetList) => {},
    (assetName, _assetType) => assetName,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  )
  it('should work', () => {
    expect(sceneParser).toBeDefined()
    expect(sceneParser.parse(test2Txt, '', '')).toBeDefined()
    // console.log(JSON.stringify(sceneParser.parse(test2Txt, '', ''), undefined, 2));
  })
})
