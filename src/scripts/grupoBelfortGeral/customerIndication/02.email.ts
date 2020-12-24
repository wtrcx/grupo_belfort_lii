import { ReturnScript } from '../../interfaces';

const email = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp(
    '^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\\.[a-zA-Z]+\\.?([a-zA-Z]+)?$',
  );
  if (regex.test(message)) {
    return {
      message: '',
      status: true,
    };
  }

  return {
    message: [`❌ O email *${message}* não é valido!`, `Tente novamente!`],
  };
};

export default email;
