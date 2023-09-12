import json
from typing import Annotated, Callable, Optional, Dict, List, Literal, Union, TypedDict
from pydantic import BaseModel, Field
from langchain.llms.base import LLM
from langchain.llms.openai import OpenAI
from langchain.llms.huggingface_hub import HuggingFaceHub
from langchain.chat_models.openai import ChatOpenAI

LLMSpec = Annotated[Union[
  "OpenAILLMSpec",
  "HuggingFaceHubLLMSpec",
  "ChatOpenAILLMSpec",
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

  llm_type: Literal["huggingface_hub"] = "huggingface_hub"
  repo_id: str
  task: Optional[str]
  model_kwargs: Optional[ModelKwargs]

  def to_llm(self) -> LLM:
    return HuggingFaceHub(model_kwargs=self.model_kwargs, repo_id=self.repo_id, task=self.task)


class FunctionParameter(BaseModel):
    type: str
    description: str

class LLMFunction(BaseModel):
    id: int
    name: str
    description: str
    parameters: Dict[str, FunctionParameter]

class ChatOpenAILLMSpec(BaseLLMSpec):
  llm_type: Literal["chat_openai"] = "chat_openai"
  model_name: str
  temperature: float
  max_tokens: int
  n: int
  request_timeout: Optional[int]
  functions: List[LLMFunction]

  # TODO: update LLMFunction for direct serialization
  def functions_ags(self) -> []:
    functions = []
    for function_entry in self.functions:
      function = {}
      function["name"] = function_entry.name
      function["description"] = function_entry.description
      function_parameters = {}
      function_parameters["type"] = "object"

      function_properties = {}
      for param_name, param_obj in function_entry.parameters.items():
        param = {}
        param["type"] = param_obj.type
        param["description"] = param_obj.description
        function_properties[param_name] = param

      function_parameters["properties"] = function_properties
      function["parameters"] = function_parameters
      functions.append(function)

    return functions

  def to_llm(self) -> LLM:
    return ChatOpenAI(model_name=self.model_name, temperature=self.temperature,
                      max_tokens=self.max_tokens, n=self.n, request_timeout=self.request_timeout,
                      model_kwargs={"functions": self.functions_ags()})
