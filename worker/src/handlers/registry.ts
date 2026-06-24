import { scoutHandler } from './scout.handler';
import { compressorHandler } from './compressor.handler';
import { echoHandler } from './echo.handler';

export const handlerRegistry: Record<string, (payload: any) => Promise<any>> = {
  scout: scoutHandler,
  compressor: compressorHandler,
  echo: echoHandler,
};
