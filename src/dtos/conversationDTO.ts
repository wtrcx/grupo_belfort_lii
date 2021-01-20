import CustomerIndicationDTO from './customerIndicationDTO copy';

export default interface ConversationDTO {
  id: string;
  client: string;
  service: string;
  company: number | null;
  re: number | null;
  name: string | null;
  email: string | null;
  phone: string;
  script: string;
  date: Date;
  historic: CustomerIndicationDTO | null;
}
