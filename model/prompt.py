from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField

class Prompt(BaseModel):
  id: ObjectIdField = None
  name: str

  class Config:
    json_encoders = {ObjectIdField: str}


class PromptRepository(AbstractRepository[Prompt]):
  class Meta:
    collection_name = 'prompts'