import { useContext, useEffect, useMemo, useState } from "react";
import { VectorSearchSpec } from '../../model/specs';
import ChainSpecContext from "../../contexts/ChainSpecContext";
import FormatReducer from "../../util/FormatReducer";
import DeleteChainButton from "./DeleteChainButton";
import HighlightedTextarea from "../HighlightedTextarea";
import ParameterEditor from "./ParameterEditor";

interface VectorSearchSpecDesignerProps { spec: VectorSearchSpec };

const VectorSearchSpecDesigner = ({ spec }: VectorSearchSpecDesignerProps) => {
  const { updateChainSpec, deleteChainSpec } = useContext(ChainSpecContext);

  const [query, setQuery] = useState<string>(spec.query);
  const [outputKey, setOutputKey] = useState<string>(spec.output_key);
  const [variables, setVariables] = useState<string[]>(spec.input_variables);
  const [embeddingEngine, setEmbeddingEngine] = useState<string>(spec.embedding_engine);
  const [embeddingParams, setEmbeddingParams] = useState<Record<string, any>>(spec.embedding_params);
  const [database, setDatabase] = useState<string>(spec.database);
  const [databaseParams, setDatabaseParams] = useState<Record<string, any>>(spec.database_params);
  const [numResults, setNumResults] = useState<number>(spec.num_results);
  const [minScore, setMinScore] = useState<number>(spec.min_score);

  const formatReducer = useMemo(() => new FormatReducer(
    /(\{\{)|\{(.*?)\}/g,
    () => new Set<string>(),
    (variables: Set<string>, _, escape, variable) => (
      escape ? [variables, escape] : [
      variables.add(variable),
      `<span class="expr">{<span class="var-name">${variable}</span>}</span>`
    ]),
    (variables: Set<string>) => setTimeout(() => setVariables(Array.from(variables)), 0)
  ), []);

  useEffect(() => {
    updateChainSpec({
      ...spec,
      query,
      output_key: outputKey,
      input_variables: variables,
      embedding_engine: embeddingEngine,
      embedding_params: embeddingParams,
      database,
      database_params: databaseParams,
      num_results: numResults,
      min_score: minScore,
    });
  }, [query, outputKey, variables, embeddingEngine, embeddingParams, database, databaseParams, numResults, minScore]);

  useEffect(() => {
    setQuery(spec.query);
    setOutputKey(spec.output_key);
    setVariables(spec.input_variables);
    setEmbeddingEngine(spec.embedding_engine);
    setEmbeddingParams(spec.embedding_params);
    setDatabase(spec.database);
    setDatabaseParams(spec.database_params);
    setNumResults(spec.num_results);
    setMinScore(spec.min_score);
  }, [spec]);

  return (
    <div className="vector-search-spec spec-designer">
      <h3 className="chain-id">Vector {spec.chain_id}</h3>
      <DeleteChainButton modalKey={`delete-menu-${spec.chain_id}`} onDelete={() => deleteChainSpec(spec.chain_id)}/>
      <HighlightedTextarea
        value={query}
        onChange={setQuery}
        formatReducer={formatReducer}
        placeholder="Enter query here."
      />
      <div className="form-element">
        <label>Embed&nbsp;Engine</label>
        <select value={embeddingEngine} onChange={e => setEmbeddingEngine(e.target.value)}>
        <option key="openai" value="openai">openai</option>
        <option key="huggingface" value="huggingface">huggingface</option>
        </select>
      </div>
      <div className="form-element">
        <label>Embed&nbsp;params</label>
        <ParameterEditor parameters={embeddingParams} onChange={setEmbeddingParams} editorKey={`embed-params-${spec.chain_id}`} />
      </div>
      <div className="form-element">
        <label>Database</label>
        <select value={database} onChange={e => setDatabase(e.target.value)}>
          <option key="pinecone" value="pinecone">pinecone</option>
        </select>
      </div>
      <div className="form-element">
        <label>DB params</label>
        <ParameterEditor parameters={databaseParams} onChange={setDatabaseParams} editorKey={`db-params-${spec.chain_id}`} />
      </div>
      <div className="form-element">
        <label>Results</label>
        <input className="text-input" type="number" value={numResults} onChange={e => setNumResults(parseInt(e.target.value) || 0)} />
      </div>
      <div className="form-element">
        <label>Min score</label>
        <input className="text-input" type="number" value={minScore} onChange={e => setMinScore(parseFloat(e.target.value) || 0)} />
      </div>
      <div className="form-element">
        <label>Output Key</label>
        <input className="var-name-input" value={outputKey} onChange={e => setOutputKey(e.target.value)} />
      </div>
    </div>
  );
};

export default VectorSearchSpecDesigner;
