import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PreviousRunsContext } from "../contexts/PreviousRunsContext";
import "./style/PreviousRuns.scss";
import RunDataTable from "./RunDataTable";
import data from "../util/mock-run-data.json";

const PreviousRuns = () => {
  const { isViewingPreviousRuns, setIsViewingPreviousRuns } =
    useContext(PreviousRunsContext);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [visibilityState, setVisibilityState] = useState("absent");

  const [showInfoForRow, setShowInfoForRow] = useState<number | null>(null);

  useEffect(() => {
    if (isViewingPreviousRuns) {
      backgroundRef.current?.offsetHeight; // force reflow
      if (visibilityState === "absent") setVisibilityState("hidden");
      else if (visibilityState === "hidden") {
        setShowInfoForRow(null);
        setVisibilityState("visible");
      }
    } else {
      if (visibilityState === "visible") setVisibilityState("hidden");
    }
  }, [isViewingPreviousRuns, visibilityState]);

  const closeModal = useCallback(() => {
    setIsViewingPreviousRuns(false);
  }, [setIsViewingPreviousRuns]);

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
