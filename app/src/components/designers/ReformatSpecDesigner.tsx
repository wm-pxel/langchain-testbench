import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { ReformatSpec } from '../../model/specs';
import ChainSpecContext from "../../contexts/ChainSpecContext";
import FormatReducer from "../../util/FormatReducer";
import DeleteChainButton from "./DeleteChainButton";
import HighlightedTextarea from "../HighlightedTextarea";

type ExtendedFormatterState = [inputs: Set<string>, internal: Set<string>];

const extendedFormatterRegex = /(\{\{)|\{(join|parse_json|let|expr|int|float):([^:\{\}]+)(:([^:\{\}]+))?\}|(\{([^\{\}]*)\})/g;
const parseFormatExpression = (expr: string): [string, string] => {
  const variable = expr.match(/^[_A-Za-z0-9]+/)?.[0] || '';
  return [variable, expr.slice(variable.length)];
};
const condAdd = (set1: Set<string>, set2: Set<string>, item: string): Set<string> => (
  set2.has(item) ? set1 : set1.add(item)
);

const extendedFormatterReduceFunc = (
  [inputs, internal]: ExtendedFormatterState,
  _: string,
  escape: string | undefined,
  exprType: string | undefined,
  exprParam1: string | undefined,
  _ep2Group: string | undefined,
  exprParam2: string | undefined,
  stdExpr: string | undefined,
  stdExprVar: string | undefined,
): [ExtendedFormatterState, string] => {
  if (escape) return [[inputs, internal], escape];

  const [newInputs, newInternal] = [new Set(inputs), new Set(internal)];
  if (exprType === 'parse_json' || exprType === 'let' || exprType === 'int' || exprType === 'float') {
    const [variable, expr] = parseFormatExpression(exprParam1 || '');
    return [
      [condAdd(newInputs, newInternal, variable), newInternal.add(exprParam2 || 'data')], 
      `<span class="expr">\{${exprType}:<span class="var-name">${variable}</span>${expr}:${exprParam2}\}</span>`
    ];
  } else if (exprType === 'join') {
    const [variable, expr] = parseFormatExpression(exprParam1 || '');
    return [
      [condAdd(newInputs, newInternal, variable), newInternal.add('item').add('index')],
      `<span class="expr">\{${exprType}:<span class="var-name">${variable}</span>${expr}:${exprParam2}\}</span>`
    ];
  } else if (exprType === 'expr') {
    const formatted = exprParam1?.replace(/[_A-Za-z][_A-Za-z0-9]*/g, (variable) => { 
      condAdd(newInputs, newInternal, variable); 
      return `<span class="var-name">${variable}</span>`;
    });
    return [
      [newInputs, newInternal.add(exprParam2 || 'data')],
      `<span class="expr">\{${exprType}:${formatted}:${exprParam2}\}</span>`
    ]
  } else if (stdExpr) {
    const [variable, expr] = parseFormatExpression(stdExprVar || '');
    return [
      [condAdd(newInputs, newInternal, variable), newInternal],
      `<span class="expr">\{<span class="var-name">${variable}</span>${expr}\}</span>`
    ]
  }
  return [[newInputs, newInternal], '<span class="error">ERROR</span>'];
}

interface ReformatSpecDesignerProps { spec: ReformatSpec  };

const ReformatSpecDesigner = ({ spec }: ReformatSpecDesignerProps) => {
  const { deleteChainSpec, updateChainSpec } = useContext(ChainSpecContext);
  const [formatters, setFormatters] = useState<[string, string][]>([]);
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    setFormatters(Object.entries({...spec.formatters}));
  }, [spec]);

  const updateFormatter = useCallback((index: number, key: string, value: string) => {
    setFormatters([
      ...formatters.slice(0, index), [key, value], ...formatters.slice(index+1)
    ]);
  }, [formatters]);

  const formatReducer = useMemo(() => new FormatReducer<ExtendedFormatterState>(
    extendedFormatterRegex,
    () => [new Set<string>(), new Set<string>()],
    extendedFormatterReduceFunc,
    ([inputs, _]: ExtendedFormatterState) => setVariables(Array.from(inputs))
  ), []);

  const addFormatter = useCallback(() => {
    setFormatters([...formatters, [`output_key_${formatters.length}`, '']]);
  }, [formatters]);

  useEffect(() => {
    updateChainSpec({
      ...spec,
      input_keys: variables,
      formatters: Object.fromEntries(formatters),
    });
  }, [formatters, variables]);

  return (
    <div className="reformat-spec spec-designer">
      <h3 className="chain-id">Reformat {spec.chain_id}</h3>
      <DeleteChainButton modalKey={`delete-menu-${spec.chain_id}`} onDelete={() => deleteChainSpec(spec.chain_id)}/>
      <div className="formatters">
        { formatters.map(([key, value], idx) => (
          <div className="formatter form-element" key={`reformat-${idx}`}>
            <input className="formatter__key var-name-input"
              defaultValue={key}
              onChange={(e) => updateFormatter(idx, e.target.value, value)}
              placeholder="Output Key"
            />

            <HighlightedTextarea
              value={value}
              onChange={(newValue) => updateFormatter(idx, key, newValue)}
              formatReducer={formatReducer}
              placeholder="Enter format command."
            />
          </div>
        ))}
      </div>
      <button className="add-formatter" onClick={addFormatter}>+ formatter</button>
    </div>
  );
};

export default ReformatSpecDesigner;