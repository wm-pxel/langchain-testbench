import json
from typing import Dict, List
from langchain.chains.base import Chain

class ReformatChain(Chain):
  input_variables: List[str]
  json_inputs: List[str] = []
  formatters: Dict[str, str]

  @property
  def input_keys(self) -> List[str]:    
    return self.input_variables

  @property
  def output_keys(self) -> List[str]:
    return self.formatters.keys()

  def _call(self, inputs: Dict[str, str]) -> Dict[str, str]:
    to_decode = set(self.json_inputs)
    maybe_decode = lambda k, v: json.loads(v) if k in to_decode else v
    decoded_inputs = {k: maybe_decode(k, v) for k, v in inputs.items()}
    return {k: v.format(**decoded_inputs) for k, v in self.formatters.items()}