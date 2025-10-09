let activeEffect: null = null
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

export const reactive = (initialValue: any) => {
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
