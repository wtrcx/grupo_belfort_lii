import ViaCepDTO from '@dtos/viaCepDto';
import axios from 'axios';

class ViaCepService {
  public readonly cep;

  constructor(cep: string) {
    this.cep = cep;
  }

  public async consulta(): Promise<ViaCepDTO> {
    const result = await axios.get(
      `https://viacep.com.br/ws/${this.cep}/json/`,
    );
    try {
      const { status, data } = result;
      const { erro } = data;

      if (status === 200 && !erro) {
        const { cep, logradouro, bairro, localidade, uf } = result.data;
        return { status, cep, logradouro, bairro, localidade, uf };
      }
      return { status: 400 };
    } catch (error) {
      return { status: 400 };
    }
  }
}

export default ViaCepService;
