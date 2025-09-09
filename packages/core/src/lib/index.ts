import { config } from '@/config'

export interface WebgalCore {
  version: string
  ctx: Context
}

export interface Context {}

export interface CreateWebgalCoreOptions {
  version?: string
  plugins?: WebgalPlugin[]
}

export interface WebgalPlugin {
  install: (webgal: WebgalCore) => void
}

export const createWebgalCore = (options?: CreateWebgalCoreOptions): WebgalCore => {
  const webgalCore = {
    version: '',
    ctx: {},
  } as WebgalCore
  webgalCore.version = options?.version || config.version
  options?.plugins?.forEach((plugin) => {
    plugin.install(webgalCore)
  })
  return webgalCore
}
