import { QueryFailedError, Repository } from 'typeorm';
import { MappingCacheService } from '../src/mapping/mapping-cache.service';
import { UserMapping } from '../src/mapping/entities/user-mapping.entity';
import { MappingService } from '../src/mapping/mapping.service';

describe('MappingService', () => {
  let repository: jest.Mocked<Pick<Repository<UserMapping>, 'findOne' | 'save' | 'create'>>;
  let cache: jest.Mocked<Pick<MappingCacheService, 'get' | 'set'>>;
  let service: MappingService;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<Repository<UserMapping>, 'findOne' | 'save' | 'create'>>;
    (repository.create as jest.Mock).mockImplementation((value: UserMapping) => value);
    cache = { get: jest.fn(), set: jest.fn() };
    service = new MappingService(
      repository as unknown as Repository<UserMapping>,
      cache as unknown as MappingCacheService,
    );
  });

  it('creates a UUID v4 mapping for a new pair', async () => {
    cache.get.mockResolvedValue(null);
    repository.findOne.mockResolvedValue(null);
    repository.save.mockImplementation(async (mapping) => mapping as UserMapping);

    const result = await service.resolve({ id1: 'ABC123', id2: 'XYZ456' });

    expect(result.userID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id1: 'ABC123', id2: 'XYZ456', userID: result.userID }),
    );
  });

  it('returns an existing database mapping', async () => {
    cache.get.mockResolvedValue(null);
    repository.findOne.mockResolvedValue({ userID: '550e8400-e29b-41d4-a716-446655440000' } as UserMapping);

    await expect(service.resolve({ id1: 'ABC123', id2: 'XYZ456' })).resolves.toEqual({
      userID: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns a cached mapping without querying the database', async () => {
    cache.get.mockResolvedValue('550e8400-e29b-41d4-a716-446655440000');

    await expect(service.resolve({ id1: 'ABC123', id2: 'XYZ456' })).resolves.toEqual({
      userID: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('handles a concurrent duplicate by reading the winning record', async () => {
    cache.get.mockResolvedValue(null);
    repository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userID: '550e8400-e29b-41d4-a716-446655440000' } as UserMapping);
    const duplicateError = new QueryFailedError('INSERT', [], new Error('duplicate'));
    Object.assign(duplicateError.driverError, { code: 'ER_DUP_ENTRY' });
    repository.save.mockRejectedValue(duplicateError);

    await expect(service.resolve({ id1: 'ABC123', id2: 'XYZ456' })).resolves.toEqual({
      userID: '550e8400-e29b-41d4-a716-446655440000',
    });
  });
});
