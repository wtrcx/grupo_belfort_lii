import CompanyDTO from '@dtos/companyDTO';
import NodeCache from 'node-cache';

class CompanyCache {
  private cache: NodeCache;

  private expire: number;

  public init() {
    this.cache = new NodeCache();
    this.expire = 1800;
  }

  public get(id: string): CompanyDTO[] {
    const companyCache = this.cache.get(id) as CompanyDTO[];

    return companyCache;
  }

  public set(id: string, data: CompanyDTO[]): boolean {
    return this.cache.set(id, data, this.expire);
  }
}

export default new CompanyCache();
