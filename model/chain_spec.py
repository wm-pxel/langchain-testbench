from typing import Annotated, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field
from langchain.chains.base import Chain
from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate
from model.lang_chain_context import LangChainContext
from chains.case_chain import CaseChain
from chains.llm_recording_chain import LLMRecordingChain
import hashlib

ChainSpec = Annotated[Union["SequentialSpec", "LLMSpec", "CaseSpec", "TransformSpec"], Field(discriminator='chain_type')]

class BaseSpec(BaseModel):
  chain_id: int

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    raise NotImplementedError


class LLMSpec(BaseSpec):
  input_keys: List[str]
  output_keys: List[str]
  chain_type: Literal["llm_spec"]
  prompt: str
  llm_key: str

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    llm = ctx.llms.get(self.llm_key)

    if llm is None:
      raise ValueError(f"LLM with key {self.llm_key} not found in context")

    if ctx.recording:
      return LLMRecordingChain(llm=llm, prompt=self.prompt, chain_spec_id=self.chain_id)

    promptTemplate = PromptTemplate(template=self.prompt, input_variables=self.input_keys)

    return LLMChain(llm=llm, prompt=promptTemplate, output_key=self.output_keys[0])


class SequentialSpec(BaseSpec):
  input_keys: List[str]
  output_keys: List[str]
  chain_type: Literal["sequential_spec"]
  chains: List[ChainSpec]

  def to_lang_chain(self, ctx: LangChainContext) -> Chain:
    return SequentialChain(chains=[chain.to_lang_chain(ctx) for chain in self.chains], input_variables=self.input_keys, output_variables=self.output_keys)


class CaseSpec(BaseSpec):
  chain_type: Literal["case_spec"]
  cases: Dict[str, ChainSpec]
  categorization_key: str
  default_case: ChainSpec

  def to_lang_chain(self, ctx: LangChainContext) -> CaseChain:
    return CaseChain(
      subchains={key: chain.to_lang_chain(ctx) for key, chain in self.cases.items()}, 
      categorization_input=self.categorization_key,
      default_chain=self.default_case.to_lang_chain(ctx),
    )


class TransformSpec(BaseSpec):
  chain_type: Literal["transform_spec"]
  transforms: Dict[str, str]


class APISpec(BaseSpec):
  chain_type: Literal["APISpec"]
  url: str
  method: str
  headers: Optional[Dict[str, str]]
  body: Optional[str]

SequentialSpec.update_forward_refs()
CaseSpec.update_forward_refs()
