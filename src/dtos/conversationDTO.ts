import BeWorkerDTO from './beWorkerDTO';
import CustomerIndicationDTO from './customerIndicationDTO';

export default interface ConversationDTO {
  id: string;
  client: string;
  service: string;
  company: number | null;
  re: number | null;
  name: string | null;
  email: string | null;
  phone: string;
  script?: string;
  date: Date;
  historic: CustomerIndicationDTO | BeWorkerDTO | null;
}
