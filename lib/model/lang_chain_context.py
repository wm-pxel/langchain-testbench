from typing import Dict
from pydantic import BaseModel
from langchain.schema.language_model import BaseLanguageModel
from lib.model.result import Result
from datetime import datetime


# provides context for generating lang chains including llms and prompts
class LangChainContext(BaseModel):
  llms: Dict[str, BaseLanguageModel]

  verbose: bool = False
  recording: bool = False
  prompts: Dict[str, object] = []

  def results(self, revision_id: str):
    return [Result(
        revision=revision_id,
        chain_id=chain.chain_spec_id,
        input=call[0],
        output=call[1],
        recorded=datetime.now()
      ) for chain in self.prompts for call in chain.calls]

  def reset_results(self):
    for chain in self.prompts:
      chain.reset()
