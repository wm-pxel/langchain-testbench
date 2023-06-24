import logging
from typing import Dict, List
from langchain.chains.base import Chain
from lib.formatters.extended_formatter import ExtendedFormatter

class TransformChain(Chain):
  transform_func: str
  input_variables: List[str]
  output_variables: List[str]
  logger: logging.Logger = logging.getLogger(__name__)

  @property
  def transformer_func(self) -> str:    
    return self.transform_func

  @property
  def input_keys(self) -> List[str]:    
    return self.input_variables

  @property
  def output_keys(self) -> List[str]:
    return self.output_variables

  def create_function(self, params, body):
    scope = {}
    indented = body.replace("\n", "\n  ")
    exec(f"def f({params}):\n  {indented}", scope)
    return scope["f"]
    
  def _call(self, inputs: Dict[str, str]) -> Dict[str, str]:
    for param, value in inputs.items():
        inputs[param] = value.strip()

    func = self.create_function(", ".join(inputs.keys()), self.transform_func)
    output_values = func(*inputs.values())
    return output_values
  
