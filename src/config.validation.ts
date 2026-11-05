const PORT_MIN = 1;
const PORT_MAX = 65535;

const integerEnvironmentVariables = new Set([
  'PORT',
  'MYSQL_PORT',
  'REDIS_PORT',
  'REDIS_TTL_SECONDS',
]);

export function validateEnvironment(env: Record<string, unknown>): Record<string, unknown> {
  if (typeof env.MYSQL_PASSWORD !== 'string' || env.MYSQL_PASSWORD.trim() === '') {
    throw new Error('MYSQL_PASSWORD must be provided through the environment');
  }

  for (const name of integerEnvironmentVariables) {
    const value = env[name];
    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
      throw new Error(`${name} must be a positive integer`);
    }

    const numberValue = Number(value);
    if (!Number.isSafeInteger(numberValue)) {
      throw new Error(`${name} must be a positive integer`);
    }
    const validRange =
      name === 'REDIS_TTL_SECONDS'
        ? numberValue > 0
        : numberValue >= PORT_MIN && numberValue <= PORT_MAX;
    if (!validRange) {
      throw new Error(
        name === 'REDIS_TTL_SECONDS'
          ? `${name} must be greater than zero`
          : `${name} must be between ${PORT_MIN} and ${PORT_MAX}`,
      );
    }
  }

  return env;
}
