import json
import os
from scorer import final_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TESTS_DIR = os.path.join(os.path.dirname(BASE_DIR), "tests")
FIXTURES_DIR = os.path.join(TESTS_DIR, "fixtures")
SNAPSHOTS_DIR = os.path.join(TESTS_DIR, "snapshots")

os.makedirs(SNAPSHOTS_DIR, exist_ok=True)

def load_fixture(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_snapshot(fixture, result, tolerance=8.0):
    snap = {
        "id": fixture["id"],
        "tolerance": tolerance,
        "expected": {
            "score": [max(0, result["score"] - tolerance), min(100, result["score"] + tolerance)],
            "subscores": {
                "semantic": [max(0, result["subscores"]["semantic"] - tolerance), min(100, result["subscores"]["semantic"] + tolerance)],
                "keyword_coverage": [max(0, result["subscores"]["keyword_coverage"] - tolerance), min(100, result["subscores"]["keyword_coverage"] + tolerance)],
                "role_skill_coverage": [max(0, result["subscores"]["role_skill_coverage"] - tolerance), min(100, result["subscores"]["role_skill_coverage"] + tolerance)],
                "quantified_impact": [max(0, result["subscores"]["quantified_impact"] - tolerance), min(100, result["subscores"]["quantified_impact"] + tolerance)],
                "sections": [max(0, result["subscores"]["sections"] - tolerance), min(100, result["subscores"]["sections"] + tolerance)],
                "formatting": [max(0, result["subscores"]["formatting"] - tolerance), min(100, result["subscores"]["formatting"] + tolerance)],
                "spelling": [max(0, result["subscores"]["spelling"] - tolerance), min(100, result["subscores"]["spelling"] + tolerance)],
                "contact": [max(0, result["subscores"]["contact"] - tolerance), min(100, result["subscores"]["contact"] + tolerance)]
            },
            "role_detected": result["subscores"]["role_detected"]
        }
    }
    return snap

def main():
    fixtures = [f for f in os.listdir(FIXTURES_DIR) if f.endswith(".json")]
    for f in fixtures:
        fixture = load_fixture(os.path.join(FIXTURES_DIR, f))
        result = final_score(fixture["resume"], fixture["job_description"])
        snapshot = write_snapshot(fixture, result)
        out_path = os.path.join(SNAPSHOTS_DIR, f)
        with open(out_path, "w", encoding="utf-8") as out:
            json.dump(snapshot, out, indent=2)
        print(f"Updated snapshot: {out_path}")

if __name__ == "__main__":
    main()
