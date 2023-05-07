import { useContext } from "react";
import ChainSpecContext from "../contexts/ChainSpecContext";


const Header = () => {
  const { latestChainSpec } = useContext(ChainSpecContext);

  const logRevision = () => console.log(latestChainSpec());

  return (
    <div className="header">
      <button onClick={logRevision}>
        Save Revision
      </button>
      <button>
        Reset Revision
      </button>
    </div>
  );
};

export default Header;