import Client from '@models/Client';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Client)
class ClientRepository extends Repository<Client> {}

export default ClientRepository;
