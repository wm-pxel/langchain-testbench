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

  
  





    # top_hits = retrieve_relevant_answer(input_question, df_emb, num_hits, embed_model, embed_encoder, max_tokens)

    # if not json_output_flag:
    #     # retrieve best question and answer TODO: Make it so we can retrieve many examples
    #     top_question = top_hits["questions"].iloc[0]
    #     top_answer = top_hits["answers"].iloc[0]

    #     # Create question prompt
    #     prompt = question_boiler.format(top_question, top_answer, input_question)

    #     ans = run_gpt(openai_model, system_boiler, prompt, temp, max_tokens, max_tokens_output)
    #     return print(ans)
    # else:
    #     if output_file_location:
    #         return top_hits.head(num_hits).to_json(output_file_location)
    #     else:
    #         return(print(top_hits.head(num_hits).to_json()))

main(args)