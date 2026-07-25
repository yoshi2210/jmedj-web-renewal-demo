"""公開デモ用の軽量な静的QA。標準ライブラリだけで実行できる。"""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.lang = ""
        self.title_count = 0
        self.main_count = 0
        self.search_forms = 0
        self.tabs = 0
        self.bottom_navs = 0
        self.checked_checkboxes = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if tag == "html":
            self.lang = data.get("lang") or ""
        elif tag == "title":
            self.title_count += 1
        elif tag == "main":
            self.main_count += 1
        if tag == "form" and data.get("role") == "search":
            self.search_forms += 1
        if data.get("role") == "tab":
            self.tabs += 1
        if "bottom-nav" in (data.get("class") or "").split():
            self.bottom_navs += 1
        if tag == "input" and data.get("type") == "checkbox" and "checked" in data:
            self.checked_checkboxes += 1
        if tag in {"a", "script", "link"}:
            value = data.get("href") or data.get("src")
            if value:
                self.links.append(value)


def local_target_exists(source: Path, value: str) -> bool:
    parsed = urlparse(value)
    if parsed.scheme or value.startswith("#") or value.startswith("//"):
        return True
    target = unquote(parsed.path)
    if not target:
        return True
    return (source.parent / target).resolve().exists()


def audit_file(path: Path) -> list[str]:
    parser = AuditParser()
    parser.feed(path.read_text(encoding="utf-8"))
    errors: list[str] = []
    if parser.lang != "ja":
        errors.append(f"{path.name}: html lang must be ja")
    if parser.title_count != 1:
        errors.append(f"{path.name}: expected exactly one title")
    if parser.main_count != 1:
        errors.append(f"{path.name}: expected exactly one main landmark")
    if parser.tabs:
        errors.append(f"{path.name}: role=tab is reserved for real tab panels")
    if parser.bottom_navs:
        errors.append(f"{path.name}: duplicate fixed bottom navigation remains")
    if path.name == "index.html" and parser.search_forms != 1:
        errors.append(f"{path.name}: expected exactly one search form")
    if path.name in {"articles.html", "shop-books.html", "career.html"} and parser.checked_checkboxes:
        errors.append(f"{path.name}: facets must not be preselected")
    for value in parser.links:
        if value == "#":
            errors.append(f"{path.name}: dead link #")
        elif not local_target_exists(path, value):
            errors.append(f"{path.name}: missing local target {value}")
    return errors


def main() -> int:
    errors = [error for path in HTML_FILES for error in audit_file(path)]
    data = json.loads((ROOT / "data" / "sample-content.json").read_text(encoding="utf-8"))
    for item in data["books"] + data["ebooks"]:
        for key in ("contentType", "clinicalArea", "topic"):
            if not item.get(key):
                errors.append(f"{item['id']}: missing taxonomy field {key}")
    for item in data["articles"]:
        for key in ("contentType", "clinicalArea", "topic", "editorialFormat"):
            if not item.get(key):
                errors.append(f"{item['id']}: missing taxonomy field {key}")
    js_errors = []
    for path in sorted((ROOT / "assets" / "js").glob("*.js")):
        if not path.read_text(encoding="utf-8").strip():
            js_errors.append(f"{path.relative_to(ROOT)}: empty script")
    errors.extend(js_errors)
    if errors:
        print("QA FAILED")
        print("\n".join(errors))
        return 1
    print(f"QA PASSED: {len(HTML_FILES)} HTML pages, static links, landmarks, and assets checked")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
