import { validateEnvironment } from '../src/config.validation';

describe('validateEnvironment', () => {
  const validEnvironment = {
    MYSQL_PASSWORD: 'password',
    PORT: '3000',
    MYSQL_PORT: '3306',
    REDIS_PORT: '6379',
    REDIS_TTL_SECONDS: '3600',
  };

  it.each(['PORT', 'MYSQL_PORT', 'REDIS_PORT'])('rejects invalid %s values', (name) => {
    expect(() => validateEnvironment({ ...validEnvironment, [name]: 'not-a-number' })).toThrow(
      `${name} must be a positive integer`,
    );
    expect(() => validateEnvironment({ ...validEnvironment, [name]: '0' })).toThrow(
      `${name} must be between 1 and 65535`,
    );
    expect(() => validateEnvironment({ ...validEnvironment, [name]: '65536' })).toThrow(
      `${name} must be between 1 and 65535`,
    );
  });

  it('rejects non-positive Redis TTL values', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, REDIS_TTL_SECONDS: '0' }),
    ).toThrow('REDIS_TTL_SECONDS must be greater than zero');
  });

  it('requires a database password', () => {
    expect(() => validateEnvironment({ ...validEnvironment, MYSQL_PASSWORD: '  ' })).toThrow(
      'MYSQL_PASSWORD must be provided through the environment',
    );
  });
});
