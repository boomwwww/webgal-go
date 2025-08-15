import SceneParser, { SCRIPT_CONFIG, ADD_NEXT_ARG_LIST } from '@/index';

describe('global-test', () => {
  const parser = new SceneParser(
    (_assetList) => {},
    (fileName, _fileType) => fileName,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG
  );
  it('should work', () => {
    console.log(
      JSON.stringify(
        parser.parse(
          `bgm:s_Title.mp3 -volume=80 -enter=3000;
unlockBgm:s_Title.mp3 -name=雲を追いかけて;
intro:你好|欢迎来到 {egine} 的世界;
changeBg:WebGalEnter.png -next;
setTransition: -target=bg-main -exit=shockwaveOut;
:你好|欢迎来到 {egine} 的世界;
changeBg:bg.png -next;
setTransition: -target=bg-main -enter=shockwaveIn -next;
unlockCg:bg.png -name=良い夜; // 解锁CG并赋予名称
changeFigure:stand.png -left -enter=enter-from-left -next;
miniAvatar:miniavatar.png;
{heroine}:欢迎使用 {egine}！这是一款全新的网页端视觉小说引擎。 -v1.wav;
changeFigure:stand2.png -right -next;
{egine} 是使用 Web 技术开发的引擎，因此在网页端有良好的表现。 -v2.wav;
由于这个特性，如果你将 {egine} 部署到服务器或网页托管平台上，玩家只需要一串链接就可以开始游玩！ -v3.wav;`,
          ``,
          ``
        ),
        undefined,
        2
      )
    );
  });
});
