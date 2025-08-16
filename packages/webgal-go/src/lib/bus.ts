import mitt from '@/vendors/mitt';
import { type BusEvents } from '@/types';

export const createBus = () => {
  return mitt<Required<BusEvents>>();
};
