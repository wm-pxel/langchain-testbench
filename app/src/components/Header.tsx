import { useEffect, useState } from "react";
import { useContext } from "react";
import { listChains, loadRevision, saveRevision } from "../api/api";
import { createRevision, defaultLLMs } from "../model/spec_control";
import ChainSpecContext from "../contexts/ChainSpecContext";
import "./style/Header.css";


const Header = () => {
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
  }

  const saveSpec = async () => {
    const spec = latestChainSpec();
    if (!spec) {
      throw new Error("No chain spec to save");
    }
    const nextRevision = createRevision(revision, spec, defaultLLMs);
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