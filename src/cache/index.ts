import CollaboratorCache from './collaboratorCache';
import CompanyCache from './companyCache';
import viaCepCache from './viaCepCache';

const startCache = (): void => {
  CollaboratorCache.init();
  CompanyCache.init();
  viaCepCache.init();
};

export default startCache();
