import { useContext } from "react";
import { SequentialSpec, ChainSpec } from '../../model/specs';
import ChainSpecContext from "../../contexts/ChainSpecContext";
import DeleteChainButton from "./DeleteChainButton";
import QuickMenu from "../QuickMenu";
import { renderChainSpec, specTypeOptions } from "./util";

interface SequentialSpecDesignerProps { spec: SequentialSpec };

const SequentialSpecDesigner = ({ spec }: SequentialSpecDesignerProps) => {
  const { insertChainSpec, deleteChainSpec } = useContext(ChainSpecContext);
  return (
    <div className="sequential-spec spec-designer">
      <h3 className="chain-id">Sequential {spec.chain_id}</h3>
      <DeleteChainButton modalKey={`delete-menu-${spec.chain_id}`} onDelete={() => deleteChainSpec(spec.chain_id)}/>
      <QuickMenu modalKey={`add-menu-${spec.chain_id}-0`} selectValue={(option) => insertChainSpec(option, spec.chain_id, 0)} options={specTypeOptions} />
      {spec.chains.flatMap((chain: ChainSpec, idx: number) => [
        renderChainSpec(chain),
        <QuickMenu modalKey={`add-menu-${spec.chain_id}-${idx}`} selectValue={(option) => insertChainSpec(option, spec.chain_id, idx+1)} options={specTypeOptions} key={`button-${idx+1}`}/>
      ])}
    </div>
  );
};

export default SequentialSpecDesigner;