import Utterance from '@models/Utterance';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Utterance)
class UtteranceRepository extends Repository<Utterance> {}

export default UtteranceRepository;
