"""
Vercel serverless entry point.
Imports the Flask `app` object from the parent package so Vercel's
WSGI adapter can serve it as a serverless function.
"""

import sys
import os

# Make the project root importable so that app.py / vertex_search / persona_llm
# can be found when this file runs inside Vercel's api/ directory.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import app  # noqa: F401 — Vercel discovers the `app` WSGI object
