declare module 'webgal-go' {
  export interface BusEvents extends LegacyEvents {}
}

export interface LegacyEvents {
  'text-settle': null
  'user-interact-next': null
  'fullscreen-db-click': null
  'style-update': null
}
