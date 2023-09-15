export interface BaseSpec {
  chain_type: string;
  chain_id: number;
}

export interface LLMSpec extends BaseSpec {
  chain_type: "llm_chain_spec";
  input_keys: string[];
  output_key: string;
  prompt: string;
  llm_key: string;
}

export interface ChatSpec extends BaseSpec {
  chain_type: "chat_chain_spec";
  input_keys: string[];
  output_key: string;
  prompt: string;
  role: string;
  llm_key: string;
}

export interface SequentialSpec extends BaseSpec {
  chain_type: "sequential_chain_spec";
  input_keys: string[];
  output_keys: string[];
  chains: ChainSpec[];
}

export interface CaseSpec extends BaseSpec {
  chain_type: "case_chain_spec";
  cases: Record<string, ChainSpec>;
  categorization_key: string;
  default_case: ChainSpec | null;
}

export interface ReformatSpec extends BaseSpec {
  chain_type: "reformat_chain_spec";
  formatters: Record<string, string>;
  input_keys: string[];
}

export interface TransformSpec extends BaseSpec {
  chain_type: "transform_chain_spec";
  transform_func: string;
  input_keys: string[];
  output_keys: string[];
}

export interface APISpec extends BaseSpec {
  chain_type: "api_chain_spec";
  url: string;
  method: string;
  headers: Record<string, string> | null;
  body: string | null;
  input_keys: string[];
  output_key: string;
}

export interface VectorSearchSpec extends BaseSpec {
  chain_type: "vector_search_chain_spec";
  query: string;
  embedding_engine: string;
  embedding_params: Record<string, any>;
  database: string;
  database_params: Record<string, any>;
  num_results: number;
  min_score: number;
  input_variables: string[];
  output_key: string;
}

export type ChainSpec = LLMSpec | ChatSpec | SequentialSpec | CaseSpec | ReformatSpec | TransformSpec | APISpec | VectorSearchSpec;