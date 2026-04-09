"""
Persona-aware LLM answer generator.
Uses google-generativeai (Gemini) to draft a structured GBV response in the voice of the given persona.
"""

import os
import json
import logging
from typing import List, Dict, Any

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def _init_genai():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
    if api_key:
        genai.configure(api_key=api_key)
        return

    sa_json = os.getenv("GCP_SERVICE_ACCOUNT", "")
    if sa_json:
        from google.oauth2 import service_account
        sa_info = json.loads(sa_json)
        credentials = service_account.Credentials.from_service_account_info(
            sa_info,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        genai.configure(credentials=credentials)
        return

    raise ValueError(
        "No Gemini credentials found. "
        "Set GEMINI_API_KEY or GOOGLE_API_KEY (or include GCP_SERVICE_ACCOUNT) in .env"
    )


_init_genai()

_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.1-pro-preview")

# Maps response mode names to persona descriptions
RESPONSE_MODE_PERSONAS = {
    "Manager Guidance": "a front-line manager responding to an employee disclosure of workplace violence or gender-based violence",
    "Legal Compliance": "a corporate legal counsel specializing in workplace violence compliance and multi-state employment law",
    "HR Policy": "an HR director with 15 years of enterprise experience in workplace safety and employee relations",
    "Executive Summary": "a C-suite executive who needs concise risk assessment and actionable summaries",
}


def generate_answer(
    query: str,
    persona: str,
    segments: List[Dict],
) -> Dict[str, Any]:
    """
    Use Gemini to produce a structured, persona-flavored GBV response.

    Args:
        query:    The manager's situation or question.
        persona:  Response mode or free-text persona description.
        segments: List of dicts with at least a "content" key (from vertex_search).

    Returns:
        A dict with keys: guidance, jurisdiction, citations, clarification_questions,
        next_steps, mandatory_reporting. Falls back gracefully if JSON parse fails.
    """
    # Resolve persona description from mode name if applicable
    persona_desc = RESPONSE_MODE_PERSONAS.get(persona, persona)

    context_block = "\n\n---\n\n".join(
        f"[Document {i+1}]\n{seg['content']}"
        for i, seg in enumerate(segments)
        if seg.get("content")
    )
    if not context_block:
        context_block = "No relevant documents were found in the knowledge base."

    prompt = f"""You are acting as {persona_desc}.

A manager has come to you with the following situation:
\"\"\"{query}\"\"\"

KNOWLEDGE BASE (use exclusively — do not invent statutes or facts):
{context_block}

INSTRUCTIONS:
- Identify the most likely US state jurisdiction from the query. If ambiguous, state "Unknown — jurisdiction required".
- Identify specific legal statutes, regulations, or policies from the knowledge base that apply.
- Flag if mandatory reporting is required in this jurisdiction.
- Generate 2-3 targeted follow-up clarification questions a real expert would ask.
- Provide 3-5 concrete next steps the manager should take.
- Use gender-neutral language throughout (employee/team member/worker — never assume gender).
- Keep guidance practical and actionable, not theoretical.

RESPONSE FORMAT — return ONLY valid JSON, no markdown fences, no extra text:
{{
  "guidance": "<2-4 paragraph guidance in the voice of {persona_desc}>",
  "jurisdiction": "<State name or 'Unknown — jurisdiction required'>",
  "citations": [
    {{"statute": "<Statute name and section>", "description": "<one-sentence description of relevance>"}}
  ],
  "clarification_questions": [
    "<question 1>",
    "<question 2>",
    "<question 3>"
  ],
  "next_steps": [
    "<step 1>",
    "<step 2>",
    "<step 3>"
  ],
  "mandatory_reporting": <true or false>
}}"""

    model = genai.GenerativeModel(_MODEL_NAME)
    response = model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown code fences if model added them
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        parsed = json.loads(raw)
        # Ensure all expected keys exist
        parsed.setdefault("guidance", raw)
        parsed.setdefault("jurisdiction", "Unknown")
        parsed.setdefault("citations", [])
        parsed.setdefault("clarification_questions", [])
        parsed.setdefault("next_steps", [])
        parsed.setdefault("mandatory_reporting", False)
        return parsed
    except json.JSONDecodeError:
        logger.warning("Gemini did not return valid JSON — falling back to raw text")
        return {
            "guidance": raw,
            "jurisdiction": "Unknown",
            "citations": [],
            "clarification_questions": [],
            "next_steps": [],
            "mandatory_reporting": False,
        }
