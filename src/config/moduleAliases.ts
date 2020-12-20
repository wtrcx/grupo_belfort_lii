import moduleAlias from 'module-alias';
import path from 'path';

const paths = {
  '@srv': path.join(__dirname, '..'),
  '@models': path.join(__dirname, '..', 'models'),
  '@services': path.join(__dirname, '..', 'services'),
  '@repositories': path.join(__dirname, '..', 'repositories'),
  '@errors': path.join(__dirname, '..', 'errors'),
};

moduleAlias.addAliases(paths);
