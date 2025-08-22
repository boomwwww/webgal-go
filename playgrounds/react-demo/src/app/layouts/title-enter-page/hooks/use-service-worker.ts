import { useEffect } from 'react'

/** 注册 Service Worker */
export const useServiceWorker = () => {
  useEffect(() => {
    const isIOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    if ('serviceWorker' in navigator && !isIOS) {
      navigator.serviceWorker
        .register('./webgal-serviceworker.js')
        .then((reg) => {
          console.log('Registration succeeded. Scope is ' + reg.scope)
        })
        .catch((error) => {
          console.log('Registration failed with ' + error)
        })
    }
  }, [])
}
