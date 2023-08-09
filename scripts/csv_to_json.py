import csv
import sys
import json
from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter

parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)
# parser.add_argument("-f", "--file", help="csv file to read from")

args = vars(parser.parse_args())

def main(args):
  data = csv.DictReader(sys.stdin)
  records = [{
    'text': row['sentences'],
    'meta': {
      'section': row['section_time_stamp'],
    }
  } for row in data]
  json.dump(records, sys.stdout)

main(args)