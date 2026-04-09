"""
Flask backend for UpLevyl GBV Manager Response API.
POST /api/ask  →  { query, persona }  →  structured JSON response
"""

import logging
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

import vertex_search as vs
import persona_llm   as pllm

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)


# ── Serve frontend ────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


# ── API ───────────────────────────────────────────────────────────────────────

@app.route("/api/ask", methods=["POST"])
def ask():
    body    = request.get_json(force=True, silent=True) or {}
    query   = (body.get("query") or "").strip()
    persona = (body.get("persona") or "Manager Guidance").strip()

    if not query:
        return jsonify({"error": "query is required"}), 400

    logger.info("Received query=%r  persona=%r", query[:100], persona[:100])

    # 1. Retrieve context from Vertex AI Discovery Engine
    search_result  = vs.search(query)
    segments       = search_result.get("results", [])
    search_latency = search_result.get("latency", 0)

    if "error" in search_result:
        logger.warning("Vertex search error: %s", search_result["error"])

    logger.info("Retrieved %d segment(s) in %ss", len(segments), search_latency)

    # 2. Generate structured persona response via Gemini
    try:
        structured = pllm.generate_answer(query=query, persona=persona, segments=segments)
    except Exception as e:
        logger.error("LLM generation failed: %s", e, exc_info=True)
        return jsonify({"error": f"LLM generation failed: {e}"}), 500

    # 3. Build deduplicated source list
    seen_sources = set()
    sources      = []
    for seg in segments:
        key = seg.get("source_url") or seg.get("title") or ""
        if key and key not in seen_sources:
            seen_sources.add(key)
            sources.append({
                "title":      seg.get("title", ""),
                "source_url": seg.get("source_url", ""),
            })

    return jsonify({
        # Structured fields from LLM
        "guidance":                structured.get("guidance", ""),
        "jurisdiction":            structured.get("jurisdiction", "Unknown"),
        "citations":               structured.get("citations", []),
        "clarification_questions": structured.get("clarification_questions", []),
        "next_steps":              structured.get("next_steps", []),
        "mandatory_reporting":     structured.get("mandatory_reporting", False),
        # Search metadata
        "sources":                 sources,
        "segments_found":          len(segments),
        "search_latency":          search_latency,
    })


# ── Health check ──────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8840))
    logger.info("Starting UpLevyl GBV Manager Response API on port %d", port)
    app.run(host="0.0.0.0", port=port, debug=True)
