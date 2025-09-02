import { createWebgal } from 'webgal-go'
import { createStage } from '@webgal-go/test-plugin'

export const webgal = createWebgal({
  debug: true,
  plugins: [
    {
      install: (webgal) => {
        webgal.bus.on('text-settle', () => {
          console.log('text-settle')
        })
      },
    },
  ],
})
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
  .use(createStage())
