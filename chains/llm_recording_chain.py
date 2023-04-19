from typing import Dict, List
from langchain.chains import LLMChain

# LLMRecordingChain subclasses an LLMChain instance. It records all inputs and outputs from _call and provides access to those inputs and ouptuts
class LLMRecordingChain(LLMChain):
  # calls stores a list of tuples of the form (Dict[str, str], str)
  _calls: List[tuple[Dict[str, str], Dict[str,str]]] = []
  _chain_spec_id: int

  # __init__ instantiates the super class, initializes _calls with an empty array and sets the _chain_spec_id from a kwarg.
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._calls = []
    self._chain_spec_id = kwargs.get("chain_spec_id", None)


  def _call(self, inputs: Dict[str, str]) -> Dict[str, str]:
    output = super()._call(inputs)
    self._calls.append((inputs, output))
    return output

  @property
  def calls(self) -> List[tuple[Dict[str, str], Dict[str, str]]]:
    return self._calls
