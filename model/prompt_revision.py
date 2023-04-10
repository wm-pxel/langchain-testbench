from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField

class PromptRevision(BaseModel):
  id: ObjectIdField = None
  major: int
  minor: int
  parent: ObjectIdField
  template: str

  class Config:
    json_encoders = {ObjectIdField: str}


class PromptRevisionRepository(AbstractRepository[PromptRevision]):
  class Meta:
    collection_name = 'prompt_revision'