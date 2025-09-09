import { type WebgalApp, type WebgalPlugin } from 'webgal-go'

export const createStage = (): WebgalPlugin => {
  return {
    install: (webgal: WebgalApp) => {
      webgal.ctx.stage = { pixi: 'pipixixi' }
    },
  }
}

export { type WebgalApp }

export * from './types'
export * from './bus'
