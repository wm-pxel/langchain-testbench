import { useState } from "react";
import "./style/InsertChainSpec.css";

interface InsertChainSpecProps {
  insertChain: (chainType: string, chainId: number, index: number) => void;
  chainId: number;
  index: number;
}
const InsertChainSpec = ({insertChain, chainId, index}: InsertChainSpecProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleInsert = (chainType: string) => {
    setModalOpen(false);
    insertChain(chainType, chainId, index);
  }

  return (
    <div className="insert-chain-spec">
      <button onClick={()=>setModalOpen(true)} className="open-insert-chain-spec">+</button>
      <div className={`chain-spec-type-selector ${modalOpen ? 'open' : ''}`}>
        <button onClick={() => handleInsert("llm_spec")}>
          LLM
        </button>
        <button onClick={() => handleInsert("sequential_spec")}>
          Sequential
        </button>
        <button onClick={() => handleInsert("case_spec")}>
          Case
        </button>
        <button onClick={() => handleInsert("reformat_spec")}>
          Reformat
        </button>
        <button onClick={() => handleInsert("api_spec")}>
          API
        </button>
      </div>
    </div>
  );
};

export default InsertChainSpec;