import type { WebgalPlugin } from 'webgal-go'
import { loadStyle } from '@/utils'
import { injectUserAnimation } from '@/utils'

export const createLegacyPlugin = (): WebgalPlugin => {
  return (webgal) => {
    webgal.debugger.info('Legacy plugin installed.')
    webgal.userAgent = navigator.userAgent
    webgal.isIOS = !!webgal.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    if (webgal.isIOS) {
      /**
       * iOS
       */
      alert(
        `iOS 用户请横屏使用以获得最佳体验
| Please use landscape mode on iOS for the best experience
| iOS ユーザーは横画面での使用をお勧めします`,
      )
    }
    loadStyle('./game/userStyleSheet.css')
    injectUserAnimation(webgal)
    return () => {
      webgal.debugger.warn('Legacy plugin can not be uninstalled. Please do not uninstall it.')
    }
  }
}

export * from './types.js'
export * from './bus.js'
