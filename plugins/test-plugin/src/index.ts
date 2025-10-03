import type { WebgalPlugin } from 'webgal-go'

export const createPluginStage = (): WebgalPlugin => {
  return (webgal) => {
    webgal.ctx.stage = { pixi: 'pi-pixi-xi' }
    const handleNum = (num: number) => {
      console.log('num', num)
    }
    webgal.bus.on('num', handleNum)
    return () => {
      console.log('uninstall stage')
      webgal.bus.off('num', handleNum)
    }
  }
}

export * from './types'
export * from './bus'
