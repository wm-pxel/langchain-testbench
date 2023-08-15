from typing import Dict
from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField
from datetime import datetime


class Result(BaseModel):
  id: ObjectIdField = None
  revisionID: ObjectIdField
  inputs: Dict[str, Dict[str, str]]
  outputs: Dict[str, Dict[str, str]]
  recorded: datetime

  class Config:
    json_encoders = {ObjectIdField: str}


class ResultRepository(AbstractRepository[Result]):
  class Meta:
    collection_name = 'results'
