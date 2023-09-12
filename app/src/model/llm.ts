export interface OpenAILLM {
  llm_type: "openai";
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
}

export interface HuggingFaceHubLLM {
  llm_type: "huggingface_hub";
  repo_id: string;
  task: string | null;
  model_kwargs: HuggingFaceHubArgs;
}

export interface FunctionParameter {
  type: string;
  description: string;
}

export interface LLMFunction {
  id: number;
  name: string;
  description: string;
  parameters: Record<string, FunctionParameter>;
}


export interface ChatOpenAILLM {
  llm_type: "chat_openai";
  model_name: string;
  temperature: number;
  max_tokens: number;
  n: number;
  request_timeout: number | null;
  functions: LLMFunction[]
}

export type LLM = OpenAILLM | HuggingFaceHubLLM | ChatOpenAILLM;

export const defaultLLMs: Record<string, LLM> = {
  llm: {
    "llm_type": "openai",
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
