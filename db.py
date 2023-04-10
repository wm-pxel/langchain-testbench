import os
from dotenv import load_dotenv
from model.test_chain import TestChainRepository
from pymongo import MongoClient
from model.chain_revision import ChainRevisionRepository

load_dotenv()

client = MongoClient(os.environ["MONGODB_URL"])
database = client[os.environ["MONGODB_DATABASE"]]

test_chain_repository = TestChainRepository(database=database)
chain_revision_repository = ChainRevisionRepository(database=database)
