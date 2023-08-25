import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PreviousRunsContext } from "../contexts/PreviousRunsContext";
import "./style/PreviousRuns.scss";
import RunDataTable, { RunData } from "./RunDataTable";
import { chainResults, saveRevision } from "../api/api";

const PreviousRuns = () => {
  const { isViewingPreviousRuns, chainName, updateViewingPreviousRuns } =
    useContext(PreviousRunsContext);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [visibilityState, setVisibilityState] = useState("absent");

  const [showInfoForRow, setShowInfoForRow] = useState<string | null>(null);

  const [data, setData] = useState<RunData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const chainHistory:RunData[] = await chainResults(chainName);
      setData(chainHistory);
      setIsLoading(false);

    } catch (error) {
      console.log("Error retrieving chain history: " + (error as Error).message);
      setError(error as Error);
      setIsLoading(false);
      return;
    }
  };

  useEffect(() => {
    if (isViewingPreviousRuns) {
      backgroundRef.current?.offsetHeight; // force reflow
      if (visibilityState === "absent") setVisibilityState("hidden");
      else if (visibilityState === "hidden") {
        setShowInfoForRow(null);
        fetchData();
        setVisibilityState("visible");
      }
    } else {
      if (visibilityState === "visible") setVisibilityState("hidden");
    }
  }, [isViewingPreviousRuns, visibilityState]);

  const closeModal = useCallback(() => {
    updateViewingPreviousRuns(false, '');
  }, [updateViewingPreviousRuns]);

  return (
    <div
      className={`edit-llms ${visibilityState}`}
      ref={backgroundRef}
      onTransitionEnd={() => {
        if (!isViewingPreviousRuns) setVisibilityState("absent");
      }}
    >
      <div className="edit-llms-header">
        <div className="spacer"></div>
        <h2>Previous Runs</h2>
        <div className="spacer">
          <button className="close-modal" onClick={closeModal}>
            x
          </button>
        </div>
      </div>
      <RunDataTable
        data={data}
        showInfoForRow={showInfoForRow}
        setShowInfoForRow={setShowInfoForRow}
      />
    </div>
  );
};

export default PreviousRuns;
