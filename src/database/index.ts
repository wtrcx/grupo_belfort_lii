import { createConnection } from 'typeorm';
import IntentService from '@services/intentService';
import WhatsappService from '@services/whatsappService';

createConnection().then(async () => {
  const whatsappService = new WhatsappService();
  await whatsappService.restart();
  await IntentService.init();
});
