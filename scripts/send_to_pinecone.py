import pinecone
import uuid
import json
import os
import sys
import dotenv
from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter

dotenv.load_dotenv()

parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)
parser.add_argument("-i", "--index", help="Name of Pinecone index to insert into")
parser.add_argument("-n", "--namespace", help="Namespace for Pinecone index")

args = vars(parser.parse_args())

def createUUID():
    return str(uuid.uuid4())

def main(args):
    pinecone.init(api_key=os.environ['PINECONE_API_KEY'], environment=os.environ['PINECONE_ENVIRONMENT'])

    embeddings = json.load(sys.stdin)
    pinecone_embeddings = [(createUUID(), doc['embedding'], {**doc['meta'], 'text': doc['text']}) for doc in embeddings]
  
    index = pinecone.Index(args['index'])
    index.upsert(vectors=pinecone_embeddings, namespace=args['namespace'])

    print(json.dumps(index.describe_index_stats().to_dict(), indent=2))

main(args)