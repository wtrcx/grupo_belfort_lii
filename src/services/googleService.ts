import Collaborator from '@models/Collaborators';

class GoogleService {
  public async peopleSave(
    collaborator: Collaborator,
    client: string,
  ): Promise<void> {
    const { company, re, email, cell_phone } = collaborator;
    console.log(company, re, email, cell_phone, client);
  }
}

export default GoogleService;
