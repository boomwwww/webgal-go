import { createWebgal } from 'webgal-go'
import { createLegacyPlugin } from '@webgal-go/plugin-legacy'
import { createPluginStage } from '@webgal-go/test-plugin'

const webgal = createWebgal({ debug: true })

webgal.use(createPluginStage())

webgal.use(createLegacyPlugin())

export default webgal
