import {
  ObjectLiteral,
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  SelectQueryBuilder,
} from 'typeorm';

type QueryOptions<T> = {
  alias: string;
  relations?: (keyof T)[];
  order?: Record<string, 'ASC' | 'DESC'>;
};

export class BaseRepository<T extends ObjectLiteral> {
  protected repo: Repository<T>;

  constructor(repo: Repository<T>) {
    this.repo = repo;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return await this.repo.create(data);
  }

  save(entity: T): Promise<T> {
    return this.repo.save(entity);
  }

  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repo.create(data);
    return this.repo.save(entities);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne(options);
  }

  //   async update(id: string, data: DeepPartial<T>): Promise<T> {
  //     await this.repo.update(id, data);
  //     return this.findById(id);
  //   }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  protected buildFilterQuery(options: QueryOptions<T>): SelectQueryBuilder<T> {
    const { alias, relations = [], order } = options;

    const qb = this.repo.createQueryBuilder(alias);

    relations.forEach((r) =>
      qb.leftJoinAndSelect(`${alias}.${String(r)}`, String(r)),
    );

    if (order) {
      Object.entries(order).forEach(([k, v]) =>
        qb.addOrderBy(`${alias}.${k}`, v!),
      );
    }

    return qb;
  }
}
