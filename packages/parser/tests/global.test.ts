import SceneParser, { SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@/index';

describe('global-test', () => {
  const parser = new SceneParser(
    (_assetList) => {},
    (fileName, _fileType) => fileName,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG
  );
  it('should work', () => {
    expect(parser.parse('', '', '')).toEqual([]);
  });
});
