import ViaCepDTO from '@dtos/viaCepDTO';
import NodeCache from 'node-cache';

class ViaCepCache {
  private cache: NodeCache;

  private expire: number;

  public init() {
    this.cache = new NodeCache();
    this.expire = 1800;
  }

  public get(id: string): ViaCepDTO {
    const viaCepCache = this.cache.get(id) as ViaCepDTO;

    return viaCepCache;
  }

  public set(id: string, data: ViaCepDTO): boolean {
    return this.cache.set(id, data, this.expire);
  }
}

export default new ViaCepCache();
