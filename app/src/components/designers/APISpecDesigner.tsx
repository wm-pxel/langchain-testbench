import { useContext, useEffect, useCallback, useState } from "react";
import { APISpec } from '../../model/specs';
import ChainSpecContext from "../../contexts/ChainSpecContext";
import DeleteChainButton from "./DeleteChainButton";

interface APISpecDesignerProps { spec: APISpec };

const APISpecDesigner = ({ spec }: APISpecDesignerProps) => {
  const { deleteChainSpec, updateChainSpec } = useContext(ChainSpecContext);

  const [url, setUrl] = useState<string>(spec.url);
  const [method, setMethod] = useState<string>(spec.method);
  const [headers, setHeaders] = useState<string>(JSON.stringify(spec.headers, null, 2));
  const [headersError, setHeadersError] = useState<boolean>(false);
  const [body, setBody] = useState<string | null>(spec.body);
  const [outputKey, setOutputKey] = useState<string>(spec.output_key);

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
    const vars = new Set<string>();
    const regex = /\{([a-zA-Z0-9_]+)\}/g;
    const add = (_: string, ...matches: any[]): string => { vars.add(matches[0]); return ""; };
    url.replace(regex, add);
    method.replace(regex, add);
    headers.replace(regex, add);
    if (body) body.replace(regex, add);

    updateChainSpec({
      ...spec,
      url,
      method,
      input_keys: Array.from(vars),
      headers: tryParseHeaders(headers),
      body,
      output_key: outputKey,
    });
  }, [url, method, headers, body, outputKey]);

  return (
    <div className="api-spec spec-designer">
      <h3 className="chain-id">API {spec.chain_id}</h3>
      <DeleteChainButton modalKey={`delete-menu-${spec.chain_id}`} onDelete={() => deleteChainSpec(spec.chain_id)}/>
      <div className="form-element">
        <label>URL</label>
        <input className="text-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" />
      </div>
      <div className="form-element">
        <label>Method</label>
        <input className="text-input" value={method} onChange={e => setMethod(e.target.value)} placeholder="GET | POST" />
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
      <div className="form-element">
        <label>Output Key</label>
        <input className="var-name-input" value={outputKey} onChange={e => setOutputKey(e.target.value)} />
      </div>
    </div>
  );
};

export default APISpecDesigner;