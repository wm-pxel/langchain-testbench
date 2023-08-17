from typing import Dict, List
from langchain.chains import LLMChain


class LLMRecordingChain(LLMChain):
  recorded_calls: List[tuple[Dict[str, str], Dict[str, str]]]
  chain_spec_id: int

  def __init__(self, llm: object, prompt: str, output_key: str, chain_spec_id: int):
    super().__init__(llm=llm, prompt=prompt, output_key=output_key, chain_spec_id=chain_spec_id, recorded_calls=[])

  def _call(self, inputs: Dict[str, str]) -> Dict[str, str]:
    output = super()._call(inputs)
    self.recorded_calls.append((dict(inputs), output[self.output_key]))
    return output

  @property
  def calls(self) -> List[tuple[Dict[str, str], Dict[str, str]]]:
    return self.recorded_calls

  def reset(self):
    self.recorded_calls.clear()
