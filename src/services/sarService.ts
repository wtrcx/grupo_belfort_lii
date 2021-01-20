import CollaboratorDTO from '@dtos/collaboratorsDTO';
import CompanyDTO from '@dtos/companyDTO';
import BadRequest from '@errors/badRequest';
import axios from 'axios';

class SarService {
  public async findAllCompanies(id: number[]): Promise<CompanyDTO[] | null> {
    const result = await axios.get(
      'http://192.168.0.166:8080/api-belfort/companies',
      { data: { id } },
    );

    const statusCode = result.status;

    if (statusCode === 200) {
      const companies = result.data as CompanyDTO[];
      return companies;
    }

    return null;
  }

  public async findCompany(id: number): Promise<CompanyDTO> {
    const result = await axios.get(
      `http://192.168.0.166:8080/api-belfort/companies/${id}`,
    );

    const statusCode = result.status;

    if (statusCode === 200) {
      const company = result.data as CompanyDTO;
      return company;
    }

    throw new BadRequest('Company not found');
  }

  public async findCollaboratorByReAndCompany(
    reNumber: number,
    company: number,
  ): Promise<CollaboratorDTO | null> {
    try {
      const result = await axios.get(
        `http://192.168.0.166:8080/api-belfort/collaborators/${company}/${reNumber}`,
      );

      const statusCode = result.status;

      if (statusCode === 200) {
        const {
          id,
          company_id,
          re,
          name,
          cpf,
          rg,
          phone,
          status,
        } = result.data;
        return { id, company_id, re, name, cpf, rg, phone, status };
      }
    } catch (error) {
      return null;
    }

    return null;
  }
}

export default SarService;
