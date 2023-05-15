export interface OpenAILLM {
  _type: "openai";
  model_name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  n: number;
  best_of: number;
  request_timeout: number | null;
  logit_bias: Record<number, number>;
}

export type LLM = OpenAILLM;

export const defaultLLMs: Record<string, LLM> = {
  llm: {
    "_type": "openai",
    "model_name": "text-davinci-003",
    "temperature": 0.8,
    "max_tokens": 256,
    "top_p": 1.0,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0,
    "n": 1,
    "best_of": 1,
    "request_timeout": null,
    "logit_bias": {},
  }
}
