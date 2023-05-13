from typing import Annotated, Callable, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field
from langchain.chains.base import Chain
from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate
from lib.model.lang_chain_context import LangChainContext
from lib.chains.case_chain import CaseChain
from lib.chains.api_chain import APIChain
from lib.chains.reformat_chain import ReformatChain
from lib.chains.llm_recording_chain import LLMRecordingChain

ChainSpec = Annotated[Union["APISpec", "SequentialSpec", "LLMSpec", "CaseSpec", "ReformatSpec"], Field(discriminator='chain_type')]

class BaseSpec(BaseModel):
  chain_id: int

  @property
  def children(self) -> List[ChainSpec]:
    return []

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    raise NotImplementedError
  
  def traverse(self, fn: Callable[[ChainSpec], None]) -> None:
    fn(self)

    for child in self.children:
      child.traverse(fn)
  

  def find_by_chain_id(self, chain_id: int) -> Optional[ChainSpec]:
    if self.chain_id == chain_id:
      return self

    for child in self.children:
      result = child.find_by_chain_id(chain_id)

      if result is not None:
        return result

    return None
  
  def copy_replace(self, replace: Callable[[ChainSpec], ChainSpec]):
    return replace(self).copy(deep=True)



class LLMSpec(BaseSpec):
  input_keys: List[str]
  output_key: str
  chain_type: Literal["llm_spec"]
  prompt: str
  llm_key: str

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    llm = ctx.llms.get(self.llm_key)

    if llm is None:
      raise ValueError(f"LLM with key {self.llm_key} not found in context")

    promptTemplate = PromptTemplate(template=self.prompt, input_variables=self.input_keys)

    if ctx.recording:
      chain = LLMRecordingChain(llm=llm, prompt=promptTemplate, output_key=self.output_key, chain_spec_id=self.chain_id)
      ctx.prompts.append(chain)
      return chain

    return LLMChain(llm=llm, prompt=promptTemplate, output_key=self.output_key)


class SequentialSpec(BaseSpec):
  input_keys: List[str]
  output_keys: List[str]
  chain_type: Literal["sequential_spec"]
  chains: List[ChainSpec]

  @property
  def children(self) -> List[ChainSpec]:
    return list(self.chains)

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    return SequentialChain(chains=[chain.to_lang_chain(ctx) for chain in self.chains], input_variables=self.input_keys, output_variables=self.output_keys)
  
  def copy_replace(self, replace: Callable[[ChainSpec], ChainSpec]):
    sequential = replace(self).copy(deep=True, exclude={"chains"})
    sequential.chains = [chain.copy_replace(replace) for chain in self.chains]
    return sequential


class CaseSpec(BaseSpec):
  chain_type: Literal["case_spec"]
  cases: Dict[str, ChainSpec]
  categorization_key: str
  default_case: ChainSpec

  @property
  def children(self) -> List[ChainSpec]:
    return list(self.cases.values()) + [self.default_case]

  def to_lang_chain(self, ctx: LangChainContext) -> CaseChain:
    return CaseChain(
      subchains={key: chain.to_lang_chain(ctx) for key, chain in self.cases.items()}, 
      categorization_input=self.categorization_key,
      default_chain=self.default_case.to_lang_chain(ctx),
    )
  
  def copy_replace(self, replace: Callable[[ChainSpec], ChainSpec]):
    case_chain = replace(self).copy(deep=True, exclude={"cases"})
    case_chain.cases = {key: chain.copy_replace(replace) for key, chain in self.cases.items()}
    return case_chain


class ReformatSpec(BaseSpec):
  chain_type: Literal["reformat_spec"]
  formatters: Dict[str, str]
  input_keys: List[str]

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    return ReformatChain(formatters=self.formatters, input_variables=self.input_keys)


class APISpec(BaseSpec):
  chain_type: Literal["api_spec"]
  url: str
  method: str
  headers: Optional[Dict[str, str]]
  body: Optional[str]
  input_keys: List[str]
  output_key: str

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    return APIChain(
      url=self.url,
      method=self.method,
      headers=self.headers,
      body=self.body,
      input_variables=self.input_keys,
      output_variable=self.output_key,
    )


SequentialSpec.update_forward_refs()
CaseSpec.update_forward_refs()
