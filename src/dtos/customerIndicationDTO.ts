export default interface CustomerIndicationDTO {
  name: string;
  email?: string;
  phone?: string;
  zip_code: string;
  public_place: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  locality: string;
  state: string;
}
