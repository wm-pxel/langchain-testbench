import json
from typing import Dict, Optional
from pydantic import BaseModel, validator
from pydantic_mongo import AbstractRepository, ObjectIdField
from model.chain_spec import SequentialSpec, LLMSpec, CaseSpec, ReformatSpec, ChainSpec
from langchain.llms.loading import load_llm_from_config

def load_json(string: str):
  from_json = json.loads(string)
  from_json['llms'] = {key: load_llm_from_config(value) for key, value in from_json['llms'].items()}
  return ChainRevision.parse_obj(from_json)

def dump_json(obj: object, **kwargs):
  obj['id'] = str(obj['id']) if obj['id'] is not None else None
  obj['parent'] = str(obj['parent']) if obj['parent'] is not None else None
  return json.dumps(obj, **kwargs)

class ChainRevision(BaseModel):
  id: ObjectIdField = None
  parent: Optional[ObjectIdField]
  chain: ChainSpec
  llms: Dict[str, object]

  @validator("llms", pre=True)
  def validate_llms(cls, llms):
    maybe_decode = lambda value: load_llm_from_config(value) if isinstance(value, dict) else value
    return {key: maybe_decode(value) for key, value in llms.items()}


  class Config:
    json_encoders = {
      ObjectIdField: str,
    }
    json_dumps = dump_json

ChainRevision.update_forward_refs()

class ChainRevisionRepository(AbstractRepository[ChainRevision]):
  class Meta:
    collection_name = 'chain_revisions'

