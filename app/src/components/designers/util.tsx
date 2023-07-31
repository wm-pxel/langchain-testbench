import { ChainSpec } from "../../model/specs";
import LLMSpecDesigner from "./LLMSpecDesigner";
import SequentialSpecDesigner from "./SequentialSpecDesigner";
import CaseSpecDesigner from "./CaseSpecDesigner";
import ReformatSpecDesigner from "./ReformatSpecDesigner";
import TransformSpecDesigner from "./TransformSpecDesigner";
import APISpecDesigner from "./APISpecDesigner";
import VectorSearchSpecDesigner from "./VectorSearchSpecDesigner";

export const renderChainSpec = (spec: ChainSpec) => {
  switch (spec.chain_type) {
    case "llm_spec":
      return <LLMSpecDesigner spec={spec} key={`llm-spec-${spec.chain_id}`} />;
    case "sequential_spec":
      return <SequentialSpecDesigner spec={spec} key={`sequential-spec-${spec.chain_id}`} />;
    case "case_spec":
      return <CaseSpecDesigner spec={spec} key={`case-spec-${spec.chain_id}`} />;
    case "reformat_spec":
      return <ReformatSpecDesigner spec={spec} key={`reformat-spec-${spec.chain_id}`}/>;
    case "transform_spec":
      return <TransformSpecDesigner spec={spec} key={`transform-spec-${spec.chain_id}`}/>;
    case "api_spec":
      return <APISpecDesigner spec={spec} key={`api-spec-${spec.chain_id}`}/>;
    case "vector_search_spec":
      return <VectorSearchSpecDesigner spec={spec} key={`vector-search-spec-${spec.chain_id}`}/>;
    }
};

export const specTypeOptions = {
  llm_spec: 'LLM',
  sequential_spec: 'Sequential',
  case_spec: 'Case',
  reformat_spec: 'Reformat',
  transform_spec: 'Transform',
  api_spec: 'API',
  vector_search_spec: 'Vector',
};
