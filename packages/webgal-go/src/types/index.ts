import { type CompatSceneParser } from '@webgal-go/parser';
import { type Emitter } from '@/vendors/mitt';

export interface Webgal {
  readonly version: string;
  readonly ctx: Context;
  readonly parser: CompatSceneParser;
  readonly bus: Emitter<Required<BusEvents>>;
  readonly use: (plugin: WebgalPlugin) => Webgal;
}

export interface Context {}

export interface BusEvents {
  'text-settle': null;
  'user-interact-next': null;
  'fullscreen-db-click': null;
  'style-update': null;
}

export interface WebgalPlugin {
  install: (webgal: Webgal) => void;
}
