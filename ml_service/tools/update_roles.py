import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROLES_PATH = os.path.join(os.path.dirname(BASE_DIR), "config", "roles.json")

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def normalize_set(val):
    return sorted(list(set([v.strip() for v in val if v and v.strip()])))

def merge_roles(base, updates):
    for k in ("role_keywords", "role_skills", "skill_synonyms"):
        if k not in updates:
            continue
        if k == "skill_synonyms":
            base.setdefault(k, {})
            base[k].update(updates[k])
            continue
        base.setdefault(k, {})
        for role, values in updates[k].items():
            base[k].setdefault(role, [])
            base[k][role] = normalize_set(base[k][role] + values)
    return base

def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/update_roles.py <updates.json>")
        sys.exit(1)

    updates_path = sys.argv[1]
    base = load_json(ROLES_PATH)
    updates = load_json(updates_path)
    merged = merge_roles(base, updates)
    save_json(ROLES_PATH, merged)
    print(f"Updated {ROLES_PATH}")

if __name__ == "__main__":
    main()
