import { useContext } from "react";
import QuickMenu from "./QuickMenu";
import ChainSpecContext from "../contexts/ChainSpecContext";
import { renderChainSpec, specTypeOptions } from "./designers/util";
import "./style/Designer.css"

const Designer = () => {
  const { chainSpec: spec, insertChainSpec, isInteracting } = useContext(ChainSpecContext);
  const { isChainActive } = useContext(ChainSpecContext);

  return (
    <div className={`designer ${isInteracting ? 'interacting' : ''}`}>
      {isChainActive ? (
        spec ? (
          renderChainSpec(spec)
        ) : (
          <QuickMenu modalKey={`add-menu-0-0`} selectValue={(option) => insertChainSpec(option, 0, 0)} options={specTypeOptions} />
        )
      ) : "click new or load to work with a chain"}
    </div>
  );
};

export default Designer;
