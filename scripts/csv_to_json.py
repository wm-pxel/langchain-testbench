import csv
import sys
import json
from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter

parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)

args = vars(parser.parse_args())

# Parse CSV to JSON
# Input: CSV file with header containing 'sentences' and 'section_time_stamp'
# Output: JSON file with sentences in 'text' field and timestamp in 'meta.section' field.
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