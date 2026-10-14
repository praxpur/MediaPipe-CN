#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取 developers.google.com 文档页 -> 下载图片到 assets/ -> 转为 Markdown。

用法:
    python tools/fetch_page.py <页面URL> <输出md路径>

示例:
    python tools/fetch_page.py \
        https://developers.google.com/edge/mediapipe/solutions/vision/object_detector \
        docs/solutions/vision/object_detector.md

依赖: pip install beautifulsoup4 markdownify
"""
import os
import re
import sys
import urllib.request
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from markdownify import markdownify as md

BASE_URL = "https://developers.google.com"
DOC_PREFIX = "/edge/mediapipe/"
UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def asset_relpath(full_url):
    """把图片 URL 映射到 assets/ 下的相对路径,镜像原站结构。"""
    parsed = urlparse(full_url)
    path = parsed.path
    if path.startswith("/static/"):
        path = path[len("/static/"):]
    if path.startswith("edge/mediapipe/"):
        return path
    if parsed.netloc.endswith("gstatic.com"):
        return "gstatic" + path
    return "misc/" + os.path.basename(path)


def localize_images(content, page_url, out_path):
    depth = len(out_path.replace("\\", "/").split("/")) - 1
    rel_prefix = "../" * depth + "assets/"
    count = 0
    for img in content.find_all("img"):
        src = img.get("src")
        if not src:
            continue
        full_url = urljoin(page_url, src)
        rel = asset_relpath(full_url)
        local_abs = os.path.join("assets", rel)
        if not os.path.exists(local_abs):
            os.makedirs(os.path.dirname(local_abs), exist_ok=True)
            try:
                with open(local_abs, "wb") as f:
                    f.write(fetch(full_url))
                count += 1
            except Exception as e:
                print(f"  图片下载失败 {full_url}: {e}")
                img.insert_after(f"<!-- 图片下载失败,保留原链接: {full_url} -->")
                continue
        img["src"] = rel_prefix + rel
    return count


def rewrite_links(content, out_path):
    """把站内 /edge/mediapipe/... 链接改写为指向 docs/ 的相对 .md 链接。"""
    out_dir = os.path.dirname(out_path)
    for a in content.find_all("a"):
        href = a.get("href")
        if not href or not href.startswith(DOC_PREFIX):
            continue
        target = "docs/" + href[len(DOC_PREFIX):]
        if not target.endswith(".md"):
            target += ".md"
        a["href"] = os.path.relpath(target, out_dir).replace("\\", "/")


def extract_last_updated(soup):
    for el in soup.find_all(string=re.compile(r"Last updated")):
        m = re.search(r"Last updated\s*([\d-]+)", el.strip())
        if m:
            return m.group(1)
    return ""


def process(url, out_path):
    print(f"Fetching {url} ...")
    soup = BeautifulSoup(fetch(url).decode("utf-8"), "html.parser")
    content = soup.find("article") or soup.find("devsite-content")
    if not content:
        sys.exit(f"未找到正文(article/devsite-content): {url}")
    for tag in content(["script", "style"]):
        tag.decompose()

    n = localize_images(content, url, out_path)
    rewrite_links(content, out_path)
    last_updated = extract_last_updated(soup)

    body = md(str(content), heading_style="ATX",
              escape_asterisks=False, escape_underscores=False)
    body = re.sub(r"\n{3,}", "\n\n", body)

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"---\noriginal_url: {url}\nlast_updated: {last_updated}\n---\n\n")
        f.write(body)
    print(f"Saved {out_path} (下载图片 {n} 张)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    process(sys.argv[1], sys.argv[2])
