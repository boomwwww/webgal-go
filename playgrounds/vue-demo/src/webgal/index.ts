import { createWebgal } from 'webgal-go'
import { createStage } from '@webgal-go/test-plugin'

const webgal = createWebgal()

webgal.use(createStage())

webgal.ctx.stage.pixi

webgal.bus.emit('num', 0)

export default webgal
