import fs from 'fs';
import path from 'path';
import { dockStart } from '@nlpjs/basic';

import { getCustomRepository } from 'typeorm';

import ScriptService from '@services/scriptService';

import IntentRepository from '@repositories/intentRepository';
import IntentDTO from '@dtos/intentDTO';
import BadRequest from '@errors/badRequest';
import AnswerRepository from '@repositories/answerRepository';
import UtteranceRepository from '@repositories/utteranceRepository';
import ServerError from '@errors/serverError';
import UserRepository from '@repositories/userRepository';

interface NLP {
  name: string;
  manager: any;
}

interface CreateIntent {
  script: string;
  intent: string;
  utterances: string[];
  answers: string[];
  user: string;
}

class IntentService {
  private readonly scriptList = ScriptService.list();

  private readonly fileDirectory = path.resolve(
    __dirname,
    '..',
    'scripts',
    'intents',
  );

  private readonly nlp: NLP[] = [];

  public async execute({
    script,
    intent,
    utterances,
    answers,
    user,
  }: CreateIntent): Promise<boolean> {
    const userRepository = getCustomRepository(UserRepository);
    const intentRepository = getCustomRepository(IntentRepository);
    const utteranceRepository = getCustomRepository(UtteranceRepository);
    const answerRepository = getCustomRepository(AnswerRepository);

    if (!script) {
      throw new BadRequest('The following data is mandatory: script');
    }

    if (!intent) {
      throw new BadRequest('The following data is mandatory: intent');
    }

    if (!utterances) {
      throw new BadRequest('The following data is mandatory: utterances[]');
    }

    if (!answers) {
      throw new BadRequest('The following data is mandatory: answers[]');
    }

    if (!user) {
      throw new BadRequest('The following data is mandatory: user');
    }

    if (!ScriptService.isValid(script)) {
      throw new BadRequest('Script not found');
    }

    if (!Array.isArray(utterances) || utterances.length < 1) {
      throw new BadRequest('The following data is mandatory: utterances[]');
    }

    if (!Array.isArray(answers) || answers.length < 1) {
      throw new BadRequest('The following data is mandatory: answers[]');
    }

    const userExist = await userRepository.findOne({ where: { id: user } });

    if (!userExist) {
      throw new ServerError('Internal server error');
    }

    const intentExist = await intentRepository.findOne({
      where: { name: intent },
    });

    if (intentExist) {
      throw new BadRequest('The intention name already exists!');
    }

    const newIntent = intentRepository.create({
      name: intent,
      script,
      user: userExist,
    });

    await intentRepository.save(newIntent);

    utterances.forEach(async utterance => {
      const newUtterance = utteranceRepository.create({
        utterance,
        intent: newIntent,
        user: userExist,
      });

      await utteranceRepository.save(newUtterance);
    });

    answers.forEach(async answer => {
      const newAnswer = answerRepository.create({
        answer,
        intent: newIntent,
        user: userExist,
      });

      await answerRepository.save(newAnswer);
    });

    return false;
  }

  public async init(): Promise<IntentDTO[]> {
    const intentRepository = getCustomRepository(IntentRepository);

    const intents = await intentRepository.find({
      relations: ['utterances', 'answers'],
    });

    const intentDTO: IntentDTO[] = this.scriptList.map(script => {
      return {
        name: script,
        locale: 'pt',
        data: intents
          .filter(intent => intent.script === script)
          .map(intent => {
            return {
              intent: intent.name,
              utterances: intent.utterances.map(i => i.utterance),
              answers: intent.answers.map(i => i.answer),
            };
          }),
      };
    });

    intentDTO.forEach(async intent => {
      const file = path.resolve(this.fileDirectory, `${intent.name}.json`);

      await fs.promises
        .writeFile(file, JSON.stringify(intent))
        .then(async () => {
          await this.train(intent.name);
        });
    });

    return intentDTO;
  }

  public async train(script: string): Promise<void> {
    const dock = await dockStart({
      use: ['Basic'],
    });
    const manager = dock.get('nlp');

    await manager.addCorpus(path.resolve(this.fileDirectory, `${script}.json`));
    await manager.train();

    this.nlp.push({
      name: script,
      manager,
    });
  }

  public async process(script: string, phrase: string): Promise<any> {
    if (!script) {
      throw new BadRequest('The following data is mandatory: script');
    }

    if (!ScriptService.isValid(script)) {
      throw new BadRequest('Script not found');
    }

    const { manager } = this.nlp.filter(x => x.name === script)[0];

    if (manager) {
      const response = await manager.process('pt', phrase);
      return response.answer;
    }

    return null;
  }
}

export default new IntentService();
