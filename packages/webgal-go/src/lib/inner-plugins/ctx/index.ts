import type { AppPlugin } from '@webgal-go/core'

declare module '@webgal-go/core' {
  export interface AppCore {
    ctx?: Context
    eff?: Effect
  }
}

export interface Context {}

export type Effect = (fn: () => void) => void

// todo
const defineContext = () => {
  let activeEffect: Function | null = null
  const depsMap = new WeakMap()

  const track = (target: WeakKey, key: string | symbol) => {
    if (!activeEffect) return
    let deps = depsMap.get(target)
    if (!deps) {
      deps = new Map()
      depsMap.set(target, deps)
    }
    let dep = deps.get(key)
    if (!dep) {
      dep = new Set()
      deps.set(key, dep)
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect)
    }
  }

  const trigger = (target: WeakKey, key: string | symbol) => {
    const deps = depsMap.get(target)?.get(key)
    if (deps) {
      deps.forEach((effect: () => any) => effect())
    }
  }

  const reactive = (initialValue: any) => {
    const proxy = new Proxy(initialValue, {
      get(target, key) {
        track(target, key)
        return target[key]
      },
      set(target, key, value) {
        target[key] = value
        trigger(target, key)
        return true
      },
    })
    return proxy
  }

  const createEffect = (fn: () => void) => {
    const e = () => {
      activeEffect = e
      fn()
      activeEffect = null
    }
    return e
  }

  const _context: Context = reactive({})
  const _effect: Effect = createEffect(() => {})
  const _useContext = () => {
    return [_context, _effect] as const
  }
  return _useContext
}

export const contextInnerPlugin: AppPlugin = (app) => {
  const useContext = defineContext()
  const [_ctx, _eff] = useContext()
  app.ctx = _ctx
  app.eff = _eff
  return () => {}
}
