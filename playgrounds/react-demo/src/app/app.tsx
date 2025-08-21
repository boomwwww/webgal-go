import './style/app.css'

export default function App() {
  {
    /**
     * 在窗口大小改变时进行强制缩放
     */
    const ua = navigator.userAgent
    const isIOSDevice = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    const resize = () => {
      const targetHeight = 1440
      const targetWidth = 2560

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
      const root = document.getElementById('root') // 获取根元素
      const title = document.getElementById('Title_enter_page')
      const ebg = document.getElementById('ebg')
      const elements = [root, title]
      if (w > h) {
        const ebg = document.getElementById('ebg')
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
        /**
         * 旋转
         */
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
        /**
         * iOS 不强制旋转
         */
        if (isIOSDevice) {
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

    if (!isIOSDevice) {
      // 创建一个新的 meta 标签
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no'
      // 将该标签添加到 head 中
      document.getElementsByTagName('head')[0].appendChild(meta)
      resize()
      window.onload = resize
      window.onresize = resize
      // 监听键盘 F11 事件，全屏时触发页面调整
      document.onkeydown = function (event) {
        const e = event
        if (e && e.key === 'F11') {
          setTimeout(() => {
            resize()
          }, 100)
        }
      }
    } else {
      // ios
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=0.22, minimum-scale=0.01, maximum-scale=1'
      document.getElementsByTagName('head')[0].appendChild(meta)
      const style = document.createElement('style')
      style.type = 'text/css'
      style.textContent = '* { font-synthesis: none !important; }'
      document.head.appendChild(style)
    }
  }
  const { isIOS } = (() => {
    /**
     * 注册 Service Worker
     */
    const u = navigator.userAgent
    const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) // 判断是否是 iOS终端
    if ('serviceWorker' in navigator && !isIOS) {
      navigator.serviceWorker
        .register('./webgal-serviceworker.js')
        .then(function (reg) {
          // registration worked
          console.log('Registration succeeded. Scope is ' + reg.scope)
        })
        .catch(function (error) {
          // registration failed
          console.log('Registration failed with ' + error)
        })
    }
    return { isIOS }
  })()
  const { enter } = (() => {
    const enterPromise = new Promise<void>((res) => {
      // @ts-expect-error create a global variable
      window.enterPromiseResolve = () => {
        res()
        // @ts-expect-error this is a global variable
        delete window.enterPromiseResolve
      }
    })
    const renderPromise = new Promise<void>((res) => {
      // @ts-expect-error create a global variable
      window.renderPromiseResolve = () => {
        res()
        // @ts-expect-error this is a global variable
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
      if (event) {
        const logo = document.getElementById('logo_target')
        if (logo) {
          logo.style.display = 'contents'
        }
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
      // @ts-expect-error this is a global variable
      window.enterPromiseResolve()
    }
    return { enter }
  })()
  {
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
        await loadScript(pluginPath)
        return true
      } catch (error) {
        console.error(error)
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
    // @ts-expect-error create a global variable
    window.live2dPromise = Promise.all([live2d2Promise, live2d4Promise])
  }
  return (
    <>
      {/* 快速显示落地页，让用户感知不到加载的过程 */}
      <div id="ebg"></div>
      <div id="Title_enter_page" onClick={() => enter()}>
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
      <div id="app"></div>
    </>
  )
}
