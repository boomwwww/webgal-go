import { createParser } from '@/index'

describe('global-test', () => {
  it('createParser', () => {
    const parser = createParser()
    console.log(
      parser.tokenParse(`
intro: "你好|欢迎来到 {engine} 的世界"
changeBg:WebGalEnter.png -next;
setTransition: -target=bg-main -exit=shockwaveOut;
:你好|欢迎来到 {engine} 的世界;
changeBg:bg.png -next;
setTransition: -target=bg-main -enter=shockwaveIn -next;
unlockCg:bg.png -name=良い夜; // 解锁CG并赋予名称
changeFigure:stand.png -left -enter=enter-from-left -next;
miniAvatar:miniAvatar.png;
{heroine}:欢迎使用 {engine}！这是一款全新的网页端视觉小说引擎。 -v1.wav;
changeFigure:stand2.png -right -next;
{engine} 是使用 Web 技术开发的引擎，因此在网页端有良好的表现。 -v2.wav;
由于这个特性，如果你将 {engine} 部署到服务器或网页托管平台上，玩家只需要一串链接就可以开始游玩！ -v3.wav;`),
    )
  })
})
