import { useContext, useEffect, useState } from "react";
import { listChains, loadRevision, saveRevision } from "../api/api";
import { createRevision } from "../model/spec_control";
import ChainSpecContext from "../contexts/ChainSpecContext";
import { LLMContext } from "../contexts/LLMContext";
import "./style/Header.css";


const Header = () => {
  const { latestLLMs, setIsEditingLLMs, setLLMs } = useContext(LLMContext);
  const { 
    latestChainSpec, setChainName,  chainName, chainSpec, 
    setChainSpec, revision, setRevision, readyToInteract,
    isInteracting, setIsInteracting
  } = useContext(ChainSpecContext);
  const [revisions, setRevisions] = useState<Record<string, string>>({});

  useEffect(() => {
    listChains().then((chains) => setRevisions(chains));
  }, []);

  const loadLatest = async () => {
    const revision = await loadRevision(chainName);
    if (revision.id) setRevision(revision.id);
    setChainSpec(revision.chain);
    setLLMs(revision.llms);
  }

  const saveSpec = async () => {
    const spec = latestChainSpec();
    if (!spec) {
      throw new Error("No chain spec to save");
    }
    const llms = latestLLMs();
    const nextRevision = createRevision(revision, spec, llms);
    const nextRevisionId = await saveRevision(chainName, nextRevision);
    setRevision(nextRevisionId.revision_id);

    const chains = await listChains()
    setRevisions(chains);
  }

  return (
    <div className="header">
      <input type="text"
        className="chain-name"
        placeholder="Chain Name"
        defaultValue={chainName || ""} 
        onChange={e => setChainName(e.target.value)} />
      <div className="actions">
        <button onClick={() => setIsEditingLLMs(true)}>LLMs</button>
        <button disabled={!(chainSpec && chainName)} onClick={saveSpec}>
          Save Revision
        </button>
        <button disabled={!(chainName in revisions)} onClick={loadLatest}>
          Load Latest
        </button>
        <button disabled={!readyToInteract} onClick={() => setIsInteracting(!isInteracting)}>
          Interact
        </button>
      </div>
    </div>
  );
};

export default Header;