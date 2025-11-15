import { createParser, type Parser } from '@webgal-go/parser'

export class Webgal {
  public parser: Parser
  public storage: any

  public constructor() {
    this.parser = createParser()
  }
}
