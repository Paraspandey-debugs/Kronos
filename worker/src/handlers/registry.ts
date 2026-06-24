import { scoutHandler } from './scout.handler';
import { compressorHandler } from './compressor.handler';

export const handlerRegistry: Record<string, (payload: any) => Promise<any>> = {
  scout: scoutHandler,
  compressor: compressorHandler,
};
