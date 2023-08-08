export interface OpenAILLM {
  llm_type: "openai_llm";
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

export interface HuggingFaceHubArgs {
  temperature: number;
  max_length: number;
  min_new_tokens?: number;
  max_time?: number;
}

export interface HuggingFaceHubLLM {
  llm_type: "huggingface_hub_llm";
  repo_id: string;
  task: string | null;
  model_kwargs: HuggingFaceHubArgs;
}

export type LLM = OpenAILLM | HuggingFaceHubLLM;

export const defaultLLMs: Record<string, LLM> = {
  llm: {
    "llm_type": "openai_llm",
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
