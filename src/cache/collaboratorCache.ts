import CollaboratorDTO from '@dtos/collaboratorsDto';
import NodeCache from 'node-cache';

class CollaboratorCache {
  private cache: NodeCache;

  private expire: number;

  public init() {
    this.cache = new NodeCache();
    this.expire = 1800;
  }

  public get(id: string): CollaboratorDTO {
    const collaboratorCache = this.cache.get(id) as CollaboratorDTO;

    return collaboratorCache;
  }

  public set(id: string, data: CollaboratorDTO): boolean {
    return this.cache.set(id, data, this.expire);
  }
}

export default new CollaboratorCache();
