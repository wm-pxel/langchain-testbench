from typing import Optional, Union
from json import loads
from pydantic import BaseModel, Field, validator
from pydantic_mongo import AbstractRepository, ObjectIdField
from langchain.chains import LLMChain
from langchain.chains.base import Chain
from model.types import ChainSpec, LLMSpec, SequentialSpec

class ChainRevision(BaseModel):
  id: ObjectIdField = None
  chain: ChainSpec
  llms: Dict[str, object]

  class Config:
    json_encoders = {
      ObjectIdField: str,
    }

ChainRevision.update_forward_refs()

class ChainRevisionRepository(AbstractRepository[ChainRevision]):
  class Meta:
    collection_name = 'chain_revisions'

