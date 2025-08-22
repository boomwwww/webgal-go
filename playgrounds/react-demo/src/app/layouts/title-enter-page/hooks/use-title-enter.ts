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
    // 将播放bgm的事件发送出去
    Promise.all([enterPromise, renderPromise]).then(() => {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      })
      const target = document.querySelector('.title__enter-game-target')
      if (target) {
        target.dispatchEvent(event)
      }
    })
    /** 点击屏幕，进入引擎主界面 */
    const enter = () => {
      const initialBackground = document.querySelector<HTMLElement>('.title-enter__initial-background')
      if (initialBackground) {
        initialBackground.style.opacity = '0'
      }
      const container = document.querySelector<HTMLElement>('.title-enter__container')
      if (container) {
        container.style.opacity = '0'
      }
      const whiteBackground = document.querySelector<HTMLElement>('.title-enter__white-background')
      setTimeout(() => {
        if (whiteBackground) {
          whiteBackground.style.opacity = '1'
        }
      }, 50) // 在50ms后开始显示白色渐变
      const titleEnter = document.querySelector<HTMLElement>('.html-body__title-enter')
      setTimeout(() => {
        if (titleEnter) titleEnter.style.opacity = '0'
      }, 500) // 500ms后开始降低落地页透明度
      if (!isIOS && titleEnter) {
        titleEnter.style.pointerEvents = 'none' // 落地页不再响应点击
        titleEnter.style.background = 'linear-gradient( #a1c4fd 0%, #c2e9fb 100%)' // 改变标题渐变效果
      }
      setTimeout(() => {
        if (titleEnter) {
          titleEnter.style.display = 'none'
        }
      }, 2000) // 将落地页设置为不显示
      enterPromiseResolve()
    }
    const titleEnter = document.querySelector<HTMLElement>('.html-body__title-enter')
    if (titleEnter) {
      titleEnter.onclick = enter
    }
    const linkToGithub = document.querySelector('.title-enter-container__link-to-github')
    const aTag = linkToGithub?.querySelector('a')
    if (aTag) {
      aTag.href = 'https://github.com/OpenWebGAL/WebGAL'
      aTag.onclick = (event) => event.stopPropagation()
    }
  }, [])
}
