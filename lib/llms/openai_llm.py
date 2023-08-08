from typing import Any, Optional, Dict, Mapping
from langchain.callbacks.manager import CallbackManagerForLLMRun
from langchain.llms.base import LLM
from langchain.llms.openai import OpenAI
import json


class OpenAILLM(LLM):
  model_name: str
  temperature: float
  max_tokens: int
  top_p: float
  frequency_penalty: float
  presence_penalty: float
  n: int
  best_of: int
  request_timeout: Optional[int]
  logit_bias: Optional[Dict[int, int]]

  llm: OpenAI = None

  def __init__(self, model_name: str, temperature: float = 0.0, max_tokens: int = 64, top_p: float = 1.0,
               frequency_penalty: float = 0.0, presence_penalty: float = 0.0, n: int = 1, best_of: int = 1,
               request_timeout: Optional[int] = None, logit_bias: Dict[int, int] = None):
    super(OpenAILLM, self).__init__(model_name=model_name, temperature=temperature, max_tokens=max_tokens,
                                    top_p=top_p, frequency_penalty=frequency_penalty, presence_penalty=presence_penalty,
                                    n=n, best_of=best_of, request_timeout=request_timeout, logit_bias=logit_bias)
    self.llm = OpenAI(model_name=self.model_name, temperature=self.temperature,
                 max_tokens=self.max_tokens, top_p=self.top_p, frequency_penalty=self.frequency_penalty,
                 presence_penalty=self.presence_penalty, n=self.n, best_of=self.best_of,
                 request_timeout=self.request_timeout, logit_bias=self.logit_bias)

  @property
  def _llm_type(self) -> str:
    return "openai_llm"

  @property
  def _identifying_params(self) -> Mapping[str, Any]:
    return {
      "model_name": self.model_name
    }
  
  @property
  def _get_model_default_parameters(self) -> Dict[str, Any]:
    return {
      "temperature": self.temperature,
      "max_tokens": self.max_tokens,
      "top_p": self.top_p,
      "frequency_penalty": self.frequency_penalty,
      "presence_penalty": self.presence_penalty,
      "n": self.n,
      "best_of": self.best_of,
      "request_timeout": self.request_timeout,
      "logit_bias": self.logit_bias
    }

  def _call(self, prompt: str, stop: Optional[CallbackManagerForLLMRun] = None, **kwargs) -> str:
    output = self.llm(prompt)
    return output
