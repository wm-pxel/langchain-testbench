import { ChainSpec } from './specs';
import { Revision } from './revision';
import { union, difference, intersection } from '../util/sets';

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

export const computeChainIO = (spec: ChainSpec): [Set<string>, Set<string>] => {
  switch (spec.chain_type) {
    case 'llm_spec':
      return [new Set(spec.input_keys), new Set([spec.output_key])];

    case 'sequential_spec':
      const [sin, sout] = spec.chains.reduce(([inputs, outputs], spec) => {
        const [specIn, specOut] = computeChainIO(spec);
        return [union(inputs, specIn), union(outputs, specOut)];
      }, [new Set(), new Set()] as [Set<string>, Set<string>]);

      return [difference(sin, sout), sout];

    case 'case_spec':
      return [...Object.values(spec.cases), spec.default_case].reduce(([inputs, outputs], spec) => {
        if (spec == null) return [inputs, outputs];
        const [specIn, specOut] = computeChainIO(spec);
        return [union(inputs, specIn), intersection(outputs, specOut)];
      }, [new Set(), new Set()] as [Set<string>, Set<string>]);

    case 'api_spec':
      return [new Set(spec.input_keys), new Set([spec.output_key])];

    case 'reformat_spec':
      return [new Set(spec.input_keys), new Set(Object.keys(spec.formatters))];
  }
}

const updateChildren = (spec: ChainSpec) => {
  switch (spec.chain_type) {
    case 'sequential_spec':
      spec.chains.forEach(updateChildren);
      const [inKeys, outKeys] = computeChainIO(spec);
      spec.input_keys = Array.from(inKeys);
      spec.output_keys = Array.from(outKeys);
      return;
    case 'case_spec':
      Object.values(spec.cases).forEach(updateChildren);
      return;
  }
}

export const createRevision = (parent: string | null, chain: ChainSpec, llms: Record<string,any>): Revision => {
  updateChildren(chain);
  return { parent, chain, llms }
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
    if (originalSpec.default_case && originalSpec.default_case.chain_id === newSubSpec.chain_id) {
      return { chainSpec: { ...originalSpec, default_case: newSubSpec }, found: true };
    }

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

export const defaultLLMs = {
  llm: {
    "model_name": "text-davinci-003",
    "temperature": 0.8,
    "max_tokens": 256,
    "top_p": 1.0,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0,
    "n": 1,
    "best_of": 1,
    "request_timeout": null,
    "logit_bias": {},
    "_type": "openai"
  }
}
