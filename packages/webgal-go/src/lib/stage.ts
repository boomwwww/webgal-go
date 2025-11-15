import { Webgal } from './webgal'

export class Stage {
  public game: Webgal
  public ctx: any

  public main: any
  public camera: any
  public dialogue: any
  public audio: any
  public var: any

  public constructor(webgal: Webgal) {
    this.game = webgal
  }
}

const webgal = new Webgal()

const stage = new Stage(webgal)

stage.game.storage.a = 1
