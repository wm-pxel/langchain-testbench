from typing import Dict
from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField
from datetime import datetime

class Result(BaseModel):
  id: ObjectIdField = None
  revision: ObjectIdField
  chain_id: int
  input: Dict[str, str]
  output: Dict[str, str]
  recorded: datetime

  class Config:
    json_encoders = {ObjectIdField: str}


class ResultRepository(AbstractRepository[Result]):
  class Meta:
    collection_name = 'results'

