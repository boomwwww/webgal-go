import { config } from '@/config'

export interface WebgalApp {
  version: string
  ctx: Context
}

export interface Context {}

export interface CreateWebgalCoreOptions {
  version?: string
  plugins?: WebgalPlugin[]
}

export interface WebgalPlugin {
  install: (webgal: WebgalApp) => void
}

export const createWebgalCore = (options?: CreateWebgalCoreOptions): WebgalApp => {
  const webgalCore = {
    version: '',
    ctx: {},
  } as WebgalApp
  webgalCore.version = options?.version || config.version
  options?.plugins?.forEach((plugin) => {
    plugin.install(webgalCore)
  })
  return webgalCore
}
