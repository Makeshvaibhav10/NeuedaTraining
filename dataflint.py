import requests
import json

# ─────────────────────────────────────────────
#  CONFIG — change these two lines
# ─────────────────────────────────────────────
SHS_URL = "http://localhost:18080"   # your SHS address
APP_ID  = None                       # e.g. "app-20240101120000-0001"
                                     # set to None to auto-pick latest app
# ─────────────────────────────────────────────


def pretty(label, data):
    """Print a labelled JSON block."""
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(json.dumps(data, indent=2))


def hit(url, label, params=None):
    """GET a URL, print the result, return parsed JSON or None on error."""
    print(f"\n>>> GET {url}")
    try:
        resp = requests.get(url, params=params, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        pretty(label, data)
        return data
    except requests.exceptions.ConnectionError:
        print(f"  [ERROR] Cannot connect to {SHS_URL}")
        print("  Is your Spark History Server running?")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  [ERROR] HTTP {resp.status_code} — {e}")
        print("  Response:", resp.text[:300])
        return None
    except Exception as e:
        print(f"  [ERROR] {e}")
        return None


# ──────────────────────────────────────────────────────────────
#  STEP 1 — Get all applications from Spark's native API
# ──────────────────────────────────────────────────────────────
print("\n" + "─"*60)
print("  SPARK HISTORY SERVER — ALL APPLICATIONS")
print("─"*60)

apps = hit(
    f"{SHS_URL}/api/v1/applications",
    "All Applications (Spark Native API)",
    params={"limit": 100, "status": "completed"}
)

if not apps:
    print("\n[STOP] Could not reach SHS. Check SHS_URL and try again.")
    exit(1)

print(f"\nFound {len(apps)} completed application(s)")


# ──────────────────────────────────────────────────────────────
#  STEP 2 — Pick the app to inspect
# ──────────────────────────────────────────────────────────────
app_id = APP_ID

if app_id is None:
    # Auto-pick the most recently completed app
    app_id = apps[0]["id"]
    app_name = apps[0].get("name", "unknown")
    print(f"\nAuto-selected most recent app:")
    print(f"  ID   : {app_id}")
    print(f"  Name : {app_name}")
else:
    # Verify the specified app exists
    match = next((a for a in apps if a["id"] == app_id), None)
    if not match:
        print(f"\n[STOP] APP_ID '{app_id}' not found in the application list.")
        exit(1)
    print(f"\nUsing specified app: {app_id}")


# ──────────────────────────────────────────────────────────────
#  STEP 3 — Spark native API calls for this application
# ──────────────────────────────────────────────────────────────
print("\n" + "─"*60)
print(f"  SPARK NATIVE API — {app_id}")
print("─"*60)

# Jobs list
hit(
    f"{SHS_URL}/api/v1/applications/{app_id}/jobs",
    "Jobs (Spark Native)"
)

# Stages list
hit(
    f"{SHS_URL}/api/v1/applications/{app_id}/stages",
    "Stages (Spark Native)"
)

# SQL queries list
hit(
    f"{SHS_URL}/api/v1/applications/{app_id}/sql",
    "SQL Queries (Spark Native)",
    params={"offset": 0, "length": 20, "planDescription": "false"}
)

# Executors
hit(
    f"{SHS_URL}/api/v1/applications/{app_id}/allexecutors",
    "Executors (Spark Native)"
)

# Environment (Spark config, JVM info, classpath)
hit(
    f"{SHS_URL}/api/v1/applications/{app_id}/environment",
    "Environment / Config (Spark Native)"
)


# ──────────────────────────────────────────────────────────────
#  STEP 4 — DataFlint API calls for this application
#
#  These endpoints only exist if DataFlint JAR is installed on SHS.
#  If you get 404 here it means DataFlint is not installed.
# ──────────────────────────────────────────────────────────────
print("\n" + "─"*60)
print(f"  DATAFLINT API — {app_id}")
print("─"*60)
print("  (These require DataFlint JAR on SHS classpath)")

BASE = f"{SHS_URL}/history/{app_id}/dataflint/api/v1"

# App-level summary — efficiency, totals, spill, GC
summary = hit(
    f"{BASE}/app/summary",
    "DataFlint — App Summary (efficiency, I/O, spill, GC)"
)

# Per-stage metrics — percentiles, skew ratios, heat map colors
stages = hit(
    f"{BASE}/stages",
    "DataFlint — Stage Metrics (percentiles, skew, spill per stage)"
)

# Alert engine output — all triggered alerts with fix suggestions
alerts = hit(
    f"{BASE}/alerts",
    "DataFlint — Alerts (rule engine output, severity sorted)"
)


# ──────────────────────────────────────────────────────────────
#  STEP 5 — SQL plan for each query (DataFlint performance-annotated)
# ──────────────────────────────────────────────────────────────

# First get the SQL query list from Spark native API
sql_list_resp = requests.get(
    f"{SHS_URL}/api/v1/applications/{app_id}/sql",
    params={"offset": 0, "length": 20, "planDescription": "false"},
    timeout=30
)

if sql_list_resp.status_code == 200:
    sql_queries = sql_list_resp.json()

    if sql_queries:
        print(f"\nFound {len(sql_queries)} SQL queries — fetching DataFlint plan for each...")

        for query in sql_queries[:3]:   # cap at 3 to keep output readable
            query_id = query.get("id")
            query_desc = query.get("description", "")[:60]

            hit(
                f"{BASE}/sql/{query_id}/plan",
                f"DataFlint — SQL Plan (queryId={query_id}, '{query_desc}...')"
            )
    else:
        print("\nNo SQL queries found for this application.")
else:
    print(f"\n[SKIP] Could not fetch SQL list (status {sql_list_resp.status_code})")


# ──────────────────────────────────────────────────────────────
#  STEP 6 — Human-readable summary of what DataFlint returned
# ──────────────────────────────────────────────────────────────
print("\n" + "═"*60)
print("  SUMMARY")
print("═"*60)

if summary:
    eff = summary.get("cpuEfficiency", 0)
    mem = summary.get("totalMemorySpill", 0)
    dsk = summary.get("totalDiskSpill", 0)

    print(f"  App Name       : {summary.get('appName', 'N/A')}")
    print(f"  Spark Version  : {summary.get('sparkVersion', 'N/A')}")
    print(f"  Duration       : {summary.get('duration', 0) / 60000:.1f} minutes")
    print(f"  CPU Efficiency : {eff*100:.0f}%  "
          f"{'✓ GOOD' if eff >= 0.7 else '⚠ LOW — cluster underutilized'}")
    print(f"  Total Tasks    : {summary.get('totalTasks', 'N/A')}")
    print(f"  Input Read     : {summary.get('totalInputBytes', 0) / 1e9:.2f} GB")
    print(f"  Shuffle Read   : {summary.get('totalShuffleRead', 0) / 1e9:.2f} GB")
    print(f"  Memory Spill   : {mem / 1e9:.2f} GB  "
          f"{'⚠ SPILL DETECTED' if mem > 0 else '✓ none'}")
    print(f"  Disk Spill     : {dsk / 1e9:.2f} GB  "
          f"{'🔴 DISK SPILL!' if dsk > 0 else '✓ none'}")
    gc = summary.get("gcRatio", 0)
    print(f"  GC Ratio       : {gc*100:.1f}%  "
          f"{'⚠ HIGH GC' if gc > 0.1 else '✓ ok'}")

if alerts:
    high   = [a for a in alerts if a.get("severity") == "HIGH"]
    medium = [a for a in alerts if a.get("severity") == "MEDIUM"]
    low    = [a for a in alerts if a.get("severity") == "LOW"]
    print(f"\n  Alerts:  🔴 HIGH={len(high)}  ⚠ MEDIUM={len(medium)}  LOW={len(low)}")
    for a in alerts:
        sev   = a.get("severity", "?")
        key   = a.get("key", "?")
        msg   = a.get("message", "")
        icon  = "🔴" if sev == "HIGH" else ("⚠️" if sev == "MEDIUM" else "ℹ️")
        print(f"    {icon} [{sev}] {key}: {msg}")

if stages:
    slowest = sorted(stages, key=lambda s: s.get("duration", 0), reverse=True)[:3]
    print(f"\n  Top 3 slowest stages:")
    for s in slowest:
        name = s.get("name", "")[:50]
        dur  = s.get("duration", 0) / 1000
        eff  = s.get("cpuEfficiency", 0)
        skew = s.get("durationSkewRatio", 1.0)
        print(f"    Stage {s.get('stageId'):>3} | {dur:>7.1f}s | "
              f"eff={eff*100:.0f}% | skew={skew:.1f}x | {name}")

print("\n" + "═"*60)
print("  Done.")
print("═"*60)
