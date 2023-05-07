from model.chain_spec import LLMSpec, SequentialSpec, CaseSpec, APISpec, ReformatSpec

class SpecFactoryContext:
  def __init__(self):
    self._next_id = 0

  def next_id(self):
    self._next_id += 1
    return self._next_id


def llm_factory(ctx, **kwargs) -> LLMSpec:
  return LLMSpec(
    chain_id=ctx.next_id(),
    input_keys=kwargs.get("input_keys", ["input1", "input2"]),
    output_key=kwargs.get("output_key", "output1"),
    prompt=kwargs.get("prompt", "prompt {input1} {input2}"),
    llm_key=kwargs.get("llm_key", "llm_key"),
    chain_type="llm_spec",
  )

def sequential_factory(ctx, **kwargs) -> SequentialSpec:
  return SequentialSpec(
    chain_id=ctx.next_id(),
    input_keys=kwargs.get("input_keys", ["input1", "input2"]),
    output_keys=kwargs.get("output_keys", ["output1", "output2"]),
    chain_type="sequential_spec",
    chains=kwargs.get("chains", []),
  )

def case_factory(ctx, **kwargs) -> CaseSpec:
  return CaseSpec(
    chain_id=ctx.next_id(),
    chain_type="case_spec",
    categorization_key=kwargs.get("categorization_key", "categorization_input"),
    cases=kwargs.get("cases", {}),
    default_case=kwargs.get("default_case", None),
  )

def api_factory(ctx, **kwargs) -> APISpec:
  return APISpec(
    chain_id=ctx.next_id(),
    chain_type="api_spec",
    input_keys=kwargs.get("input_keys", ["input1", "input2"]),
    output_key=kwargs.get("output_key", "output1"),
    url=kwargs.get("url", "http://test.com"),
    method=kwargs.get("method", "POST"),
    body=kwargs.get("body", "body {input1} {input2}"),
    headers=kwargs.get("headers", {"header1": "header1"}),
  )

def reformat_factory(ctx, **kwargs) -> ReformatSpec:
  return ReformatSpec(
    chain_id=ctx.next_id(),
    chain_type="reformat_spec",
    input_keys=kwargs.get("input_keys", ["input1", "input2"]),
    formatters=kwargs.get("formatters", {"output1": "formatter1", "output2": "formatter2"}),
  )
