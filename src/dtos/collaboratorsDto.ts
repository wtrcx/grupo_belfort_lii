export default interface CollaboratorDTO {
  id: number;
  company_id: number;
  re: number;
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  status: boolean;
  email?: string | null;
}
