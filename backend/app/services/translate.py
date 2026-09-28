"""Machine translation for product catalog text (name, description, variant
names), used at import time so pages never depend on a translation call at
request time.

Uses MyMemory (via deep-translator) — free, no API key, but a real rate
limit (anonymous tier is a few thousand characters/day). Every call here
can fail or get throttled; callers must treat None as "not translated yet,
leave the Chinese text as a fallback" rather than an error. See
catalog_sync.py for the caching logic that avoids re-translating text that
hasn't changed since the last import, which is what keeps re-imports cheap.
"""

import logging
import time

from bs4 import BeautifulSoup
from deep_translator import MyMemoryTranslator

logger = logging.getLogger(__name__)

_SOURCE = "zh-CN"
_TARGET = "en-US"
_DELAY_SECONDS = 0.3  # be gentle on the free tier


def translate_text(text: str | None) -> str | None:
    text = (text or "").strip()
    if not text:
        return None
    try:
        result = MyMemoryTranslator(source=_SOURCE, target=_TARGET).translate(text)
        time.sleep(_DELAY_SECONDS)
        return result or None
    except Exception as e:  # noqa: BLE001 — translation is best-effort
        logger.warning("translate_text failed for %r: %s", text[:60], e)
        return None


def translate_html(html: str | None) -> str | None:
    """Translates only the text nodes of an HTML fragment, leaving tags
    (and things like <img> that shouldn't be touched) intact."""
    html = (html or "").strip()
    if not html:
        return None
    try:
        soup = BeautifulSoup(html, "html.parser")
        translator = MyMemoryTranslator(source=_SOURCE, target=_TARGET)
        for node in soup.find_all(string=True):
            text = str(node).strip()
            if not text:
                continue
            translated = translator.translate(text)
            time.sleep(_DELAY_SECONDS)
            if translated:
                node.replace_with(translated)
        return str(soup)
    except Exception as e:  # noqa: BLE001
        logger.warning("translate_html failed: %s", e)
        return None
