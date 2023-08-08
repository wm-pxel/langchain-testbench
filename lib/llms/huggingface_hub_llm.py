from typing import Any, Optional, Dict, Mapping
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.llms.base import LLM
from langchain.llms.huggingface_hub import HuggingFaceHub


class HuggingFaceHubLLM(LLM):
  temperature: float
  max_length: int
  min_new_tokens: Optional[int]
  max_time: Optional[int]
  repo_id: str
  task: Optional[str]

  llm: HuggingFaceHub = None


  def __init__(self, temperature: float = 0.0, max_length: int = 64, min_new_tokens: Optional[int] = None,
               max_time: Optional[int] = None, repo_id: str = "hf", task: Optional[str] = None):
    super(HuggingFaceHubLLM, self).__init__(temperature=temperature, max_length=max_length, min_new_tokens=min_new_tokens,
                                            max_time=max_time, repo_id=repo_id, task=task)
    self.llm = HuggingFaceHub(repo_id=repo_id, task=task, model_kwargs={
                                          temperature: temperature,
                                          max_length: max_length,
                                          min_new_tokens: min_new_tokens,
                                          max_time: max_time})

  @property
  def _llm_type(self) -> str:
    return "huggingface_hub_llm"

  @property
  def _identifying_params(self) -> Mapping[str, Any]:
    return {
      "repo_id": self.repo_id
    }
  
  @property
  def _get_model_default_parameters(self) -> Dict[str, Any]:
    return {
      "temperature": self.temperature,
      "max_length": self.max_length,
      "min_new_tokens": self.min_new_tokens,
      "max_time": self.max_time,
      "task": self.task
    }

  def _call(self, prompt: str, stop: Optional[CallbackManagerForLLMRun] = None, **kwargs) -> str:
    output = self.llm(prompt)
    return output
