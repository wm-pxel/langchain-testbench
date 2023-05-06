import { useContext, useState, useEffect, useRef } from "react";
import { LLMSpec, SequentialSpec, CaseSpec, ReformatSpec, APISpec, ChainSpec } from '../model/specs';
import InsertChainSpec from "./InsertChainSpec";
import ChainSpecContext from "../contexts/ChainSpecContext";
import DOMPurify from "dompurify";
import "./style/Designer.css"

type InsertChainFunc = (type: string, chainId: number, index: number) => void;
type UpdateSpecFunc = (spec: ChainSpec) => void;

interface LLMSpecDesignerProps { spec: LLMSpec };
const LLMSpecDesigner = ({ spec }: LLMSpecDesignerProps) => {
  const [prompt, setPrompt] = useState<string>(spec.prompt);
  const [formattedPrompt, setFormattedPrompt] = useState<string>(spec.prompt);
  const [outuptKey, setOutputKey] = useState<string>(spec.output_key);
  const [variables, setVariables] = useState<string[]>([]);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vars: string[] = [];
    const formatted = prompt.replace(/{(.*?)}/g, (_, variable) => {
      vars.push(variable);
      return `{<span class="llm-variable">${variable}</span>}`;
    }).replace(/\n/g, "<br/>");

    setVariables(vars);
    setFormattedPrompt(DOMPurify.sanitize(formatted));
  }, [prompt]);

  const syncScroll = (e: React.UIEvent) => {
    if (!displayRef.current) return;
    displayRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
  }

  return (
    <div className="llm-spec spec-designer">
      <h3 className="chain-id">LLM {spec.chain_id}</h3>
      <div className="editor">
        <div className="prompt-display" ref={displayRef} dangerouslySetInnerHTML={{__html: formattedPrompt}}></div>
        <textarea className="prompt-input" value={prompt} 
          onChange={e => setPrompt(e.target.value)} 
          placeholder="Enter prompt here."
          onScroll={syncScroll}>
        </textarea>
      </div>
      <div className="form-element">
        <label>Output Key</label>
        <input className="var-name-input" value={outuptKey} onChange={e => setOutputKey(e.target.value)} />
      </div>
    </div>
  );
};

interface SequentialSpecDesignerProps { spec: SequentialSpec, insertChain: InsertChainFunc };
const SequentialSpecDesigner = ({ spec, insertChain }: SequentialSpecDesignerProps) => {
  return (
    <div className="sequential-spec spec-designer">
      <h3 className="chain-id">Sequential {spec.chain_id}</h3>
      <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={0} />
      {spec.chains.flatMap((chain: ChainSpec, idx: number) => [
        renderChainSpec(chain, insertChain),
        <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={idx+1} key={`button-${idx+1}`}/>
      ])}
    </div>
  );
};

interface CaseSpecDesignerProps { spec: CaseSpec, insertChain: InsertChainFunc };
const CaseSpecDesigner = ({ spec, insertChain }: CaseSpecDesignerProps) => {
  const [categorizationKey, setCategorizationKey] = useState<string>(spec.categorization_key);
  return (
    <div className="case-spec spec-designer">
      <h3 className="chain-id">Case {spec.chain_id}</h3>
      <div className="form-element">
        <label>Category Key</label>
        <input className="var-name-input" value={categorizationKey} onChange={e => setCategorizationKey(e.target.value)} />
      </div>
      <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={0} />
      {Object.entries(spec.cases).flatMap((item: [string, ChainSpec], idx: number) => [
        <div className="case-spec-case" key={`spec-case-${item[1].chain_id}`}>
          <input className="case-spec-case__key" defaultValue={item[0]} />
          {renderChainSpec(item[1] as ChainSpec, insertChain)}
        </div>,
        <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={idx+1} key={`button-${idx+1}`}/>,
      ])}
    </div>
  );
};

interface ReformatSpecDesignerProps { spec: ReformatSpec };
const ReformatSpecDesigner = ({ spec }: ReformatSpecDesignerProps) => {
  return (
    <div className="reformat-spec spec-designer">
      <h3 className="chain-id">Reformat {spec.chain_id}</h3>
      {Object.keys(spec.formatters).map((key, index) => (
        <div className="reformat-spec-designer__formatter" key={`reformat-${index}`}>
          <label>{key}</label>
          <textarea className="reformat-spec-designer reformat-input" defaultValue={spec.formatters[key]}>
          </textarea>
        </div>
      ))}
    </div>
  );
};

interface APISpecDesignerProps { spec: APISpec };
const APISpecDesigner = ({ spec }: APISpecDesignerProps) => {
  return (
    <div className="api-spec spec-designer">
      <h3 className="chain-id">API {spec.chain_id}</h3>
    </div>
  );
};

const renderChainSpec = (spec: ChainSpec, insertChain: InsertChainFunc) => {
  switch (spec.chain_type) {
    case "llm_spec":
      return <LLMSpecDesigner spec={spec} key={`llm-spec-${spec.chain_id}`} />;
    case "sequential_spec":
      return <SequentialSpecDesigner spec={spec} insertChain={insertChain} key={`sequential-spec-${spec.chain_id}`} />;
    case "case_spec":
      return <CaseSpecDesigner spec={spec} insertChain={insertChain} key={`case-spec-${spec.chain_id}`} />;
    case "reformat_spec":
      return <ReformatSpecDesigner spec={spec} key={`reformat-spec-${spec.chain_id}`}/>;
    case "api_spec":
      return <APISpecDesigner spec={spec} key={`api-spec-${spec.chain_id}`}/>;
  }
};

const Designer = () => {
  const { chainSpec: spec, insertChainSpec } = useContext(ChainSpecContext);

  return (
    <div className="designer">
      { spec ? renderChainSpec(spec, insertChainSpec) : <InsertChainSpec insertChain={insertChainSpec} chainId={0} index={0}/> }
    </div>
  );
};

export default Designer;
