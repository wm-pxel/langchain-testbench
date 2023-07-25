import { useContext, useEffect, useState } from "react";
import { listChains, loadRevision, saveRevision, exportChain, importChain } from "../api/api";
import { createRevision } from "../model/spec_control";
import ChainSpecContext from "../contexts/ChainSpecContext";
import { LLMContext } from "../contexts/LLMContext";
import FilterMenu from "./FilterMenu";
import TextModal from "./TextModal";
import { defaultLLMs } from "../model/llm";
import { setTimedMessage } from "../util/errorhandling";
import "./style/Header.css";
import ImportChain from "./ImportChain";


const Header = () => {
  const { latestLLMs, setIsEditingLLMs, setLLMs } = useContext(LLMContext);
  const { 
    latestChainSpec, setChainName,  chainName, chainSpec, 
    setChainSpec, revision, setRevision, readyToInteract,
    isInteracting, setIsInteracting
  } = useContext(ChainSpecContext);
  const [revisions, setRevisions] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  useEffect(() => {
    listChainsAndUpdateRevisions();
    console.log('isImportModalOpen:', isImportModalOpen);
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
      setTimedMessage(setErrorMessage, "Error loading chain: " + (error as Error).message); 
    }
  }

  const newChain = (name: string) => {
    setErrorMessage(null);
    setChainName(name);
    setChainSpec(null);
    setLLMs(defaultLLMs);
    setRevision(null);
  }

  const isNewChainNameValid = (text: string) => {
    setErrorMessage(null);
    var response = listChainsAndUpdateRevisions();
    if (text in response) {
      setTimedMessage(setErrorMessage, `Chain name ${text} already exists`);
      return false;
    }
    return true;
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
      popupErrorMessage("Error saving chain: " + (error as Error).message); 
      return;
    }
    setChainSpec(spec);
    listChainsAndUpdateRevisions(); 
  }

  const exportChainClick = async () => {
    setErrorMessage(null);
    try {
      const blob = await exportChain(chainName);
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chainName}_exported_chain.json`;
      // Programmatically click the link to trigger the download
      link.click();
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      popupErrorMessage("Export failed: " + error);
    }    
  }

  const importChainClick = () => {
    setIsImportModalOpen(true);
    setErrorMessage(null);
  }


  const listChainsAndUpdateRevisions = async () =>  {
    const chains = await listChains()
    setRevisions(chains);
    return chains;
  }

  const popupErrorMessage = (message: string) => {
    setTimedMessage(setErrorMessage, message); 
  }


  return (
    <div className="page-top">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="header">
        <div className="file-options">
          <TextModal title="new" buttonText="Create" placeholder="name" enterValue={(name) => newChain(name)} validateInput={(text) => isNewChainNameValid(text)} />
          <FilterMenu title="load" selectValue={(value) => loadLatest(value)} options={Object.keys(revisions)} />
          <button disabled={!(chainSpec && chainName && !readyToInteract)} onClick={saveSpec}>
            Save
          </button>
          <button disabled={!(chainSpec && chainName)} onClick={exportChainClick}>
            Export
          </button>
          <button onClick={importChainClick}>
            Import
          </button>
          <ImportChain
            isImportModalOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
      />        </div>
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