from typing import Annotated, Callable, Optional, Dict, Literal, Union, TypedDict
from pydantic import BaseModel, Field
from langchain.llms.base import LLM
from langchain.llms.openai import OpenAI
from langchain.llms.huggingface_hub import HuggingFaceHub

LLMSpec = Annotated[Union[
  "OpenAILLMSpec",
  "HuggingFaceHubLLMSpec"
  ], Field(discriminator='llm_type')]


class BaseLLMSpec(BaseModel):
  def to_llm(self) -> LLM:
    raise NotImplementedError

  def copy_replace(self, replace: Callable[[LLMSpec], LLMSpec]):
    return replace(self).copy(deep=True)


class OpenAILLMSpec(BaseLLMSpec):
  llm_type: Literal["openai"] = "openai"
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

  def to_llm(self) -> LLM:
    return OpenAI(model_name=self.model_name, temperature=self.temperature,
                     max_tokens=self.max_tokens, top_p=self.top_p, frequency_penalty=self.frequency_penalty,
                     presence_penalty=self.presence_penalty, n=self.n, best_of=self.best_of,
                     request_timeout=self.request_timeout, logit_bias=self.logit_bias)

class HuggingFaceHubLLMSpec(BaseLLMSpec):
  class ModelKwargs(TypedDict):
    temperature: float
    max_length: int
    min_new_tokens: Optional[int]
    max_time: Optional[int]

  llm_type: Literal["huggingface_hub"] = "huggingface_hub"
  repo_id: str
  task: Optional[str]
  model_kwargs: Optional[ModelKwargs]

  def to_llm(self) -> LLM:
    return HuggingFaceHub(temperature=self.model_kwargs['temperature'], max_length=self.model_kwargs["max_length"],
                             min_new_tokens=self.model_kwargs["min_new_tokens"], max_time=self.model_kwargs["max_time"],
                             repo_id=self.repo_id, task=self.task)
