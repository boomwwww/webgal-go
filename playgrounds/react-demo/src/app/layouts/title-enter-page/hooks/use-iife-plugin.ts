import { useEffect } from 'react'

/** 加载IIFE插件 */
export const useIifePlugin = () => {
  useEffect(() => {
    const loadScript = (url: string, type?: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        if (type) script.type = type
        script.onload = () => resolve(`Loaded: ${url}`)
        script.onerror = () => reject(new Error(`Failed to load: ${url}`))
        document.head.appendChild(script)
      })
    }
    const loadIifePlugin = async (pluginPath: string) => {
      try {
        const info = await loadScript(pluginPath)
        console.log(info)
        return true
      } catch (error) {
        console.warn(error)
        return false
      }
    }
    // 尝试加载 Live2D SDK，
    // 只有在用户自行取得 Live2D 许可并放到下面的目录时，这里才可能加载成功。
    // 本项目 **没有** 引入 Live2D SDK
    // Attempt to load the Live2D SDK.
    // This will only succeed if the user has obtained a Live2D license and placed it in the directory below.
    // This project **does not** include the Live2D SDK.
    // Live2D SDK の読み込みを試みます。
    // ユーザーが Live2D ライセンスを取得し、以下のディレクトリに配置した場合のみ、読み込みが成功します。
    // このプロジェクトには Live2D SDK は**含まれていません**
    const live2d2Promise = loadIifePlugin('lib/live2d.min.js')
    const live2d4Promise = loadIifePlugin('lib/live2dcubismcore.min.js')
    // @ts-expect-error live2dPromise is a global variable
    window.live2dPromise = Promise.all([live2d2Promise, live2d4Promise])
  }, [])
}
