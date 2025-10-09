declare module 'webgal-go' {
  export interface Webgal {
    userAgent?: string
    isIOS?: boolean
    legacy?: {
      animationManager: any
    }
  }
}

export {}
