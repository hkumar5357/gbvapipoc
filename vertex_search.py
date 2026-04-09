"""
Standalone Vertex AI Discovery Engine search helper.
Reads credentials and config from .env via python-dotenv.
"""

import json
import time
import logging
from typing import Dict, List, Optional

from dotenv import load_dotenv
import os

load_dotenv()

from google.api_core.client_options import ClientOptions
from google.cloud import discoveryengine_v1beta as discoveryengine
from google.oauth2 import service_account

logger = logging.getLogger(__name__)


# ── Config ────────────────────────────────────────────────────────────────────

PROJECT_ID      = os.getenv("GCP_PROJECT_ID", "")
LOCATION        = os.getenv("VERTEX_SEARCH_LOCATION", "global")
DATA_STORE_ID   = os.getenv("VERTEX_DATA_STORE_ID", "")
MAX_SEGMENTS    = int(os.getenv("VERTEX_MAX_CONTEXT_CHUNKS", "5"))
SA_JSON         = os.getenv("GCP_SERVICE_ACCOUNT", "")


# ── Client factory ────────────────────────────────────────────────────────────

def _build_client():
    if not SA_JSON:
        raise ValueError("GCP_SERVICE_ACCOUNT env var is not set.")

    sa_info = json.loads(SA_JSON)
    creds = service_account.Credentials.from_service_account_info(
        sa_info,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )
    client_options = (
        ClientOptions(api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com")
        if LOCATION != "global"
        else None
    )
    return discoveryengine.SearchServiceClient(
        credentials=creds,
        client_options=client_options,
    )


_client = None
_serving_config = None


def _get_client_and_serving_config():
    global _client, _serving_config
    if _client is None:
        _client = _build_client()
        _serving_config = _client.serving_config_path(
            project=PROJECT_ID,
            location=LOCATION,
            data_store=DATA_STORE_ID,
            serving_config="default_config",
        )
    return _client, _serving_config


# ── Search ────────────────────────────────────────────────────────────────────

def search(query: str, filter_str: Optional[str] = None) -> Dict:
    """
    Execute a semantic search against Vertex AI Discovery Engine.

    Returns:
        {
            "results": [{"title": str, "content": str, "source_url": str}],
            "latency": float,
        }
    """
    start = time.time()
    client, serving_config = _get_client_and_serving_config()

    request = discoveryengine.SearchRequest(
        serving_config=serving_config,
        query=query,
        filter=filter_str or "",
        page_size=MAX_SEGMENTS,
        content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
            extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
                max_extractive_segment_count=MAX_SEGMENTS,
            )
        ),
        query_expansion_spec=discoveryengine.SearchRequest.QueryExpansionSpec(
            condition=discoveryengine.SearchRequest.QueryExpansionSpec.Condition.DISABLED,
        ),
        spell_correction_spec=discoveryengine.SearchRequest.SpellCorrectionSpec(
            mode=discoveryengine.SearchRequest.SpellCorrectionSpec.Mode.SUGGESTION_ONLY,
        ),
    )

    try:
        response = client.search(request)
        results  = _extract_segments(response)
        latency  = round(time.time() - start, 3)
        return {"results": results, "latency": latency}
    except Exception as e:
        latency = round(time.time() - start, 3)
        logger.error("Vertex search error: %s", e, exc_info=True)
        return {"results": [], "latency": latency, "error": str(e)}


def _extract_segments(response: discoveryengine.SearchResponse) -> List[Dict]:
    results = []
    seen    = set()

    def _to_py(obj):
        if isinstance(obj, (str, bytes, int, float, bool)) or obj is None:
            return obj
        if hasattr(obj, "items"):
            return {k: _to_py(v) for k, v in obj.items()}
        if hasattr(obj, "__iter__"):
            return [_to_py(v) for v in obj]
        return obj

    def _scalar(value) -> str:
        if isinstance(value, list):
            return str(value[0]) if value else ""
        return str(value) if value else ""

    for result in response.results:
        data = _to_py(result.document.derived_struct_data) or {}
        meta = _to_py(result.document.struct_data) or {}

        title = _scalar(
            meta.get("source_name")
            or meta.get("title")
            or data.get("title")
            or ""
        )
        source_url = _scalar(
            data.get("link") or data.get("source_url") or meta.get("source_url") or ""
        )
        if not title and source_url:
            title = source_url.rstrip("/").split("/")[-1] or source_url

        for segment in data.get("extractive_segments", []):
            content = segment.get("content", "").strip()
            if not content:
                continue
            key = hash(content[:200])
            if key in seen:
                continue
            seen.add(key)
            results.append({"title": title, "source_url": source_url, "content": content})

    return results[:MAX_SEGMENTS]
