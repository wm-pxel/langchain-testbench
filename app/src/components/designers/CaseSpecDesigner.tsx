import { useContext, useState, useEffect, useCallback } from "react";
import { CaseSpec, ChainSpec } from '../../model/specs';
import ChainSpecContext from "../../contexts/ChainSpecContext";
import DeleteChainButton from "./DeleteChainButton";
import QuickMenu from "../QuickMenu";
import { renderChainSpec, specTypeOptions } from "./util";

interface CaseSpecDesignerProps { spec: CaseSpec };

const CaseSpecDesigner = ({ spec }: CaseSpecDesignerProps) => {
  const { deleteChainSpec, findByChainId, insertChainSpec, updateChainSpec } = useContext(ChainSpecContext);
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
      <DeleteChainButton modalKey={`delete-menu-${spec.chain_id}`} onDelete={() => deleteChainSpec(spec.chain_id)}/>
      <div className="form-element">
        <label>Category Key</label>
        <input className="var-name-input" value={categorizationKey} onChange={e => setCategorizationKey(e.target.value)} />
      </div>
      <QuickMenu modalKey={`add-menu-${spec.chain_id}-0`} selectValue={(option) => insertChainSpec(option, spec.chain_id, 0)} options={specTypeOptions} />
      {cases.flatMap((item: [string, ChainSpec], idx: number) => [
        <div className="case-spec-case" key={`spec-case-${item[1].chain_id}`}>
          <input className="case-spec-case__key" defaultValue={item[0]} onChange={(e) => updateCaseKey(idx, e.target.value)} />
          {renderChainSpec(item[1] as ChainSpec)}
        </div>,
        <QuickMenu modalKey={`add-menu-${spec.chain_id}-${idx}`} selectValue={(option) => insertChainSpec(option, spec.chain_id, idx+1)} options={specTypeOptions} key={`button-${idx+1}`}/>,
      ])}
    </div>
  );
};

export default CaseSpecDesigner;