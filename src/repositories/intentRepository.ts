import Intent from '@models/Intent';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Intent)
class IntentRepository extends Repository<Intent> {}

export default IntentRepository;
