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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    listChains().then((chains) => setRevisions(chains));
  }, []);

  const loadLatest = async (name: string) => {
    setErrorMessage(null);
    setChainName(name);
    try {
      const revision = await loadRevision(name);
      if (revision.id) setRevision(revision.id);
      setChainSpec(revision.chain);
      setLLMs(revision.llms);
    } catch (error) {
      setErrorMessage("Error loading chain: " + (error as Error).message); 
    }
  }

  const newChain = (name: string) => {
    setErrorMessage(null);
    setChainName(name);
    setChainSpec(null);
    setLLMs(defaultLLMs);
    setRevision(null);
  }

  const isNewChainNameValid = async (text: string) => {
    setErrorMessage(null);
    var response = await listChains();
    if (text in response) {
      setErrorMessage(`Chain name ${text} already exists`);
      return true;
    }
    return false;
  } 

  const saveSpec = async () => {
    setErrorMessage(null);
    const spec = latestChainSpec();
    if (!spec) {
      throw new Error("No chain spec to save");
    }
    const llms = latestLLMs();
    const nextRevision = createRevision(revision, spec, llms);
    try {
      const nextRevisionId = await saveRevision(chainName, nextRevision);
      setRevision(nextRevisionId.revision_id);
    } catch (error) {
      setErrorMessage("Error saving chain: " + (error as Error).message); 
      return;
    }
    setChainSpec(spec);

    const chains = await listChains()
    setRevisions(chains);
  }

  return (
    <div className="page-top">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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
    </div>
  );
};

export default Header;