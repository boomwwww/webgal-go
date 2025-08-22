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
      let ebgTransform = ''
      const appRoot = document.getElementById('webgal-root') // 获取webgal-root元素
      const title = document.getElementById('Title_enter_page')
      const ebg = document.getElementById('ebg')
      const elements = [appRoot, title]
      if (w > h) {
        if (ebg) {
          ebg.style.height = `100vh`
          ebg.style.width = `100vw`
          ebgTransform = ''
        }
        mw = -mw
        mh = -mh
        if (w * (9 / 16) >= h) {
          transform = `translate(${mw}px, ${mh}px) scale(${zoomH},${zoomH})`
        }
        if (w * (9 / 16) < h) {
          transform = `translate(${mw}px, ${mh}px) scale(${zoomW},${zoomW})`
        }
      } else {
        /** 旋转 */
        if (ebg) {
          ebg.style.height = `${targetHeight}px`
          ebg.style.width = `${targetWidth}px`
        }
        mw2os = -mw2os
        if (h * (9 / 16) >= w) {
          ebgTransform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomH2 * 1.75},${zoomH2 * 1.75})`
          transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomH2},${zoomH2})`
        }
        if (h * (9 / 16) < w) {
          ebgTransform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomW2 * 1.75},${zoomW2 * 1.75})`
          transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomW2},${zoomW2})`
        }
        /** iOS 不强制旋转 */
        if (isIOS) {
          const zoomWi = w / targetWidth
          transform = `translate(${-mw}px, ${-mh}px) scale(${zoomWi},${zoomWi})`
        }
      }
      if (ebg) {
        ebg.style.transform = ebgTransform
      }
      for (const element of elements) {
        if (element) {
          element.style.transform = transform
        }
      }
    }
    if (!isIOS) {
      // 非IOS
      // 创建一个新的 meta 标签
      const metaTag = document.createElement('meta')
      metaTag.name = 'viewport'
      metaTag.content = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no'
      // 将该标签添加到 head 中
      document.getElementsByTagName('head')[0].appendChild(metaTag)
      resize()
      window.onload = resize
      window.onresize = resize
      // 监听键盘 F11 事件，全屏时触发页面调整
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
      document.getElementsByTagName('head')[0].appendChild(metaTag)
      const styleTag = document.createElement('style')
      styleTag.textContent = '* { font-synthesis: none !important; }'
      document.head.appendChild(styleTag)
    }
  }, [])
}
