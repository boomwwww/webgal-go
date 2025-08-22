export default function EnterPage() {
  return (
    <>
      {/* 快速显示落地页，让用户感知不到加载的过程 */}
      <div id="ebg"></div>
      <div id="Title_enter_page">
        {/* 落地页背景 */}
        <div id="Title_bg_container"></div>
        {/* 点击后的白色渐变 */}
        <div id="Title_white_container"></div>
        {/* 落地页文字 */}
        <div id="Title_enter_text">
          <div className="toCenter">
            <div className="StartButton">PRESS THE SCREEN TO START</div>
          </div>
          <div className="link-to-github">
            <div>
              Powered by
              <a href="https://github.com/OpenWebGAL/WebGAL" target="_blank">
                WebGAL
              </a>
              Framework
            </div>
          </div>
        </div>
      </div>
      {/* 紧急回避 */}
      <div id="panic-overlay"></div>
    </>
  )
}
