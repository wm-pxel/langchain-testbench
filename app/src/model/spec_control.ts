import { ChainSpec } from './specs';
import { Revision } from './revision';
import { union, difference, intersection } from '../util/sets';

export interface UpdateChainFound {
  chainSpec: ChainSpec;
  found: true;
}

export interface UpdateChainNotFound { found: false; }

export type UpdateChainResult = UpdateChainFound | UpdateChainNotFound;

interface UpdateChildrenResult {
  found: boolean;
  chainSpecs: ChainSpec[];
}

interface UpdateCaseResult {
  found: boolean;
  chainSpecs: [string, ChainSpec][];
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
      if (chainSpec.default_case && chainSpec.default_case.chain_id === chainId) {
        return chainSpec.default_case;
      }
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

export const findNextChainId = (chainSpec: ChainSpec): number => {
  switch (chainSpec.chain_type) {
    case 'sequential_spec':
      return chainSpec.chains.reduce((acc, chain) => Math.max(acc, findNextChainId(chain)), chainSpec.chain_id + 1);
    case 'case_spec':
      return [...Object.values(chainSpec.cases), chainSpec.default_case].reduce((acc, chain) => {
        if (chain == null) return acc;
        return Math.max(acc, findNextChainId(chain));
      }, chainSpec.chain_id + 1);
    default:
      return chainSpec.chain_id + 1;
  }
}

export const computeChainIO = (spec: ChainSpec): [Set<string>, Set<string>] => {
  switch (spec.chain_type) {
    case 'llm_spec':
      return [new Set(spec.input_keys), new Set([spec.output_key])];

    case 'sequential_spec':
      const [sin, sout] = spec.chains.reduce(([inputs, outputs], child) => {
        const [specIn, specOut] = computeChainIO(child);
        return [union(inputs, difference(specIn, outputs)), union(outputs, specOut)];
      }, [new Set(), new Set()] as [Set<string>, Set<string>]);

      return [sin, sout];

    case 'case_spec':
      return [...Object.values(spec.cases), spec.default_case].reduce(([inputs, outputs], spec, idx) => {
        if (spec == null) return [inputs, outputs];
        const [specIn, specOut] = computeChainIO(spec);
        return [union(inputs, specIn), idx ? intersection(outputs, specOut) : specOut];
      }, [new Set(), new Set()] as [Set<string>, Set<string>]);

    case 'api_spec':
      return [new Set(spec.input_keys), new Set([spec.output_key])];

    case 'reformat_spec':
      return [new Set(spec.input_keys), new Set(Object.keys(spec.formatters))];
  }
}

export const updateChildIO = (spec: ChainSpec) => {
  switch (spec.chain_type) {
    case 'sequential_spec':
      spec.chains.forEach(updateChildIO);
      const [inKeys, outKeys] = computeChainIO(spec);
      spec.input_keys = Array.from(inKeys);
      spec.output_keys = Array.from(outKeys);
      return;
    case 'case_spec':
      Object.values(spec.cases).forEach(updateChildIO);
      if (spec.default_case) updateChildIO(spec.default_case);
      return;
  }
}

export const createRevision = (parent: string | null, chain: ChainSpec, llms: Record<string,any>): Revision => {
  updateChildIO(chain);
  return { parent, chain, llms }
}

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
        formatters: {'output_key_0': ''},
      };
    default:
      throw new Error(`Unknown spec type: ${type}`);
  }
};

export const insertChainSpec = (
  originalSpec: ChainSpec | null,
  nextChainId: number,
  type: string,
  chainId: number,
  index: number
): ChainSpec => {
  if (!originalSpec) {
    return {chain_id: nextChainId, ...generateDefaultSpec(type)} as ChainSpec;
  }
  const chainSpec = findByChainId(chainId, originalSpec);
  if (!chainSpec) {
    return originalSpec;
  }
  switch (originalSpec.chain_type) {
    case 'sequential_spec':
      if (chainId === originalSpec.chain_id) {
        return {...originalSpec, chains: [
          ...originalSpec.chains.slice(0, index), 
          {chain_id: nextChainId, ...generateDefaultSpec(type)} as ChainSpec, 
          ...originalSpec.chains.slice(index)
        ]};
      } else {
        return {
          ...originalSpec, 
          chains: originalSpec.chains.map(chain => insertChainSpec(chain, nextChainId, type, chainId, index))
        };
      }
      break;
    case 'case_spec':
      const caseEntries = Object.entries(originalSpec.cases)
      if (chainId === originalSpec.chain_id) {
        return {
          ...originalSpec,
          cases: Object.fromEntries([
            ...caseEntries.slice(0, index), 
            [`case text ${nextChainId}`, {chain_id: nextChainId, ...generateDefaultSpec(type)} as ChainSpec],
            ...caseEntries.slice(index)
          ])
        };
      } else {
        return {
          ...originalSpec,
          cases: Object.fromEntries(caseEntries.map(([key, chain]) => [
            key,
            insertChainSpec(chain, nextChainId, type, chainId, index)
          ])),
          default_case: originalSpec.default_case ? insertChainSpec(originalSpec.default_case, nextChainId, type, chainId, index) : null,
        }
      }
  }
  return originalSpec;
}

export const deleteChainSpec = (originalSpec: ChainSpec | null, chainId: number): ChainSpec | null => {
  if (!originalSpec || originalSpec.chain_id === chainId) return null;

  switch (originalSpec.chain_type) {
    case 'sequential_spec':
      const chains = originalSpec.chains;
      const newChains = [];
      for (let i=0; i<chains.length; i++) {
        const newChain = deleteChainSpec(chains[i], chainId)
        if (newChain) newChains.push(newChain);
      }
      return {...originalSpec, chains: newChains};
    case 'case_spec':
      const cases = originalSpec.cases;
      const newCases: Record<string, ChainSpec> = {};
      for (const [key, chain] of Object.entries(cases)) {
        const newChain = deleteChainSpec(chain, chainId);
        if (newChain) newCases[key] = newChain;
      }
      return {...originalSpec,
        cases: newCases,
        default_case: deleteChainSpec(originalSpec.default_case, chainId)
      };
    }

  return originalSpec;
}

export const updateChainSpec = (
  originalSpec: ChainSpec | null,
  newSubSpec: ChainSpec,
): UpdateChainResult => {
  if (originalSpec === null) {
    return {found: false};
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
        chainSpecs: [...result.chainSpecs, nextResult.found ? nextResult.chainSpec : chainSpec]
      } as UpdateChildrenResult;
    }, { found: false, chainSpecs: [] as ChainSpec[] });

    return chains.found
      ? {
          found: true,
          chainSpec: {...originalSpec, chains: chains.chainSpecs}
        }
      : { found: false };
  }
      
  if (originalSpec.chain_type === 'case_spec') {
    if (originalSpec.default_case) {
      const nextResult = updateChainSpec(originalSpec.default_case, newSubSpec);
      if (nextResult.found) {
        return {
          found: true,
          chainSpec: {...originalSpec, default_case: nextResult.chainSpec}
        }
      }
    }

    const cases = Object.entries(originalSpec.cases).reduce((result, [key, chainSpec]) => {
      const nextResult: UpdateChainResult = result.found
        ? { found: true, chainSpec }
        : updateChainSpec(chainSpec, newSubSpec);
      return {
        found: nextResult.found,
        chainSpecs: [...result.chainSpecs, [key, nextResult.found ? nextResult.chainSpec : chainSpec]]
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

  return { found: false };
}
