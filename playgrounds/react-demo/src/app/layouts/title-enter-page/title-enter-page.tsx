import { useTitleEnterPage } from './hooks'

export default function TitleEnterPage() {
  useTitleEnterPage()
  return (
    <>
      {/* 背景模糊 */}
      <div className="html-body__effect-background"></div>
      {/* 落地页 */}
      <div className="html-body__title-enter">
        <div className="title-enter__initial-background"></div>
        <div className="title-enter__white-background"></div>
        <div className="title-enter__container">
          <div className="title-enter-container__center-text">
            <div>PRESS THE SCREEN TO START</div>
          </div>
          <div className="title-enter-container__link-to-github">
            <div>
              Powered by <a> WebGAL </a> Framework
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
