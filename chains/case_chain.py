from typing import Dict, List
from langchain.chains.base import Chain

class CaseChain(Chain):
  categorization_input: str
  subchains: Dict[str, Chain]
  default_chain: Chain
  output_variables: List[str] = ["text"]

  # TODO: validator requires the union of subchain inputs
  # TODO: validator requires all subchains have all output keys that are not also input keys

  @property
  def input_keys(self) -> List[str]:    
    return self.default_chain.input_keys + [key for subchain in self.subchains.values() for key in subchain.input_keys]

  @property
  def output_keys(self) -> List[str]:
    return self.output_variables

  def _call(self, inputs: Dict[str, str]) -> Dict[str, str]:
    categorization = inputs[self.categorization_input].strip()

    subchain = self.subchains[categorization] if categorization in self.subchains else self.default_chain
 
    known_values = inputs.copy()
    outputs = subchain(known_values, return_only_outputs=True)
    known_values.update(outputs)
    return {k: known_values[k] for k in self.output_variables}  