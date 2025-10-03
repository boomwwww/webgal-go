import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  dts: true,
  shims: true,
  exports: true,
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
