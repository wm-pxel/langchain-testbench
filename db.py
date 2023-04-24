import os
from dotenv import load_dotenv
from pymongo import MongoClient
from model.chain_revision import ChainRevisionRepository
from model.chain import ChainRepository

load_dotenv()

client = MongoClient(os.environ["MONGODB_URL"])
database = client[os.environ["MONGODB_DATABASE"]]

chain_revision_repository = ChainRevisionRepository(database=database)
chain_repository = ChainRepository(database=database)
