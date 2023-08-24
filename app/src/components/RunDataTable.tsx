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
  runData: {
    id: number;
    creationDate: string;
    rootType: string;
    input: string;
    output: string;
    history: RunDataHistoryMessage[];
  };
  showInfo: boolean;
  toggleInfo: (id: number) => void;
};

const RunDataRow: React.FC<RunDataRowProps> = ({
  runData,
  showInfo,
  toggleInfo,
}) => {
  const handleRunClick = () => {
    console.log(`Running ID: ${runData.id}`);
  };

  return (
    <>
      <tr>
        <DataCell content={runData.id} maxWidth={"1em"} />
        <DataCell content={runData.creationDate} maxWidth={"15em"} />
        <DataCell content={runData.rootType} maxWidth={"10em"} />
        <DataCell content={runData.input} maxWidth={"30em"} />
        <DataCell content={runData.output} maxWidth={"80em"} />
        <td>
          <button onClick={handleRunClick}>Run</button>
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
                <strong>Creation Date:</strong>{" "}
                {new Date(runData.creationDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Root Type:</strong> {runData.rootType}
              </p>
              <p>
                <strong>Input:</strong> {runData.input}
              </p>
              <p>
                <strong>Output:</strong> {runData.output}
              </p>
              <div>
                <strong>History:</strong>
                <ul>
                  {runData.history.map((entry, index) => (
                    <li key={index}>
                      <strong>{Object.entries(entry)[0][0]}: </strong>
                      {Object.entries(entry)[0][1]}
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

type RunDataHistoryMessage = {
  [key: string]: string;
};

type RunData = {
  id: number;
  creationDate: string;
  rootType: string;
  input: string;
  output: string;
  history: RunDataHistoryMessage[];
};

type RunDataTableProps = {
  data: RunData[];
  showInfoForRow: number | null;
  setShowInfoForRow: React.Dispatch<React.SetStateAction<number | null>>;
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
            <th>Creation Date</th>
            <th>Root Type</th>
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
              toggleInfo={(id: number) => {
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
