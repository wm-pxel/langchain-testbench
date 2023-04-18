from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField

class Chain(BaseModel):
  id: ObjectIdField = None
  name: str
  revision: ObjectIdField

  class Config:
    json_encoders = {ObjectIdField: str}


class ChainRepository(AbstractRepository[Chain]):
  class Meta:
    collection_name = 'chains'

