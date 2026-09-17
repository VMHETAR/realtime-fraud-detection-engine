"""
FastAPI Server Entrypoint with Localhost & Dynamic Port Allocation.
Usage:
    python serve.py
    python serve.py --port 8000
    python serve.py --host 127.0.0.1 --port 8080 --reload
"""

import os
import sys

# Ensure root directory is in python search path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.api.server import main

if __name__ == "__main__":
    main()
