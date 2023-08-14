import pandas as pd
from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter

parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)
parser.add_argument("-k", "--api_key", type=str, help="API Key for Pinecone")
parser.add_argument("-emb", "--embedding_file", help="File location for embeddings (must be .pkl file)")

args = vars(parser.parse_args())

## Parse pickle file to JSON for further processing
def main(args):
    embedding_filepath = args["embedding_file"]

    df_emb = pd.read_pickle(embedding_filepath)

    print(df_emb.to_json())

main(args)