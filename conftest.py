import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Add the 'lib' directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
