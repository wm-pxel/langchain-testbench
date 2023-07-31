import { useContext, useEffect, useState } from "react";
import { TransformSpec } from '../../model/specs';
import ChainSpecContext from "../../contexts/ChainSpecContext";
import DeleteChainButton from "./DeleteChainButton";

interface TransformSpecDesignerProps { spec: TransformSpec  };

const TransformSpecDesigner = ({ spec }: TransformSpecDesignerProps) => {
  const { deleteChainSpec, updateChainSpec } = useContext(ChainSpecContext);
  const [transformFunc, setTransformFunc] = useState<string>(spec.transform_func ?? '');
  const [inputKeys, setInputKeys] = useState<string[]>(spec.input_keys);
  const [outputKeys, setOutputKeys] = useState<string[]>(spec.output_keys);


  useEffect(() => {
    setTransformFunc(spec.transform_func);
  }, [spec]);

  useEffect(() => {
    updateChainSpec({
      ...spec,
      input_keys: inputKeys,
      output_keys: outputKeys,
      transform_func: transformFunc,
    });
  }, [inputKeys, outputKeys, transformFunc]);

  return (
    <div className="transform-spec spec-designer">
      <h3 className="chain-id">Transform {spec.chain_id}</h3>
      <DeleteChainButton modalKey={`delete-menu-${spec.chain_id}`} onDelete={() => deleteChainSpec(spec.chain_id)}/>
      <div className="transformfuncs">
        <div className="form-element">
          <label>Input Keys</label>
          <input className="var-name-input" value={inputKeys} onChange={e => setInputKeys(e.target.value.split(","))} placeholder="input keys" />
        </div>
        <div className="highlighted-editor">
          <textarea className="highlighted-input transform-func" 
            value={transformFunc}
            onChange={(event) => setTransformFunc(event.target.value)}
            placeholder="Enter python function."
          />
        </div>
        <div className="form-element">
          <label>Output Keys</label>
          <input className="var-name-input" value={outputKeys} onChange={e => setOutputKeys(e.target.value.split(","))} placeholder="output keys" />
        </div>
      </div>
    </div>
  );
};

export default TransformSpecDesigner;