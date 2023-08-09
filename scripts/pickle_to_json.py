import pandas as pd
import pinecone
import uuid
from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter

parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)
parser.add_argument("-k", "--api_key", type=str, help="API Key for Pinecone")
parser.add_argument("-emb", "--embedding_file", help="File location for embeddings (must be .pkl file)")

args = vars(parser.parse_args())

def createUUID():
    return str(uuid.uuid4())

## Main Function ##
def main(args):
    pinecone.init(api_key=args["api_key"], environment="northamerica-northeast1-gcp")
    embedding_filepath = args["embedding_file"]

    df_emb = pd.read_pickle(embedding_filepath)

    print(df_emb.to_json())

main(args)