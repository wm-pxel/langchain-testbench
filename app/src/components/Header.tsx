import { useContext, useEffect, useState } from "react";
import { listChains, loadRevision, saveRevision } from "../api/api";
import { createRevision } from "../model/spec_control";
import ChainSpecContext from "../contexts/ChainSpecContext";
import { LLMContext } from "../contexts/LLMContext";
import FilterMenu from "./FilterMenu";
import TextModal from "./TextModal";
import { defaultLLMs } from "../model/llm";
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

  const loadLatest = async (name: string) => {
    setChainName(name);
    const revision = await loadRevision(name);
    if (revision.id) setRevision(revision.id);
    setChainSpec(revision.chain);
    setLLMs(revision.llms);
  }

  const newChain = (name: string) => {
    setChainName(name);
    setChainSpec(null);
    setLLMs(defaultLLMs);
    setRevision(null);
  }

  const isValid = async (text: string) => {
    var response = await listChains();
    var keys = Object.keys(response);
    if (keys.includes(text)) {
      return "Chain already exists";
    }
    return null;
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
    setChainSpec(spec);

    const chains = await listChains()
    setRevisions(chains);
  }

  return (
    <div className="header">
      <div className="file-options">
        <TextModal title="new" buttonText="Create" placeholder="name" enterValue={(name) => newChain(name)} validateInput={(text) => isValid(text)} />
        <FilterMenu title="load" selectValue={(value) => loadLatest(value)} options={Object.keys(revisions)} />
        <button disabled={!(chainSpec && chainName && !readyToInteract)} onClick={saveSpec}>
          Save
        </button>
      </div>
      <div className="chain-name">{chainName || ""}</div>
      <div className="actions">
        <button onClick={() => setIsEditingLLMs(true)}>LLMs</button>
        <button disabled={!readyToInteract} onClick={() => setIsInteracting(!isInteracting)}>
          Interact
        </button>
      </div>
    </div>
  );
};

export default Header;