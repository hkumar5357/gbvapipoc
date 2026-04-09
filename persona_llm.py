"""
Persona-aware LLM answer generator.
Uses google-generativeai (Gemini) to draft an answer in the voice of the given persona.
"""

import os
import logging
from typing import List, Dict

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialise Gemini with a service-account-derived token OR a plain API key.
# We re-use the GCP credentials from vertex_search to get a token, OR fall
# back to GEMINI_API_KEY / GOOGLE_API_KEY in the environment.
def _init_genai():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
    if api_key:
        genai.configure(api_key=api_key)
        return

    # Fallback: use GCP service account credentials
    import json
    sa_json = os.getenv("GCP_SERVICE_ACCOUNT", "")
    if sa_json:
        import google.auth
        from google.oauth2 import service_account
        sa_info = json.loads(sa_json)
        credentials = service_account.Credentials.from_service_account_info(
            sa_info,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        # google-generativeai v0.5+ accepts credentials directly
        genai.configure(credentials=credentials)
        return

    raise ValueError(
        "No Gemini credentials found. "
        "Set GEMINI_API_KEY or GOOGLE_API_KEY (or include GCP_SERVICE_ACCOUNT) in .env"
    )

_init_genai()

# Model to use (flash is cheapest/fastest)
_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.1-pro-preview")


def generate_answer(
    query: str,
    persona: str,
    segments: List[Dict],
) -> str:
    """
    Use Gemini to produce a persona-flavored answer.

    Args:
        query:    The user's question.
        persona:  Free-text description of the answering persona, e.g.
                  "senior HR director at a Fortune 500 company".
        segments: List of dicts with at least a "content" key (from vertex_search).

    Returns:
        The LLM-generated answer string.
    """
    context_block = "\n\n---\n\n".join(
        f"[Segment {i+1}]\n{seg['content']}"
        for i, seg in enumerate(segments)
        if seg.get("content")
    )
    if not context_block:
        context_block = "No relevant documents were found in the knowledge base."

    prompt = f"""You are acting entirely in the persona of a {persona}.
Your task is to draft a comprehensive, highly tailored response to an inquiry.

CRITICAL INSTRUCTIONS FOR YOUR PERSONA:
1. Embody the {persona} completely in tone, vocabulary, and perspective. 
2. Address the user directly as if they are the intended recipient in a real-world scenario (e.g., if you are an HR manager, write as an HR manager communicating directly to an employee).
3. Do not break character under any circumstances.
4. Maintain the professional standards, empathy, and authority appropriate for a {persona}.

USER'S INQUIRY:
\"\"\"{query}\"\"\"

KNOWLEDGE BASE SEGMENTS (Your Ground Truth):
{context_block}

RULES FOR YOUR RESPONSE:
1. Rely EXCLUSIVELY on the provided knowledge base segments above.
2. Synthesize the provided information naturally into your {persona}'s voice and formatting.
3. If the provided segments do not contain enough information to fully address the user's inquiry, acknowledge this gracefully in your character's voice and suggest what additional details might be needed.
4. Format your response cleanly and structure it appropriately for the medium (e.g., as an email, an official memo, or direct professional correspondence, depending on what fits the persona and inquiry best).
"""

    model    = genai.GenerativeModel(_MODEL_NAME)
    response = model.generate_content(prompt)
    return response.text.strip()
