import { computeChainIO, deleteChainSpec, findByChainId, insertChainSpec, updateChildIO, updateChainSpec } from './spec_control';
import { CaseSpec, LLMSpec, SequentialSpec } from './specs';

const exampleSpec1 = (): SequentialSpec => ({
  chain_type: 'sequential_spec',
  chain_id: 1,
  input_keys: [],
  output_keys: [],
  chains: [
    {
      chain_type: 'llm_spec',
      chain_id: 2,
      input_keys: ['fish', 'cat'],
      output_key: 'dog',
      prompt: 'foo',
      llm_key: ''          
    },
    {
      chain_type: 'llm_spec',
      chain_id: 3,
      input_keys: ['dog', 'octopus'],
      output_key: 'tree',
      prompt: 'bar',
      llm_key: ''          
    }
  ]
});

const exampleSpec2 = (): SequentialSpec => ({
  chain_type: 'sequential_spec',
  chain_id: 1,
  input_keys: [],
  output_keys: [],
  chains: [
    {
      chain_type: 'llm_spec',
      chain_id: 2,
      input_keys: ['fish', 'cat'],
      output_key: 'dog',
      prompt: 'foo',
      llm_key: ''          
    },
    {
      chain_type: 'case_spec',
      chain_id: 3,
      categorization_key: 'baz',
      cases: {
        '1': {
          chain_type: 'llm_spec',
          chain_id: 4,
          input_keys: ['dog', 'octopus'],
          output_key: 'tree',
          prompt: 'bar',
          llm_key: ''
        }
      },
      default_case: {
        chain_type: 'llm_spec',
        chain_id: 5,
        input_keys: ['train', 'octopus'],
        output_key: 'tree',
        prompt: 'bar',
        llm_key: ''
      }
    }
  ]
});


describe('findByChainId', () => {
  it('should return the chain spec with the given chain id', () => {
    expect(findByChainId(3, exampleSpec1())).toEqual({
      chain_type: 'llm_spec',
      chain_id: 3,
      input_keys: ['dog', 'octopus'],
      output_key: 'tree',
      prompt: 'bar',
      llm_key: ''          
    });
  });

  it('should return null if no chain spec with the given chain id exists', () => {
    expect(findByChainId(4, exampleSpec1())).toBeUndefined();
  });
});

describe('computeChainIO', () => {
  it('should return the input and output keys of the given chain spec', () => {
    expect(computeChainIO(exampleSpec1().chains[0])).toEqual([
      new Set(['fish', 'cat']),
      new Set(['dog'])
    ]);
  });

  it('sequential spec input should be all child inputs not generated internally, and output should be union of outputs', () => {
    expect(computeChainIO(exampleSpec1())).toEqual([
      new Set(['fish', 'cat', 'octopus']), // dog is generated internally
      new Set(['dog', 'tree'])
    ]);
  });

  it('case spec input should be union of all case inputs internally, and output should be intersection of outputs', () => {
    const example = exampleSpec2().chains[1] as CaseSpec;
    expect(computeChainIO(example)).toEqual([
      new Set(['dog', 'octopus', 'train']), // dog is generated internally
      new Set(['tree'])
    ]);
  });
});

describe('updateChildIO', () => {
  it('should update sequential spec input and output based on child chains', () => {
    const example = exampleSpec1();
    updateChildIO(example);
    expect(example.input_keys).toEqual(['fish', 'cat', 'octopus']);
    expect(example.output_keys).toEqual(['dog', 'tree']);
  });

  it('should compute io recursively', () => {
    const example = exampleSpec2();
    updateChildIO(example);
    expect(example.input_keys).toEqual(['fish', 'cat', 'octopus', 'train']);
    expect(example.output_keys).toEqual(['dog', 'tree']);
  });
});

describe('insertChainSpec', () => {
  const expectedNewSpec = {chain_type: 'llm_spec', chain_id: 10, input_keys: [], output_key: 'text', prompt: '', llm_key: 'llm'};

  it('should replace an empty chain with the inserted spec', () => {
    const newSpec = insertChainSpec(null, 10, 'llm_spec', 0, 0);
    expect(newSpec).toEqual(expectedNewSpec);
  });

  it('should insert a chain spec into the beginning of a sequential spec', () => {
    const example = exampleSpec1();
    const newSpec = insertChainSpec(example, 10, 'llm_spec', 1, 0);
    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: [expectedNewSpec, ...example.chains]});
  });

  it('should insert a chain spec into the middle of a sequential spec', () => {
    const example = exampleSpec1();
    const newSpec = insertChainSpec(example, 10, 'llm_spec', 1, 1);
    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: [example.chains[0], expectedNewSpec, example.chains[1]]});
  });

  it('should insert a chain spec into the end of a sequential spec', () => {
    const example = exampleSpec1();
    const newSpec = insertChainSpec(example, 10, 'llm_spec', 1, 2);
    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: [...example.chains, expectedNewSpec]});
  });

  it('should insert into a case spec', () => {
    const example = exampleSpec2();
    const newSpec = insertChainSpec(example, 10, 'llm_spec', 3, 0);

    const exampleCase = example.chains[1] as CaseSpec;
    const expectedCaseSpec = {
      ...exampleCase,
      cases: {
        'case text 10': expectedNewSpec,
        ...exampleCase.cases
      }
    }

    expect(newSpec).toEqual({...example, chains: [example.chains[0], expectedCaseSpec]});
  });

  it('should not overwrite the default case', () => {
    const example = exampleSpec2();
    const exampleCase = example.chains[1] as CaseSpec;

    // modify case so it has a sequential spec case and no default
    exampleCase.default_case = null;
    const exampleSeq: SequentialSpec = {
      chain_type: 'sequential_spec',
      chain_id: 7,
      input_keys: [],
      output_keys: [],
      chains: []
    }
    exampleCase.cases['1'] = exampleSeq;

    const newSpec = insertChainSpec(example, 10, 'llm_spec', 7, 0);

    const expectedCaseSpec = {
      ...exampleCase,
      cases: {
        '1': {
          ...exampleSeq,
          chains: [expectedNewSpec]
        }
      }
    }

    expect(newSpec).toEqual({...example, chains: [example.chains[0], expectedCaseSpec]});
  });
});

describe('deleteChainSpec', () => {
  it('should not fail if the chain spec does not exist', () => {
    const example = exampleSpec1();
    const newSpec = deleteChainSpec(example, 10);
    expect(newSpec).toEqual(example);

    const deleteFromNothing = deleteChainSpec(null, 10);
    expect(deleteFromNothing).toBe(null);
  });

  it('should delete a chain spec from the beginning of a sequential spec', () => {
    const example = exampleSpec2();
    const newSpec = deleteChainSpec(example, 2);
    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: example.chains.slice(1)});
  });

  it('should delete a chain spec with children', () => {
    const example = exampleSpec2();
    const newSpec = deleteChainSpec(example, 3);
    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: example.chains.slice(0,1)});
  });

  it('should delete nested chain specs', () => {
    const example = exampleSpec2();
    const newSpec = deleteChainSpec(example, 4);

    const exampleCase = example.chains[1] as CaseSpec;

    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: [
      example.chains[0],
      {...exampleCase, cases: {}}
    ]});
  });

  it('should delete the default case', () => {
    const example = exampleSpec2();
    const newSpec = deleteChainSpec(example, 5);

    const exampleCase = example.chains[1] as CaseSpec;

    expect(newSpec).not.toBe(example);
    expect(newSpec).toEqual({...example, chains: [
      example.chains[0],
      {...exampleCase, default_case: null}
    ]});
  });
});

describe('updateChainSpec', () => {
  it('should update a simple chain', () => {
    const example = exampleSpec1().chains[0] as LLMSpec;
    const updated = {...example, llm_key: 'new_llm'};
    const result = updateChainSpec(example, updated);
    expect(result.found).toBe(true);
    if (!result.found) return;

    expect(result.chainSpec).toEqual(updated);
  });

  it('should update a nested chain', () => {
    const example = exampleSpec2();
    const updated = {...example.chains[0], prompt: 'new_prompt'};
    const result = updateChainSpec(example, updated);
    expect(result.found).toBe(true);
    if (!result.found) return;

    expect(result.chainSpec).toEqual({
      ...example,
      chains: [
        updated,
        ...example.chains.slice(1)
      ]
    });
  });

  it('should update a deeply nested chain', () => {
    const example = exampleSpec2();
    const caseSpec = example.chains[1] as CaseSpec;
    const updated = {...(caseSpec.cases['1'] as LLMSpec), llm_key: 'new_llm'};
    const result = updateChainSpec(example, updated);
    expect(result.found).toBe(true);
    if (!result.found) return;

    expect(result.chainSpec).toEqual({
      ...example,
      chains: [
        example.chains[0],
        {
          ...caseSpec,
          cases: {'1': updated}
        }
      ]
    });
  });

  it('should update the default case', () => {
    const example = exampleSpec2();
    const caseSpec = example.chains[1] as CaseSpec;
    const updated = {...(caseSpec.default_case as LLMSpec), llm_key: 'new_llm'};
    const result = updateChainSpec(example, updated);
    expect(result.found).toBe(true);
    if (!result.found) return;

    expect(result.chainSpec).toEqual({
      ...example,
      chains: [
        example.chains[0],
        {
          ...caseSpec,
          default_case: updated,
        }
      ]
    });
  });

  it('should indicate when the chain to be deleted is not found', () => {
    const example = exampleSpec2();

    const updated: LLMSpec = {
      chain_type: 'llm_spec',
      chain_id: 10,
      llm_key: 'new_llm',
      prompt: 'new_prompt',
      input_keys: [],
      output_key: 'output',
    }

    const result = updateChainSpec(example, updated);
    expect(result.found).toBe(false);
  });
});