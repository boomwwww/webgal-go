import mitt, { type EventType } from '@/vendors/mitt';

type Events = {
  'text-settle': null;
  'user-interact-next': null;
  'fullscreen-db-click': null;
  'style-update': null;
};
export const createBus = <T extends Record<EventType, unknown> = Events>() => mitt<T>();
