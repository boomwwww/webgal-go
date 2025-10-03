export interface AppCore {
  use(plugin: AppPlugin): this
  unUse(plugin: AppPlugin): this
  hasUsedPlugin(plugin: AppPlugin): boolean
}

export type AppPlugin = (appCore: AppCore) => () => void

export const createAppCore = (): AppCore => {
  const _plugins = new WeakMap<AppPlugin, () => void>()
  const _appCore: AppCore = {
    use(plugin) {
      const hasUsed = this.hasUsedPlugin(plugin)
      if (hasUsed) {
        throw new Error(`Cannot use a plugin that has already been used!`)
      }
      const uninstall = plugin(this)
      _plugins.set(plugin, uninstall)
      return this
    },
    unUse(plugin) {
      const hasUsed = this.hasUsedPlugin(plugin)
      if (!hasUsed) {
        throw new Error(`Plugin '${plugin.name}' has not been used`)
      }
      const uninstall = _plugins.get(plugin)!
      uninstall()
      _plugins.delete(plugin)
      return this
    },
    hasUsedPlugin(plugin) {
      return _plugins.has(plugin)
    },
  }
  const _proxyHandler: ProxyHandler<AppCore> = {
    set(target, property, value, receiver) {
      if (property in target) {
        throw new Error(`Property '${String(property)}' already exists`)
      }
      return Reflect.set(target, property, value, receiver)
    },
    deleteProperty(target, property) {
      if ((['version', 'use', 'unUse', 'hasUsedPlugin'] as (typeof property)[]).includes(property)) {
        throw new Error(`Cannot delete property '${String(property)}'`)
      }
      return Reflect.deleteProperty(target, property)
    },
  }
  return new Proxy(_appCore, _proxyHandler)
}
