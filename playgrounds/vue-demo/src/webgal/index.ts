import { createWebgal } from 'webgal-go'
import { createPluginStage } from '@webgal-go/test-plugin'

const webgal = createWebgal({ debug: true })

webgal.use(createPluginStage())

export default webgal
