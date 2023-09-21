import json
from typing import Dict, Optional
from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField
from lib.model.chain_spec import ChainSpec, APIChainSpec, SequentialChainSpec, LLMChainSpec, ChatChainSpec, CaseChainSpec, ReformatChainSpec, TransformChainSpec, VectorSearchChainSpec
from lib.model.llm_spec import LLMSpec, OpenAILLMSpec, HuggingFaceHubLLMSpec, ChatOpenAILLMSpec


def dump_json(obj: object, **kwargs):
  obj['id'] = str(obj['id']) if obj['id'] is not None else None
  obj['parent'] = str(obj['parent']) if obj['parent'] is not None else None
  return json.dumps(obj, **kwargs)


class ChainRevision(BaseModel):
  id: ObjectIdField = None
  parent: Optional[ObjectIdField]
  chain: ChainSpec
  llms: Dict[str, LLMSpec]

  class Config:
    json_encoders = {
      ObjectIdField: str,
    }
    json_dumps = dump_json


ChainRevision.update_forward_refs()


class ChainRevisionRepository(AbstractRepository[ChainRevision]):
  class Meta:
    collection_name = 'chain_revisions'


def find_ancestor_ids(revision_id: ObjectIdField, repository: ChainRevisionRepository) -> list[ObjectIdField]:
  revision = repository.find_one_by_id(revision_id)
  if revision is None:
    raise ValueError(f"Revision with id {revision_id} not found")
  if revision.parent is None:
    return []
  return [revision.parent] + find_ancestor_ids(revision.parent, repository)
