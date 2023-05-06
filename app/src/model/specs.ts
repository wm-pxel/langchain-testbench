export interface BaseSpec {
  chain_type: string;
  chain_id: number;
}

export interface LLMSpec extends BaseSpec {
  chain_type: "llm_spec";
  input_keys: string[];
  output_key: string;
  prompt: string;
  llm_key: string;
}

export interface SequentialSpec extends BaseSpec {
  chain_type: "sequential_spec";
  input_keys: string[];
  output_keys: string[];
  chains: ChainSpec[];
}

export interface CaseSpec extends BaseSpec {
  chain_type: "case_spec";
  cases: Record<string, ChainSpec>;
  categorization_key: string;
  default_case: ChainSpec;
}

export interface ReformatSpec extends BaseSpec {
  chain_type: "reformat_spec";
  formatters: Record<string, string>;
  input_keys: string[];
}

export interface APISpec extends BaseSpec {
  chain_type: "api_spec";
  url: string;
  method: string;
  headers: Record<string, string> | null;
  body: string | null;
  input_keys: string[];
  output_key: string;
}

export type ChainSpec = LLMSpec | SequentialSpec | CaseSpec | ReformatSpec | APISpec;