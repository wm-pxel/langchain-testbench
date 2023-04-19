from typing import Dict
from pydantic import BaseModel

# provides context for generating lang chains including llms and prompts
class LangChainContext(BaseModel):
  llms: Dict[str, object]

  verbose: bool = False
  recording: bool = False
  prompts: Dict[str, object] = []
