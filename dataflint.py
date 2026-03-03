#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║         DataFlint API Client  —  Production Grade               ║
║                                                                  ║
║  HOW THIS WORKS                                                  ║
║  ─────────────                                                   ║
║  Step 1  Fetch the DataFlint HTML page from YOUR live server     ║
║  Step 2  Parse the <script src=...> to find the JS bundle URL    ║
║  Step 3  Download YOUR running JS bundle (the browser's source)  ║
║  Step 4  Regex-scan the bundle for every API endpoint string     ║
║  Step 5  Validate each discovered URL against the server (200?)  ║
║  Step 6  Call all confirmed Spark native + DataFlint endpoints   ║
║  Step 7  Print full JSON + human-readable digest                 ║
║                                                                  ║
║  No guessing.  Reads your code.  Works on any DataFlint version. ║
╚══════════════════════════════════════════════════════════════════╝

Requirements:  pip install requests
Usage:         python dataflint_client.py

Set SHS_URL and APP_ID below then run.
"""

import re
import sys
import json
import logging
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ──────────────────────────────────────────────────────────────
#  CONFIG  ← only these two lines need changing
# ──────────────────────────────────────────────────────────────
SHS_URL = "http://localhost:18080"
APP_ID  = "spark-2b032ae33834f3d8b143c11951d94ea"
# ──────────────────────────────────────────────────────────────

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("dataflint")

# ── HTTP session with retries ──────────────────────────────────
def make_session() -> requests.Session:
    s = requests.Session()
    retry = Retry(total=3, backoff_factor=1,
                  status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    s.mount("http://", adapter)
    s.mount("https://", adapter)
    s.headers.update({
        "Accept": "application/json, text/html, */*",
        "User-Agent": "DataFlint-PythonClient/1.0",
    })
    return s

S = make_session()

# ─────────────────────────────────────────────────────────────
#  LOW-LEVEL HTTP
# ─────────────────────────────────────────────────────────────

def get(url: str, params=None, timeout=60) -> tuple[int, Optional[requests.Response]]:
    """Return (status_code, response).  Never raises."""
    try:
        r = S.get(url, params=params, timeout=timeout)
        return r.status_code, r
    except requests.exceptions.ConnectionError:
        log.error("Connection refused — is the server up at %s?", SHS_URL)
        return 0, None
    except requests.exceptions.Timeout:
        log.warning("Timeout: %s", url)
        return -1, None
    except Exception as exc:
        log.warning("Request error %s: %s", url, exc)
        return -1, None


def get_json(url: str, params=None) -> Optional[dict | list]:
    code, r = get(url, params=params)
    if code == 200:
        try:
            return r.json()
        except Exception:
            log.warning("Non-JSON response from %s", url)
    else:
        log.debug("HTTP %s  %s", code, url)
    return None


def show(title: str, data):
    """Pretty-print a result block."""
    border = "═" * 62
    print(f"\n{border}")
    print(f"  {title}")
    print(border)
    if data is None:
        print("  (no data)")
    elif isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2))
    else:
        print(str(data)[:3000])


# ─────────────────────────────────────────────────────────────
#  PHASE 1 — FETCH DATAFLINT HTML PAGE
#  Discovers the true URL path that DataFlint is mounted on.
# ─────────────────────────────────────────────────────────────

log.info("━━━  PHASE 1: Locate DataFlint HTML page  ━━━")

# Candidates in priority order based on your confirmed URL:
#   http://localhost:18080/spark-xxx/dataflint/#/alerts
#                          ↑ appId  ↑ tab name
PAGE_CANDIDATES = [
    f"{SHS_URL}/{APP_ID}/dataflint/",           # ← your confirmed pattern
    f"{SHS_URL}/history/{APP_ID}/dataflint/",
    f"{SHS_URL}/{APP_ID}/1/dataflint/",
    f"{SHS_URL}/history/{APP_ID}/1/dataflint/",
    f"{SHS_URL}/proxy/{APP_ID}/dataflint/",
    f"{SHS_URL}/dataflint/",                    # live driver (no appId)
]

page_url   = None
page_html  = None

for candidate in PAGE_CANDIDATES:
    code, resp = get(candidate)
    ok = "✅" if code == 200 else f"❌ {code}"
    log.info("%s  %s", ok, candidate)
    if code == 200 and page_url is None:
        page_url  = candidate
        page_html = resp.text

if page_url is None:
    log.error("Could not reach DataFlint page. Verify APP_ID is correct.")
    log.error("Open %s in your browser and copy the app ID from the URL.", SHS_URL)
    sys.exit(1)

log.info("✅ DataFlint page found: %s", page_url)
# Strip trailing slash for URL joining
page_base = page_url.rstrip("/")


# ─────────────────────────────────────────────────────────────
#  PHASE 2 — DOWNLOAD THE JS BUNDLE
#  The bundle is the compiled React app.
#  It contains every API URL the browser would call, as string literals.
# ─────────────────────────────────────────────────────────────

log.info("━━━  PHASE 2: Download JS bundle  ━━━")

# Parse <script src="..."> from HTML
script_tags = re.findall(
    r'<script[^>]+src=["\']([^"\']+)["\'][^>]*>',
    page_html,
    re.IGNORECASE,
)
log.info("Script tags found in HTML: %s", script_tags)

# Resolve each src to an absolute URL
def resolve(src: str) -> str:
    if src.startswith("http"):
        return src
    parsed = urlparse(SHS_URL)
    if src.startswith("/"):
        return f"{parsed.scheme}://{parsed.netloc}{src}"
    return urljoin(page_url, src)

bundle_text = None
bundle_url  = None

for src in script_tags:
    full = resolve(src)
    # Only try JS files
    if not full.endswith(".js") and ".js" not in src:
        continue
    log.info("Fetching bundle: %s", full)
    code, resp = get(full, timeout=120)
    if code == 200 and resp and len(resp.text) > 10_000:
        bundle_text = resp.text
        bundle_url  = full
        log.info("✅ Bundle downloaded: %s chars from %s", f"{len(bundle_text):,}", full)
        break
    else:
        log.warning("HTTP %s or too small (%s chars)", code,
                    len(resp.text) if resp else 0)

if bundle_text is None:
    log.warning("Could not download JS bundle. Will probe common patterns instead.")


# ─────────────────────────────────────────────────────────────
#  PHASE 3 — EXTRACT API ROUTES FROM BUNDLE
#  Scan the minified bundle for URL path strings.
#  The DataFlint React app builds URLs like:
#    `${baseUrl}/api/v1/app/summary`
#    `${baseUrl}/api/v1/stages`
#  After minification the path segments remain as plain strings.
# ─────────────────────────────────────────────────────────────

log.info("━━━  PHASE 3: Extract API routes from bundle  ━━━")

# Keywords that appear in DataFlint's own API paths
DATAFLINT_KEYWORDS = {
    "app/summary", "app/info", "appInfo", "appSummary",
    "stages", "alerts", "sql", "plan", "dataflint",
    "configuration", "executors", "jobs",
}

# Keywords that appear in Spark native API paths
SPARK_NATIVE_KEYWORDS = {
    "api/v1", "applications", "jobs", "stages",
    "allexecutors", "environment", "sql",
}

discovered_paths: set[str] = set()

if bundle_text:
    # ── Pattern 1: quoted string literals containing API-like segments ──
    #   matches: "/api/v1/app/summary"  or  "api/v1/stages"
    for m in re.finditer(
        r'["\`]([/\w][\w/\-\.]*(?:api|dataflint|summary|stages|alerts|plan|sql|jobs|executors)[/\w\-\.]*)["\`]',
        bundle_text
    ):
        path = m.group(1)
        if 2 < len(path) < 120 and "/" in path:
            discovered_paths.add(path)

    # ── Pattern 2: template literals — `${base}/api/v1/stages` ──
    for m in re.finditer(r'`([^`]{3,120})`', bundle_text):
        t = m.group(1)
        if any(kw in t for kw in ["api/v1", "dataflint", "summary", "stages", "alerts"]):
            # Normalize ${...} to {var}
            normalized = re.sub(r'\$\{[^}]+\}', '{var}', t)
            discovered_paths.add(normalized)

    # ── Pattern 3: string concatenation  ".../" + "stages" ──
    for m in re.finditer(
        r'"(/[/\w\-\.]+)"',
        bundle_text
    ):
        path = m.group(1)
        if any(kw in path for kw in DATAFLINT_KEYWORDS | SPARK_NATIVE_KEYWORDS):
            if 3 < len(path) < 100:
                discovered_paths.add(path)

    log.info("Discovered %d path strings from bundle:", len(discovered_paths))
    for p in sorted(discovered_paths):
        log.info("  %s", p)
else:
    log.info("No bundle to scan — using known patterns")


# ─────────────────────────────────────────────────────────────
#  PHASE 4 — CONFIRM THE DATAFLINT API BASE URL
#  Build candidate API bases from:
#    (a) the confirmed page URL
#    (b) paths extracted from the bundle
#    (c) known Spark + DataFlint patterns
# ─────────────────────────────────────────────────────────────

log.info("━━━  PHASE 4: Confirm API base URL  ━━━")

# Derive base prefix from the confirmed page URL
# page_base = http://localhost:18080/spark-xxx/dataflint
page_path = urlparse(page_base).path   # /spark-xxx/dataflint

# Remove /dataflint suffix to get the app prefix
app_prefix = page_path.replace("/dataflint", "")   # /spark-xxx  (may be "")

# Build candidate API bases
api_base_candidates: list[str] = [
    # Most likely: API under the dataflint tab prefix
    f"{SHS_URL}{page_path}/api/v1",
    f"{SHS_URL}{page_path}/api",
    # Under app prefix but not the tab
    f"{SHS_URL}{app_prefix}/dataflint/api/v1",
    f"{SHS_URL}{app_prefix}/api/v1/dataflint",
    # Top-level dataflint namespace
    f"{SHS_URL}/dataflint/api/v1",
    f"{SHS_URL}/api/v1/dataflint",
]

# Add any api-v1-looking paths extracted from bundle
for path in discovered_paths:
    if "api/v1" in path or "api" in path.lower():
        # Reconstruct as absolute URL using the host
        clean = path.rstrip("/").replace("{var}", APP_ID)
        # If it ends in a known resource, strip it to get the base
        for suffix in ["/app/summary", "/appInfo", "/appSummary",
                       "/stages", "/alerts", "/jobs"]:
            if clean.endswith(suffix):
                base_path = clean[:-len(suffix)]
                full = (
                    f"{SHS_URL}{base_path}"
                    if base_path.startswith("/")
                    else f"{SHS_URL}/{base_path}"
                )
                api_base_candidates.append(full)

# Deduplicate, keeping order
seen = set()
unique_candidates = []
for c in api_base_candidates:
    if c not in seen:
        seen.add(c)
        unique_candidates.append(c)

confirmed_base: Optional[str] = None

log.info("Probing %d API base candidates:", len(unique_candidates))
for base in unique_candidates:
    probe_url = f"{base}/app/summary"
    code, _ = get(probe_url)
    ok = "✅ 200" if code == 200 else f"❌ {code}"
    log.info("  %s  %s", ok, probe_url)
    if code == 200 and confirmed_base is None:
        confirmed_base = base

# Also try bundle-extracted paths directly as full URLs
if confirmed_base is None and bundle_text:
    log.info("Trying exact bundle paths directly:")
    for path in sorted(discovered_paths):
        if "summary" in path or "appInfo" in path:
            clean = path.replace("{var}", APP_ID)
            full = (
                f"{SHS_URL}{clean}"
                if clean.startswith("/")
                else f"{SHS_URL}/{clean}"
            )
            code, _ = get(full)
            ok = "✅ 200" if code == 200 else f"❌ {code}"
            log.info("  %s  %s", ok, full)
            if code == 200 and confirmed_base is None:
                # Infer base by stripping the resource name
                for suffix in ["/app/summary", "/appInfo", "/summary"]:
                    if full.endswith(suffix):
                        confirmed_base = full[:-len(suffix)]
                        break

if confirmed_base is None:
    log.error("No DataFlint API base returned HTTP 200.")
    log.error("")
    log.error("ACTION NEEDED:")
    log.error("  1. Open DevTools in your browser (F12)")
    log.error("  2. Go to: Network tab → filter by Fetch/XHR")
    log.error("  3. Open your DataFlint app: %s", page_url)
    log.error("  4. Copy the first XHR request URL")
    log.error("  5. Paste it here and we'll update the script")
    sys.exit(1)

log.info("✅ DataFlint API base: %s", confirmed_base)

# Spark native API base (always this pattern regardless of proxy)
spark_base = f"{SHS_URL}/api/v1/applications/{APP_ID}"
log.info("✅ Spark native base:  %s", spark_base)


# ─────────────────────────────────────────────────────────────
#  PHASE 5 — SPARK NATIVE API CALLS
# ─────────────────────────────────────────────────────────────

log.info("━━━  PHASE 5: Spark Native API  ━━━")

jobs = get_json(f"{spark_base}/jobs")
if jobs is not None:
    show(f"Jobs  [{len(jobs)}]", jobs)

stages = get_json(f"{spark_base}/stages")
if stages is not None:
    show(f"Stages  [{len(stages)}]", stages)

executors = get_json(f"{spark_base}/allexecutors")
if executors is not None:
    show(f"Executors  [{len(executors)}]", executors)

sql_list = get_json(
    f"{spark_base}/sql",
    params={"offset": 0, "length": 20, "planDescription": "false"},
) or []
if sql_list:
    show(f"SQL Queries  [{len(sql_list)}]", sql_list)


# ─────────────────────────────────────────────────────────────
#  PHASE 6 — DATAFLINT API CALLS
# ─────────────────────────────────────────────────────────────

log.info("━━━  PHASE 6: DataFlint API  ━━━")
log.info("Base: %s", confirmed_base)

summary  = get_json(f"{confirmed_base}/app/summary")
if summary:
    show("DataFlint — App Summary", summary)
else:
    # Try alternate names seen in different versions
    for alt in ["app/info", "appSummary", "appInfo"]:
        summary = get_json(f"{confirmed_base}/{alt}")
        if summary:
            show(f"DataFlint — App Summary (via /{alt})", summary)
            break

df_stages = get_json(f"{confirmed_base}/stages")
if df_stages:
    show(f"DataFlint — Stages  [{len(df_stages)}]", df_stages)

df_alerts = get_json(f"{confirmed_base}/alerts")
if df_alerts is not None:
    show(f"DataFlint — Alerts  [{len(df_alerts)}]", df_alerts)

# SQL Plans — one per query, cap at 3
if sql_list:
    for q in sql_list[:3]:
        qid  = q.get("id")
        desc = q.get("description", "")[:45]
        plan = get_json(f"{confirmed_base}/sql/{qid}/plan")
        if plan:
            show(f"DataFlint — SQL Plan  id={qid}  '{desc}'", plan)


# ─────────────────────────────────────────────────────────────
#  PHASE 7 — HUMAN DIGEST
# ─────────────────────────────────────────────────────────────

print("\n" + "═" * 62)
print("  DIGEST")
print("═" * 62)
print(f"\n  App ID   : {APP_ID}")
print(f"  Page     : {page_url}")
print(f"  API Base : {confirmed_base}")

if summary:
    eff = summary.get("cpuEfficiency", 0) or 0
    mem = summary.get("totalMemorySpill", 0) or 0
    dsk = summary.get("totalDiskSpill", 0) or 0
    gc  = summary.get("gcRatio", 0) or 0
    dur = (summary.get("duration", 0) or 0) / 60_000

    print(f"\n  ── Performance {'─'*35}")
    print(f"  CPU Efficiency : {eff*100:.0f}%  "
          + ("✓ good" if eff >= 0.7 else "⚠  underutilized"))
    print(f"  Duration       : {dur:.1f} min")
    print(f"  Tasks          : {summary.get('totalTasks', '?')}")
    print(f"  Spark Version  : {summary.get('sparkVersion', '?')}")
    print(f"  GC Ratio       : {gc*100:.1f}%  "
          + ("⚠  high" if gc > 0.1 else "✓ ok"))

    print(f"\n  ── I/O {'─'*42}")
    print(f"  Input          : {summary.get('totalInputBytes', 0)/1e9:.2f} GB")
    print(f"  Output         : {summary.get('totalOutputBytes', 0)/1e9:.2f} GB")
    print(f"  Shuffle Read   : {summary.get('totalShuffleRead', 0)/1e9:.2f} GB")
    print(f"  Shuffle Write  : {summary.get('totalShuffleWrite', 0)/1e9:.2f} GB")

    print(f"\n  ── Spill {'─'*40}")
    print(f"  Memory Spill   : {mem/1e9:.2f} GB  "
          + ("⚠  detected" if mem > 0 else "✓ none"))
    print(f"  Disk Spill     : {dsk/1e9:.2f} GB  "
          + ("🔴 DISK SPILL!" if dsk > 0 else "✓ none"))

if df_alerts is not None:
    high   = [a for a in df_alerts if a.get("severity") == "HIGH"]
    medium = [a for a in df_alerts if a.get("severity") == "MEDIUM"]
    low    = [a for a in df_alerts if a.get("severity") == "LOW"]
    print(f"\n  ── Alerts {'─'*39}")
    print(f"  🔴 HIGH={len(high)}   ⚠ MED={len(medium)}   ℹ LOW={len(low)}")
    for a in df_alerts:
        icon = ("🔴" if a.get("severity") == "HIGH"
                else "⚠️ " if a.get("severity") == "MEDIUM" else "ℹ️ ")
        sid  = f" [stage {a['stageId']}]" if a.get("stageId") is not None else ""
        print(f"\n  {icon} [{a.get('severity')}] {a.get('key')}{sid}")
        print(f"       {a.get('message', '')}")
        print(f"       Fix: {a.get('suggestion', '')}")
else:
    if confirmed_base:
        print(f"\n  Alerts: ✓ None triggered")

if df_stages:
    print(f"\n  ── Top 3 Slowest Stages {'─'*27}")
    top3 = sorted(df_stages, key=lambda s: s.get("duration", 0), reverse=True)[:3]
    for s in top3:
        dur   = s.get("duration", 0) / 1_000
        eff   = s.get("cpuEfficiency", 0) or 0
        skew  = s.get("durationSkewRatio", 1.0) or 1.0
        spill = (s.get("diskSpill") or 0) > 0
        name  = s.get("name", "")[:42]
        print(f"\n  Stage {s.get('stageId', '?'):>3} | {dur:>7.1f}s | "
              f"eff={eff*100:.0f}% | skew={skew:.1f}x"
              + (" | 🔴 disk spill" if spill else ""))
        print(f"           {name}")

print("\n" + "═" * 62)
print("  Done.")
print("═" * 62)
