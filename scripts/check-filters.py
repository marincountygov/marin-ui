#!/usr/bin/env python3
"""Check schemas/filter-panel.schema.json against the example files.

Every tests/fixtures/filters/valid-*.json must pass and every invalid-*.json must fail.
An app can check its own filters.json with: python3 check-filters.py path/to/filters.json
That also checks the file against the app's data: each options.from file must exist, hold a list of records,
and have values for the named fields.
"""
import json
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
except ImportError:
    sys.exit("ERROR: the jsonschema package is required (pip install jsonschema).")

ROOT = Path(__file__).resolve().parent.parent
schema = json.loads((ROOT / "schemas" / "filter-panel.schema.json").read_text(encoding="utf-8"))
Draft202012Validator.check_schema(schema)
validator = Draft202012Validator(schema)


def extra_problems(data, base=None):
    """What a schema cannot say: ids and address parameters used twice, and (with base, the folder the app
    serves from) choices that point at a missing file or at records that have no such field or no values."""
    found = []
    ids, params = [data.get("search", {}).get("id")], ["q"]
    for group in data.get("groups", []):
        ids.append(group.get("id"))
        base_param = group.get("param") or group.get("id")
        params += [f"{base_param}-from", f"{base_param}-to"] if group.get("type") == "date-range" else [base_param]
    for label, values in (("id", ids), ("address parameter", params)):
        for value in sorted({v for v in values if v and values.count(v) > 1}):
            found.append(f"the {label} \"{value}\" is used more than once")
    if base is not None:
        for group in data.get("groups", []):
            spec = group.get("options") or {}
            if "from" not in spec:
                continue
            path = Path(base) / spec["from"]
            if not path.is_file():
                found.append(f"{group['id']}: {spec['from']} does not exist")
                continue
            records = json.loads(path.read_text(encoding="utf-8"))
            for key in filter(None, (spec.get("records") or "").split(".")):
                records = records.get(key) if isinstance(records, dict) else None
            if not isinstance(records, list) or not records:
                found.append(f"{group['id']}: {spec['from']} has no list of records at \"{spec.get('records', '')}\"")
                continue
            for field in (spec["valueField"], spec.get("labelField"), spec.get("parentField"), *group.get("groupBy", [])):
                if field and not any(isinstance(r, dict) and r.get(field) not in (None, "", []) for r in records):
                    found.append(f"{group['id']}: no record has a value for \"{field}\"")
    return found


def errors(path, base=None):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    found = [f"{'/'.join(str(p) for p in e.path) or '(top)'}: {e.message}" for e in sorted(validator.iter_errors(data), key=lambda e: list(e.path))]
    return found + extra_problems(data, base)


if len(sys.argv) > 1:
    failed = False
    for arg in sys.argv[1:]:
        for error in errors(arg, Path(arg).resolve().parent):
            failed = True
            print(f"{arg}: {error}")
    sys.exit(1 if failed else 0)

problems = []
for path in sorted((ROOT / "tests" / "fixtures" / "filters").glob("*.json")):
    found = errors(path)
    if path.name.startswith("valid-") and found:
        problems.append(f"{path.name} should pass but fails: {found[0]}")
    if path.name.startswith("invalid-") and not found:
        problems.append(f"{path.name} should fail but passes")
if problems:
    sys.exit("\n".join(problems))
print("Filter column schema: all examples behave as expected.")
