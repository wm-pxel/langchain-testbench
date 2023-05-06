import React, { createContext, useState } from "react";
import { ChainSpec } from "../model/specs";
import { insertChainSpec as insertGeneratedChainSpec } from "../model/spec_control";

export type SpecHandler = (genSpec: () => ChainSpec) => void;

export interface ChainSpecContextType {
  chainSpec: ChainSpec | null;
  insertChainSpec: (type: string, chainId: number, index: number) => void,
  specHandler: SpecHandler,
}

// const spec: ChainSpec = {
//   chain_id: 1,
//   chain_type: "sequential_spec",
//   input_keys: ["input"],
//   output_keys: ["description"],
//   chains: [
//     { 
//       chain_id: 0,
//       chain_type: "llm_spec",
//       prompt: "What is your name?",
//       input_keys: ["name"],
//       output_key: "name",
//       llm_key: "llm",
//     },
//     {
//       chain_id: 2,
//       chain_type: "case_spec",
//       categorization_key: "name",
//       default_case: {
//         chain_id: 10,
//         chain_type: "llm_spec",
//         prompt: "What is your name?",
//         input_keys: ["name"],
//         output_key: "name",
//         llm_key: "llm",          
//       },
//       cases: {
//         "John": {
//           chain_id: 3,
//           chain_type: "sequential_spec",
//           input_keys: ["name"],
//           output_keys: ["results"],
//           chains: [
//             {
//               chain_type: "api_spec",
//               chain_id: 4,
//               url: "https://api.example.com",
//               method: "GET",
//               headers: {},
//               body: '',
//               input_keys: ["name"],
//               output_key: "results",
//             },
//             {
//               chain_id: 5,
//               chain_type: "reformat_spec",
//               input_keys: ["results"],
//               formatters: {
//                 "foo": "bar",
//               }
//             },
//           ]
//         },
//         "Jane": {
//           chain_id: 6,
//           chain_type: "sequential_spec",
//           input_keys: ["name"],
//           output_keys: ["results"],
//           chains: [
//             {
//               chain_type: "api_spec",
//               chain_id: 7,
//               url: "https://api.example.com",
//               method: "GET",
//               headers: {},
//               body: '',
//               input_keys: ["name"],
//               output_key: "results",
//             },
//             {
//               chain_id: 8,
//               chain_type: "reformat_spec",
//               input_keys: ["results"],
//               formatters: {
//                 "foo": "bar",
//               }
//             },
//           ]
//         },
//       }
//     },
//     { 
//       chain_id: 9,
//       chain_type: "llm_spec",
//       prompt: "Describe these results {results}",
//       input_keys: ["results"],
//       output_key: "description",
//       llm_key: "llm",
//     },
//   ]
// };

const ChainSpecContext = createContext<ChainSpecContextType>({
  chainSpec: null,
  insertChainSpec: (_: string, _chainId: number, _index: number) => {},
  specHandler: () => ({}),
});

interface ChainSpecProviderProps {
  children: React.ReactNode;
}

export const ChainSpecProvider: React.FC<ChainSpecProviderProps> = ({ children }) => {
  const [chainSpec, setChainSpec] = useState<ChainSpec | null>(null);
  const [nextChainId, setNextChainId] = useState<number>(0);
  const [chainRetriever, setChainRetriever] = useState<()=>ChainSpec>(() => ({} as ChainSpec));

  const insertChainSpec = (type: string, chainId: number, index: number): void => {
    console.log("type", type, "chainId", chainId, "index", index);
    setChainSpec(insertGeneratedChainSpec(chainSpec, nextChainId, type, chainId, index))
    setNextChainId(nextChainId + 1);
  }

  const specHandler = (genSpec: () => ChainSpec): void => {
    setChainRetriever(genSpec);
  }
  

  return (
    <ChainSpecContext.Provider value={{ chainSpec, insertChainSpec, specHandler }}>
      {children}
    </ChainSpecContext.Provider>
  );
};

export default ChainSpecContext;