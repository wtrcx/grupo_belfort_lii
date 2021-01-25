import Answer from '@models/Answer';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Answer)
class AnswerRepository extends Repository<Answer> {}

export default AnswerRepository;
