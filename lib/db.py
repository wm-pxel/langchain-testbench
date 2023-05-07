import os
from dotenv import load_dotenv
from pymongo import MongoClient
from lib.model.chain_revision import ChainRevisionRepository
from lib.model.chain import ChainRepository
from lib.model.result import ResultRepository

load_dotenv()

client = MongoClient(os.environ["MONGODB_URL"])
database = client[os.environ["MONGODB_DATABASE"]]

chain_revision_repository = ChainRevisionRepository(database=database)
chain_repository = ChainRepository(database=database)
result_repository = ResultRepository(database=database)
