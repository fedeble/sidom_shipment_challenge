import type { LogLevel } from '@nestjs/common';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface RuntimeConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  seedEnabled: boolean;
  logLevels: LogLevel[];
  jsonLogs: boolean;
}

const LOG_LEVELS: Record<NodeEnvironment, LogLevel[]> = {
  development: ['debug', 'log', 'warn', 'error'],
  test: ['warn', 'error'],
  production: ['log', 'warn', 'error'],
};

export function getRuntimeConfig(environment: NodeJS.ProcessEnv): RuntimeConfig {
  const nodeEnv = environment.NODE_ENV ?? 'development';
  if (!isNodeEnvironment(nodeEnv)) {
    throw new Error(`Unsupported NODE_ENV: ${nodeEnv}`);
  }

  const port = parsePort(environment.PORT);
  return {
    nodeEnv,
    port,
    seedEnabled: environment.SEED_ENABLED !== 'false',
    logLevels: LOG_LEVELS[nodeEnv],
    jsonLogs: nodeEnv === 'production',
  };
}

function isNodeEnvironment(value: string): value is NodeEnvironment {
  return value === 'development' || value === 'test' || value === 'production';
}

function parsePort(rawPort: string | undefined): number {
  if (rawPort === undefined) {
    return 3000;
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${rawPort}`);
  }

  return port;
}
