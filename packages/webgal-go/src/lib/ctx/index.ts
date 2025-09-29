import type { AppPlugin } from '@webgal-go/core'

declare module '@webgal-go/core' {
  export interface AppCore {
    ctx?: Context
    eff?: Effect
  }
}

export interface Context {}

export type Effect = () => void

const defineContext = () => {
  const _context: Context = {
    stage: 'stage1',
  }
  const _effect: Effect = () => {
    console.log('effect')
  }
  const _useContext = () => {
    return [_context, _effect] as const
  }
  return _useContext
}

export const innerPluginContext: AppPlugin = (app) => {
  const useContext = defineContext()
  const [_ctx, _eff] = useContext()
  app.ctx = _ctx
  app.eff = _eff
  return () => {
    delete app.ctx
    delete app.eff
  }
}
