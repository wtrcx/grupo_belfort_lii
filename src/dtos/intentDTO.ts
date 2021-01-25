export interface IntentDataDTO {
  intent: string;
  utterances: string[];
  answers: string[];
}

export default interface IntentDTO {
  name: string;
  locale: string;
  data: IntentDataDTO[];
}
