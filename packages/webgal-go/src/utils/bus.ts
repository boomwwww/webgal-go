import mitt, { type EventType } from '@/vendors/mitt';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Events = {
  'text-settle': null;
  'user-interact-next': null;
  'fullscreen-db-click': null;
  'style-update': null;
};

export const bus = mitt<Events>();
export const createBus = <T extends Record<EventType, unknown> = Events>() => mitt<T>();

// interface IWebgalEvent<T> {
//   on: (callback: (message?: T) => void, id?: string) => void;
//   off: (callback: (message?: T) => void, id?: string) => void;
//   emit: (message?: T, id?: string) => void;
// }

// export class Events {
//   public textSettle = formEvent('text-settle');
//   public userInteractNext = formEvent('__NEXT');
//   public fullscreenDbClick = formEvent('fullscreen-dbclick');
//   public styleUpdate = formEvent('style-update');
// }

// function formEvent<T>(eventName: string): IWebgalEvent<T> {
//   return {
//     on: (callback, id?) => {
//       // @ts-ignore
//       eventBus.on(`${eventName}-${id ?? ''}`, callback);
//     },
//     emit: (message?, id?) => {
//       eventBus.emit(`${eventName}-${id ?? ''}`, message);
//     },
//     off: (callback, id?) => {
//       // @ts-ignore
//       eventBus.off(`${eventName}-${id ?? ''}`, callback);
//     },
//   };
// }
