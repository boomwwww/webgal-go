import type { WebgalPlugin } from 'webgal-go'

export const createPluginStage = (): WebgalPlugin => {
  return (webgal) => {
    if (!webgal.ctx) throw new Error('Webgal not initialized')
    webgal.ctx.stage = { pixi: 'pipixixi' }
    return () => {
      console.log('uninstall stage')
    }
  }
}

export * from './types'
export * from './bus'
