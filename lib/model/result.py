from typing import Dict, List
from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField
from datetime import datetime


class Result(BaseModel):
  id: ObjectIdField = None
  revisionID: ObjectIdField
  inputs: Dict[str, List[str]]
  outputs: Dict[str, List[str]]
  io_mapping: Dict[str, str]
  recorded: datetime

  class Config:
    json_encoders = {ObjectIdField: str, datetime: str}


class ResultRepository(AbstractRepository[Result]):
  class Meta:
    collection_name = 'results'
