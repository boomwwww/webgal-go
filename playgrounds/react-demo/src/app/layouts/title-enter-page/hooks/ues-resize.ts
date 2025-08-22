import { useEffect } from 'react'

/** 在窗口大小改变时进行强制缩放 */
export const useResize = () => {
  useEffect(() => {
    const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    const resize = () => {
      const targetHeight = 1440 // 目标高度
      const targetWidth = 2560 // 目标宽度

      const h = window.innerHeight // 窗口高度
      const w = window.innerWidth // 窗口宽度
      const zoomH = h / targetHeight // 以窗口高度为基准的变换比
      const zoomW = w / targetWidth // 以窗口宽度为基准的变换比
      const zoomH2 = w / targetHeight // 竖屏时以窗口高度为基础的变换比
      const zoomW2 = h / targetWidth // 竖屏时以窗口宽度为基础的变换比
      let mh = (targetHeight - h) / 2 // y轴移动距离
      let mw = (targetWidth - w) / 2 // x轴移动距离
      // eslint-disable-next-line
      let mh2os = targetWidth / 2 - w / 2 // 竖屏时 y轴移动距离
      let mw2os = targetHeight / 2 - h / 2 // 竖屏时 x轴移动距离
      let transform = ''
      let effectBackgroundTransform = ''
      const webgalRoot = document.querySelector<HTMLElement>('#webgal-root') // 获取根元素
      const titleEnter = document.querySelector<HTMLElement>('.html-body__title-enter')
      const effectBackground = document.querySelector<HTMLElement>('.html-body__effect-background')
      const elements = [webgalRoot, titleEnter]
      if (w > h) {
        if (effectBackground) {
          effectBackground.style.height = `100vh`
          effectBackground.style.width = `100vw`
          effectBackgroundTransform = ''
        }
        mw = -mw
        mh = -mh
        if (w * (9 / 16) >= h) {
          transform = `translate(${mw}px, ${mh}px) ` + `scale(${zoomH}, ${zoomH}) `
        }
        if (w * (9 / 16) < h) {
          transform = `translate(${mw}px, ${mh}px) ` + `scale(${zoomW}, ${zoomW}) `
        }
      } else {
        // 旋转
        if (effectBackground) {
          effectBackground.style.height = `${targetHeight}px `
          effectBackground.style.width = `${targetWidth}px `
        }
        mw2os = -mw2os
        if (h * (9 / 16) >= w) {
          effectBackgroundTransform =
            `rotate(90deg) ` + `translate(${mw2os}px, ${mh2os}px) ` + `scale(${zoomH2 * 1.75}, ${zoomH2 * 1.75}) `
          transform = `rotate(90deg) ` + `translate(${mw2os}px, ${mh2os}px) ` + `scale(${zoomH2},${zoomH2}) `
        }
        if (h * (9 / 16) < w) {
          effectBackgroundTransform =
            `rotate(90deg) ` + ` translate(${mw2os}px, ${mh2os}px) ` + `scale(${zoomW2 * 1.75}, ${zoomW2 * 1.75}) `
          transform = `rotate(90deg) ` + `translate(${mw2os}px, ${mh2os}px) ` + `scale(${zoomW2},${zoomW2}) `
        }
        // iOS 不强制旋转
        if (isIOS) {
          const zoomWi = w / targetWidth
          transform = `translate(${-mw}px, ${-mh}px) ` + `scale(${zoomWi},${zoomWi}) `
        }
      }
      if (effectBackground) {
        effectBackground.style.transform = effectBackgroundTransform
      }
      for (const element of elements) {
        if (element) {
          element.style.transform = transform
        }
      }
    }
    if (!isIOS) {
      // 非 IOS
      // 创建一个新的 meta 标签
      const metaTag = document.createElement('meta')
      metaTag.name = 'viewport'
      metaTag.content = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no'
      // 将该标签添加到 head 中
      document.head.appendChild(metaTag)
      resize()
      window.onload = resize
      window.onresize = resize
      // 监听键盘 F11 键按下事件，全屏时触发页面调整
      document.onkeydown = (e) => {
        if (e && e.key === 'F11') {
          setTimeout(() => {
            resize()
          }, 100)
        }
      }
    } else {
      // IOS
      const metaTag = document.createElement('meta')
      metaTag.name = 'viewport'
      metaTag.content = 'width=device-width, initial-scale=0.22, minimum-scale=0.01, maximum-scale=1'
      // 将该标签添加到 head 中
      document.head.appendChild(metaTag)
      const styleTag = document.createElement('style')
      styleTag.textContent = '* { font-synthesis: none !important; }'
      document.head.appendChild(styleTag)
    }
  }, [])
}
