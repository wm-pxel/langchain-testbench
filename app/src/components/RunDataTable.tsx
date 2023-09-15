import "./style/RunDataTable.scss";

type DataCellProps = {
  content: string | number;
  maxWidth: string;
};

const DataCell: React.FC<DataCellProps> = ({ content, maxWidth }) => (
  <td style={{}}>
    <div
      style={{
        whiteSpace: "normal",
        maxWidth,
        maxHeight: "10em",
        textOverflow: "ellipsis",
        overflow: "hidden",
      }}
    >
      {content}
    </div>
  </td>
);

type RunDataRowProps = {
  runData: RunData;
  showInfo: boolean;
  toggleInfo: (id: string) => void;
};

const RunDataRow: React.FC<RunDataRowProps> = ({
  runData,
  showInfo,
  toggleInfo,
}) => {
  const handleRunClick = () => {
    console.log(`Running ID: ${runData.id}`);
  };

  const getValueFromLastOutputEntry = (data: RunData): string => {
    const firstOutputEntry = Object.values(data.outputs)[0];
    if (!firstOutputEntry || firstOutputEntry.length === 0) return '';
    const lastKeyInFirstOutput = firstOutputEntry[firstOutputEntry.length - 1];
    return data.io_mapping[lastKeyInFirstOutput];
  }

  const getValueFromInputZero = (data: RunData): string => {
    const inputZeroEntry = data.inputs["0"];
    if (!inputZeroEntry || inputZeroEntry.length === 0) return '';
    return data.io_mapping[inputZeroEntry[0]];
  }

  return (
    <>
      <tr>
        <DataCell content={runData.id} maxWidth={"15em"} />
        <DataCell content={runData.revisionID} maxWidth={"15em"} />
        <DataCell content={runData.recorded} maxWidth={"10em"} />
        <DataCell content={getValueFromInputZero(runData)} maxWidth={"30em"} />
        <DataCell content={getValueFromLastOutputEntry(runData)} maxWidth={"70em"} />
        <td>
          {/* <button onClick={handleRunClick}>Run</button> */}
          <button onClick={() => toggleInfo(runData.id)}>
            {showInfo ? "Hide Info" : "Show More Info"}
          </button>
        </td>
      </tr>
      {showInfo && (
        <tr>
          <td colSpan={6}>
            <div className="detailSection">
              <h3>Details for ID: {runData.id}</h3>
              <p>
                <strong>Revision:</strong> {runData.revisionID}
              </p>
              <p>
                <strong>Creation Date:</strong>{runData.recorded}
              </p>
              
              <p>
                <strong>Input:</strong> {getValueFromInputZero(runData)}
              </p>
              <p>
                <strong>Output:</strong> {getValueFromLastOutputEntry(runData)}
              </p>
              <div>
                <strong>History:</strong>
                <ul>
                  {Object.entries(runData.io_mapping).map(([key, value], index) => (
                    <li key={index}>
                      <strong>{key}: </strong>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export type RunData = {
  id: string;
  revisionID: string;
  inputs: { [key: string]: string[] };
  outputs: { [key: string]: string[] };
  io_mapping: { [key: string]: string };
  recorded: string;
};

type RunDataTableProps = {
  data: RunData[];
  showInfoForRow: string | null;
  setShowInfoForRow: React.Dispatch<React.SetStateAction<string | null>>;
};

const RunDataTable: React.FC<RunDataTableProps> = ({
  data,
  showInfoForRow,
  setShowInfoForRow,
}) => {
  return (
    <div className="scrollSection">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Revision ID</th>
            <th>Date Recorded</th>
            <th>Input</th>
            <th>Output</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((runData) => (
            <RunDataRow
              key={runData.id}
              showInfo={runData.id === showInfoForRow}
              toggleInfo={(id: string) => {
                if (id === showInfoForRow) {
                  setShowInfoForRow(null);
                } else {
                  setShowInfoForRow(id);
                }
              }}
              runData={runData as RunData}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunDataTable;
