#!/usr/bin/env python3
"""
Scan all .md files for mmbiz.qpic.cn images, download them, upload to Cloudflare R2,
and replace image URLs with R2 public URLs.

Requires: pip install boto3
Loads R2 config from .env.dev (or env): STORAGE_DOMAIN, R2_BUCKET, R2_ACCOUNT_ID,
R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY. Optional: R2_UPLOAD_PATH (default: uploads).
"""

import hashlib
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Optional: load .env.dev from project root
def load_dotenv(env_path: Path) -> None:
    if not env_path.exists():
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, _, v = line.partition("=")
                k, v = k.strip(), v.strip()
                if v.startswith('"') and v.endswith('"'):
                    v = v[1:-1]
                if k and k not in os.environ:
                    os.environ[k] = v


# Markdown image pattern: ![alt](url)
MMBIZ_IMAGE_RE = re.compile(
    r"!\[([^\]]*)\]\((https://mmbiz\.qpic\.cn/[^)\s]+)\)",
    re.IGNORECASE,
)

# Default scan roots (content only to avoid node_modules etc.)
DEFAULT_ROOTS = ["content"]
R2_UPLOAD_PREFIX = "md-img"


def get_ext_from_url(url: str) -> str:
    """Infer file extension from wx_fmt= in URL or path."""
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    fmt = (qs.get("wx_fmt") or [None])[0]
    if fmt and fmt.lower() in ("png", "jpeg", "jpg", "gif", "webp", "bmp"):
        return f".{fmt.lower()}" if fmt.lower() != "jpg" else ".jpg"
    # path often has /640? so no extension; default png
    return ".png"


def find_md_files(roots: list[str], base: Path) -> list[Path]:
    out: list[Path] = []
    skip_dirs = {"node_modules", ".git", ".next", "__pycache__"}
    for r in roots:
        root = (base / r).resolve()
        if not root.exists():
            continue
        if root.is_file():
            if root.suffix.lower() == ".md":
                out.append(root)
            continue
        try:
            for dirpath, dirnames, filenames in os.walk(root, topdown=True):
                dirnames[:] = [d for d in dirnames if d not in skip_dirs]
                for name in filenames:
                    if name.lower().endswith(".md"):
                        out.append(Path(dirpath) / name)
        except OSError:
            continue
    return sorted(set(out))


def collect_mmbiz_urls(md_path: Path) -> list[tuple[str, str]]:
    """Return list of (alt_text, url) for mmbiz images in file."""
    text = md_path.read_text(encoding="utf-8")
    return MMBIZ_IMAGE_RE.findall(text)


def download_image(url: str) -> tuple[bytes, str]:
    """Download image; return (body, content_type)."""
    import urllib.request

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read()
        ct = resp.headers.get("Content-Type", "application/octet-stream")
        if ";" in ct:
            ct = ct.split(";", 1)[0].strip()
    return body, ct


def upload_to_r2(
    body: bytes,
    key: str,
    content_type: str,
    *,
    bucket: str,
    endpoint: str,
    access_key: str,
    secret_key: str,
) -> None:
    import boto3
    from botocore.config import Config

    # R2 is S3-compatible
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=body,
        ContentType=content_type,
        ACL='public-read',
    )


def build_public_url(domain: str, upload_path: str, key: str) -> str:
    domain = domain.strip()
    if not domain.startswith("http"):
        domain = f"https://{domain}"
    base = domain.rstrip("/")
    path = upload_path.strip("/").rstrip("/")
    key = key.lstrip("/")
    return f"{base}/{path}/{key}" if path else f"{base}/{key}"


def main() -> None:
    base = Path(__file__).resolve().parent.parent
    env_path = base / ".env.dev"
    load_dotenv(env_path)

    storage_domain = os.environ.get("STORAGE_DOMAIN")
    bucket = os.environ.get("R2_BUCKET")
    endpoint = os.environ.get("R2_ENDPOINT")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    upload_path = os.environ.get("R2_UPLOAD_PATH", "md-img").strip().strip("/")

    missing = [k for k, v in {
        "STORAGE_DOMAIN": storage_domain,
        "R2_BUCKET": bucket,
        "R2_ENDPOINT": endpoint,
        "R2_ACCESS_KEY_ID": access_key,
        "R2_SECRET_ACCESS_KEY": secret_key,
    }.items() if not v]
    if missing:
        print("Missing env (set in .env.dev or environment):", ", ".join(missing), file=sys.stderr)
        sys.exit(1)

    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("Dry run: will not download/upload or modify files.")

    md_files = find_md_files(DEFAULT_ROOTS, base)
    # Collect all unique mmbiz URLs and which files reference them
    url_to_files: dict[str, set[Path]] = {}
    for path in md_files:
        for _alt, url in collect_mmbiz_urls(path):
            url_to_files.setdefault(url, set()).add(path)

    if not url_to_files:
        print("No mmbiz.qpic.cn images found in markdown files.")
        return

    print(f"Found {len(url_to_files)} unique mmbiz image(s) in {sum(1 for s in url_to_files.values() for _ in s)} reference(s).")

    url_to_r2: dict[str, str] = {}

    for i, (url, _) in enumerate(url_to_files.items(), 1):
        ext = get_ext_from_url(url)
        key_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
        key = f"{key_hash}{ext}"

        if dry_run:
            url_to_r2[url] = build_public_url(storage_domain, upload_path, key)
            print(f"  [{i}] would upload -> {url_to_r2[url]}")
            continue

        try:
            body, content_type = download_image(url)
            upload_to_r2(
                body, key, content_type,
                bucket=bucket,
                endpoint=endpoint,
                access_key=access_key,
                secret_key=secret_key,
            )
            public_url = build_public_url(storage_domain, upload_path, key)
            url_to_r2[url] = public_url
            print(f"  [{i}] uploaded -> {public_url}")
        except Exception as e:
            print(f"  [{i}] FAILED {url}: {e}", file=sys.stderr)

    if dry_run or not url_to_r2:
        return

    # Replace in each affected file: replace each old URL string with R2 URL (robust to format)
    updated_count = 0
    for path in md_files:
        text = path.read_text(encoding="utf-8")
        new_text = text
        for old_url, new_url in url_to_r2.items():
            if old_url in new_text:
                new_text = new_text.replace(old_url, new_url)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print(f"Updated: {path}")
            updated_count += 1
    if updated_count:
        print(f"Done: replaced URLs in {updated_count} file(s).")


if __name__ == "__main__":
    main()
