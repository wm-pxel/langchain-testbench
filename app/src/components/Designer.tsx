import { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import { LLMSpec, SequentialSpec, CaseSpec, ReformatSpec, APISpec, ChainSpec } from '../model/specs';
import InsertChainSpec from "./InsertChainSpec";
import ChainSpecContext, { UpdateSpecFunc } from "../contexts/ChainSpecContext";
import DOMPurify from "dompurify";
import "./style/Designer.css"

type InsertChainFunc = (type: string, chainId: number, index: number) => void;

interface LLMSpecDesignerProps { spec: LLMSpec, updateChainSpec: UpdateSpecFunc };
const LLMSpecDesigner = ({ spec, updateChainSpec }: LLMSpecDesignerProps) => {
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

  useEffect(() => {
    updateChainSpec({
      ...spec,
      prompt,
      output_key: outuptKey,
      input_keys: variables,
    });
  }, [prompt, outuptKey, variables]);

  useEffect(() => {
    setPrompt(spec.prompt);
    setOutputKey(spec.output_key);
    setVariables(spec.input_keys);
  }, [spec]);

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

interface SequentialSpecDesignerProps { spec: SequentialSpec, insertChain: InsertChainFunc, updateChainSpec: UpdateSpecFunc };
const SequentialSpecDesigner = ({ spec, insertChain, updateChainSpec }: SequentialSpecDesignerProps) => {
  return (
    <div className="sequential-spec spec-designer">
      <h3 className="chain-id">Sequential {spec.chain_id}</h3>
      <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={0} />
      {spec.chains.flatMap((chain: ChainSpec, idx: number) => [
        renderChainSpec(chain, insertChain, updateChainSpec),
        <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={idx+1} key={`button-${idx+1}`}/>
      ])}
    </div>
  );
};

interface CaseSpecDesignerProps { spec: CaseSpec, insertChain: InsertChainFunc, updateChainSpec: UpdateSpecFunc };
const CaseSpecDesigner = ({ spec, insertChain, updateChainSpec }: CaseSpecDesignerProps) => {
  const { findByChainId } = useContext(ChainSpecContext);
  const [categorizationKey, setCategorizationKey] = useState<string>(spec.categorization_key);
  const [cases, setCases] = useState<[string, ChainSpec][]>([]);

  useEffect(() => {
    setCategorizationKey(spec.categorization_key);
    const newCases = {...spec.cases};
    if (spec.default_case) newCases._default = spec.default_case;
    setCases(Object.entries(newCases));
  }, [spec]);

  const updateCaseKey = useCallback((index: number, key: string) => {
    const newCases: [string, ChainSpec][] = [
      ...cases.slice(0, index),
      [key, cases[index][1]],
      ...cases.slice(index+1)];
    setCases(newCases);
  }, [cases]);

  const mustFind = (chainId: number): ChainSpec => {
    const chain = findByChainId(chainId);
    if (!chain) throw new Error(`Chain ${chainId} not found.`);
    return chain;
  };

  const computeCases = useCallback((): [ChainSpec, Record<string, ChainSpec>] => {
    const newCases = Object.fromEntries(cases.map(([key, chain]) => [key, mustFind(chain.chain_id)]));
    const defaultCase = newCases._default;
    delete newCases._default;
    return [defaultCase, newCases];
  }, [cases]);

  useEffect(() => {
    if (!cases.length) return;
    const [defaultCase, updatedCases] = computeCases();
    updateChainSpec({
      ...spec,
      cases: updatedCases,
      categorization_key: categorizationKey,
      default_case: defaultCase,
    });
  }, [categorizationKey, cases]);

  return (
    <div className="case-spec spec-designer">
      <h3 className="chain-id">Case {spec.chain_id}</h3>
      <div className="form-element">
        <label>Category Key</label>
        <input className="var-name-input" value={categorizationKey} onChange={e => setCategorizationKey(e.target.value)} />
      </div>
      <InsertChainSpec insertChain={insertChain} chainId={spec.chain_id} index={0} />
      {cases.flatMap((item: [string, ChainSpec], idx: number) => [
        <div className="case-spec-case" key={`spec-case-${item[1].chain_id}`}>
          <input className="case-spec-case__key" defaultValue={item[0]} onChange={(e) => updateCaseKey(idx, e.target.value)} />
          {renderChainSpec(item[1] as ChainSpec, insertChain, updateChainSpec)}
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

interface APISpecDesignerProps { spec: APISpec, updateChainSpec: UpdateSpecFunc };
const APISpecDesigner = ({ spec, updateChainSpec }: APISpecDesignerProps) => {
  const [url, setUrl] = useState<string>(spec.url);
  const [method, setMethod] = useState<string>(spec.method);
  const [headers, setHeaders] = useState<string>(JSON.stringify(spec.headers, null, 2));
  const [headersError, setHeadersError] = useState<boolean>(false);
  const [body, setBody] = useState<string | null>(spec.body);

  useEffect(() => {
    setUrl(spec.url);
    setMethod(spec.method);
    setHeaders(JSON.stringify(spec.headers, null, 2));
    setBody(spec.body);
  }, [spec]);

  const tryParseHeaders = useCallback((str: string) => {
    try {
      setHeadersError(false);
      return JSON.parse(str);
    } catch (e) {
      setHeadersError(true);
    }
    return spec.headers;
  }, [spec.headers]);

  useEffect(() => {
    updateChainSpec({
      ...spec,
      url,
      method,
      headers: tryParseHeaders(headers),
      body,
    });
  }, [url, method, headers, body]);

  return (
    <div className="api-spec spec-designer">
      <h3 className="chain-id">API {spec.chain_id}</h3>
      <div className="form-element">
        <label>URL</label>
        <input className="var-name-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" />
      </div>
      <div className="form-element">
        <label>Method</label>
        <input className="var-name-input" value={method} onChange={e => setMethod(e.target.value)} placeholder="GET | POST" />
      </div>
      <div className={`form-element text ${headersError ? "error" : ""}`}>
        <label>Headers</label>
        <textarea
          defaultValue={headers}
          onChange={e => setHeaders(e.target.value)}
          placeholder="{'header1': 'value'}"/>
      </div>
      <div className="form-element text">
        <label>Body</label>
        <textarea
          defaultValue={body || ""}
          onChange={e => setBody(e.target.value)}
          placeholder="Optional body content"/>
      </div>
    </div>
  );
};

const renderChainSpec = (spec: ChainSpec, insertChain: InsertChainFunc, updateSpec: UpdateSpecFunc) => {
  switch (spec.chain_type) {
    case "llm_spec":
      return <LLMSpecDesigner spec={spec} updateChainSpec={updateSpec} key={`llm-spec-${spec.chain_id}`} />;
    case "sequential_spec":
      return <SequentialSpecDesigner spec={spec} updateChainSpec={updateSpec} insertChain={insertChain} key={`sequential-spec-${spec.chain_id}`} />;
    case "case_spec":
      return <CaseSpecDesigner spec={spec} updateChainSpec={updateSpec} insertChain={insertChain} key={`case-spec-${spec.chain_id}`} />;
    case "reformat_spec":
      return <ReformatSpecDesigner spec={spec} key={`reformat-spec-${spec.chain_id}`}/>;
    case "api_spec":
      return <APISpecDesigner spec={spec} updateChainSpec={updateSpec} key={`api-spec-${spec.chain_id}`}/>;
  }
};

const Designer = () => {
  const { chainSpec: spec, insertChainSpec, updateChainSpec } = useContext(ChainSpecContext);

  return (
    <div className="designer">
      { spec 
        ? renderChainSpec(spec, insertChainSpec, updateChainSpec)
        : <InsertChainSpec insertChain={insertChainSpec} chainId={0} index={0}/> 
      }
    </div>
  );
};

export default Designer;
