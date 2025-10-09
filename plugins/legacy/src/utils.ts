import { type Webgal } from 'webgal-go'

export const loadStyle = (url: string) => {
  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = url
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(link)
}
export const injectUserAnimation = (webgal: Webgal) => {
  fetch('./game/animation/animationTable.json')
    .then((res) => res.json())
    .then((res) => {
      const animations: Array<string> = res
      for (const animationName of animations) {
        fetch(`./game/animation/${animationName}.json`)
          .then((res) => res.json())
          .then((res) => {
            if (res) {
              const userAnimation = {
                name: animationName,
                effects: res,
              }
              webgal.legacy?.animationManager.addAnimation(userAnimation)
            }
          })
      }
    })
  // axios.get('./game/animation/animationTable.json').then((res) => {
  //   const animations: Array<string> = res.data
  //   for (const animationName of animations) {
  //     axios.get(`./game/animation/${animationName}.json`).then((res) => {
  //       if (res.data) {
  //         const userAnimation = {
  //           name: animationName,
  //           effects: res.data,
  //         }
  //         WebGAL.animationManager.addAnimation(userAnimation)
  //       }
  //     })
  //   }
  // })
}
