from json import loads
from pydantic import BaseModel, validator
from pydantic_mongo import AbstractRepository, ObjectIdField
from langchain.chains.base import Chain
from chain import chain_loader

class ChainRevision(BaseModel):
  id: ObjectIdField = None
  major: int = 0
  minor: int = 0
  parent: ObjectIdField = None
  chain: Chain = None

  @validator('chain', pre=True)
  def validate_chain(cls, v):
    if isinstance(v, Chain):
      return v

    return chain_loader(v)

  class Config:
    arbitrary_types_allowed = True
    json_encoders = {
      ObjectIdField: str,
    }


class ChainRevisionRepository(AbstractRepository[ChainRevision]):
  class Meta:
    collection_name = 'chain_revisions'

