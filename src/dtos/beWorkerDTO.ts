import FileDTO from './fileDTO';

export default interface BeWorkerDTO {
  name: string;
  email: string;
  phone: string;
  vacancy: string;
  file?: FileDTO;
  zip_code: string;
  public_place: string;
  neighborhood: string;
  locality: string;
  state: string;
}
