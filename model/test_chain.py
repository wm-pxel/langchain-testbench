from pydantic import BaseModel
from pydantic_mongo import AbstractRepository, ObjectIdField

class TestChain(BaseModel):
  id: ObjectIdField = None
  name: str

  class Config:
    json_encoders = {ObjectIdField: str}


class TestChainRepository(AbstractRepository[TestChain]):
  class Meta:
    collection_name = 'chains'

