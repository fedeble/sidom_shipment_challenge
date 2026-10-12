import { ConsoleLogger } from '@nestjs/common';

import type { RuntimeConfig } from './runtime-config';

export function createLogger(config: RuntimeConfig): ConsoleLogger {
  return new ConsoleLogger({
    logLevels: config.logLevels,
    json: config.jsonLogs,
    colors: !config.jsonLogs,
  });
}
