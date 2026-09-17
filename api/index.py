"""
Vercel Serverless Function Entrypoint for FastAPI.
Routes /api/* and FastAPI endpoints on Vercel deployments.
"""

import os
import sys

# Ensure project root is in sys.path for module resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.api.app import app
