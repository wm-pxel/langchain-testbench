import { useEffect, useState } from "react";
import { useContext } from "react";
import { listChains, loadRevision } from "../api/api";
import ChainSpecContext from "../contexts/ChainSpecContext";
import "./style/Header.css";


const Header = () => {
  const { latestChainSpec, setChainName, chainName, setChainSpec } = useContext(ChainSpecContext);
  const [revisions, setRevisions] = useState<Record<string, string>>({});

  const logRevision = () => console.log(latestChainSpec());

  useEffect(() => {
    listChains().then((chains) => setRevisions(chains));
  }, []);

  const loadLatest = async () => {
    const revision = await loadRevision(chainName);
    setChainSpec(revision.chain);
  }

  return (
    <div className="header">
      <input type="text"
        className="chain-name"
        placeholder="Chain Name"
        defaultValue={chainName || ""} 
        onChange={e => setChainName(e.target.value)} />
      <div className="actions">
        <button onClick={logRevision}>
          Save Revision
        </button>
        <button disabled={!(chainName in revisions)} onClick={loadLatest}>
          Load Latest
        </button>
      </div>
    </div>
  );
};

export default Header;