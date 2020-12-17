import moduleAlias from 'module-alias';
import path from 'path';

const paths = {
  '@srv': path.join(__dirname, '..'),
  '@models': path.join(__dirname, '..', 'models'),
  '@services': path.join(__dirname, '..', 'services'),
  '@routes': path.join(__dirname, '..', 'routes'),
  '@repositories': path.join(__dirname, '..', 'repositories'),
};

moduleAlias.addAliases(paths);
