import { useEffect } from 'react'

/** 首屏加载 */
export const useTitleEnter = () => {
  useEffect(() => {
    const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    let enterPromiseResolve: () => void
    const enterPromise = new Promise<void>((res) => {
      enterPromiseResolve = res
    })
    const renderPromise = new Promise<void>((res) => {
      // @ts-expect-error renderPromiseResolve is a global variable
      window.renderPromiseResolve = () => {
        res()
        // @ts-expect-error renderPromiseResolve is a global variable
        delete window.renderPromiseResolve
      }
    })
    /** 将播放bgm的事件发送出去 */
    Promise.all([enterPromise, renderPromise]).then(() => {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      })
      const target = document.getElementById('enter_game_target')
      if (target) {
        target.dispatchEvent(event)
      }
    })
    /** 点击屏幕，进入引擎主界面 */
    const enter = () => {
      const bgContainer = document.getElementById('Title_bg_container')
      if (bgContainer) {
        bgContainer.style.opacity = '0' // 调整标题背景的透明度
      }
      const enterText = document.getElementById('Title_enter_text')
      if (enterText) {
        enterText.style.opacity = '0' // 调整标题文字的透明度
      }
      const whiteContainer = document.getElementById('Title_white_container')
      setTimeout(() => {
        if (whiteContainer) {
          whiteContainer.style.opacity = '1'
        }
      }, 50) // 在50ms后开始显示白色渐变
      const title = document.getElementById('Title_enter_page')
      setTimeout(() => {
        if (title) title.style.opacity = '0'
      }, 500) //500ms后开始降低落地页透明度
      if (!isIOS && title) {
        title.style.pointerEvents = 'none' //落地页不再响应点击
        title.style.background = 'linear-gradient( #a1c4fd 0%, #c2e9fb 100%)' //改变标题渐变效果
      }
      setTimeout(() => {
        if (title) {
          title.style.display = 'none'
        }
      }, 2000) // 将落地页设置为不显示
      enterPromiseResolve()
    }
    const titleEnterPage = document.getElementById('Title_enter_page')
    if (titleEnterPage) {
      titleEnterPage.onclick = enter
    }
    const linkToGithub = document.querySelector('.link-to-github')
    const aTag = linkToGithub?.getElementsByTagName('a')[0]
    if (aTag) {
      aTag.onclick = (event) => event.stopPropagation()
    }
  }, [])
}
