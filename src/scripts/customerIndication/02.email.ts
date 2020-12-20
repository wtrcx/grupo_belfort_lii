import { ReturnScript } from '../interfaces';

const email = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp(
    '^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\\.[a-zA-Z]+\\.?([a-zA-Z]+)?$',
  );
  if (regex.test(message)) {
    return {
      status: true,
    };
  }

  return {
    message: [`❌ O email *${message}* não é valido!`, `Tente novamente!`],
  };
};

export default email;