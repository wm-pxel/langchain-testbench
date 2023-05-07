import { ChainSpec } from './specs';

export const generateDefaultSpec = (type: string): Partial<ChainSpec> => {
  switch (type) {
    case 'llm_spec':
      return {
        chain_type: "llm_spec",
        prompt: "",
        input_keys: [],
        output_key: "text",
        llm_key: "llm",        
      };
    case 'sequential_spec':
      return {
        chain_type: "sequential_spec",
        chains: [],
        input_keys: [],
        output_keys: [],
      };
    case 'case_spec':
      return {
        chain_type: "case_spec",
        categorization_key: "",
        cases: {},
      };
    case 'api_spec':
      return {
        chain_type: "api_spec",
        url: "",
        method: "GET",
        headers: {},
        body: "",
        input_keys: [],
        output_key: "results",
      };
    case 'reformat_spec':
      return {
        chain_type: "reformat_spec",
        input_keys: [],
        formatters: {},
      };
    default:
      throw new Error(`Unknown spec type: ${type}`);
  }
}

export const findByChainId = (chainId: number, chainSpec: ChainSpec): ChainSpec | undefined => {
  if (chainSpec.chain_id === chainId) {
    return chainSpec;
  }
  switch (chainSpec.chain_type) {
    case 'sequential_spec':
      for (const chain of chainSpec.chains) {
        const result = findByChainId(chainId, chain);
        if (result) {
          return result;
        }
      }
      break;
    case 'case_spec':
      for (const chain of Object.values(chainSpec.cases)) {
        const result = findByChainId(chainId, chain);
        if (result) {
          return result;
        }
      }
      break;
  }
  return undefined;
}

export const insertChainSpec = (
  originalSpec: ChainSpec | null,
  nextChainId: number,
  type: string,
  chainId: number,
  index: number
): ChainSpec => {
  const chainSpec = originalSpec && findByChainId(chainId, originalSpec);
  if (!chainSpec) {
    return {chain_id: nextChainId, ...generateDefaultSpec(type)} as ChainSpec;
  }
  switch (chainSpec.chain_type) {
    case 'sequential_spec':
      chainSpec.chains = [
        ...chainSpec.chains.slice(0, index), 
        {chain_id: nextChainId, ...generateDefaultSpec(type)} as ChainSpec, 
        ...chainSpec.chains.slice(index)
      ];
      break;
    case 'case_spec':
      const caseEntries = Object.entries(chainSpec.cases)
      chainSpec.cases = Object.fromEntries([
        ...caseEntries.slice(0, index), 
        [`case text ${nextChainId}`, {chain_id: nextChainId, ...generateDefaultSpec(type)} as ChainSpec],
        ...caseEntries.slice(index)
      ]);
  }
  return originalSpec;
}

export interface UpdateChainResult {
  chainSpec: ChainSpec | null;
  found: boolean;
}

interface UpdateChildrenResult {
  found: boolean;
  chainSpecs: ChainSpec[];
}

interface UpdateCaseResult {
  found: boolean;
  chainSpecs: [string, ChainSpec][];
}

export const updateChainSpec = (
  originalSpec: ChainSpec | null,
  newSubSpec: ChainSpec,
): UpdateChainResult => {
  if (originalSpec === null) {
    return {chainSpec: null, found: false};
  }

  if (originalSpec.chain_id === newSubSpec.chain_id) {
    return {chainSpec: newSubSpec, found: true};
  }

  if (originalSpec.chain_type === 'sequential_spec') {
    const chains =  originalSpec.chains.reduce((result, chainSpec) => {
      const nextResult: UpdateChainResult = result.found 
        ? { found: true, chainSpec }
        : updateChainSpec(chainSpec, newSubSpec);
      return { 
        found: nextResult.found,
        chainSpecs: [...result.chainSpecs, nextResult.chainSpec] 
      } as UpdateChildrenResult;
    }, { found: false, chainSpecs: [] as ChainSpec[] });
    return {
      found: chains.found,
      chainSpec: {
        ...originalSpec,
        chains: chains.chainSpecs,
      }
    }
  }
      
  if (originalSpec.chain_type === 'case_spec') {
    const cases = Object.entries(originalSpec.cases).reduce((result, [key, chainSpec]) => {
      const nextResult: UpdateChainResult = result.found
        ? { found: true, chainSpec }
        : updateChainSpec(chainSpec, newSubSpec);
      return {
        found: nextResult.found,
        chainSpecs: [...result.chainSpecs, [key, nextResult.chainSpec]]
      } as UpdateCaseResult;
    }, { found: false, chainSpecs: [] as [string, ChainSpec][] });
    return {
      found: cases.found,
      chainSpec: {
        ...originalSpec,
        cases: Object.fromEntries(cases.chainSpecs),
      }
    }
  }

  return { chainSpec: originalSpec, found: false };
}