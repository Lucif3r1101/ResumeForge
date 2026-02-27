from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from rapidfuzz import fuzz, process
from wordfreq import zipf_frequency
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "all-mpnet-base-v2")

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        f"Local model not found at {MODEL_PATH}. "
        "Run tools/download_model.py to download and bundle the model."
    )

model = SentenceTransformer(MODEL_PATH)

STOPWORDS = {
    "the","and","for","with","that","this","from","your","you","are","was","were","will","would",
    "can","could","should","have","has","had","a","an","of","to","in","on","at","as","by","or",
    "be","it","is","we","our","they","their","them","i","me","my","he","she","his","her","its",
    "if","but","not","than","then","so","such","these","those","about","into","over","under",
    "job","role","position","candidate","responsibilities","requirements","preferred","plus"
}

NSFW_TERMS = {
    "severe": {
        "porn","nude","nudes","sex","sexual","hentai","rape","molest","childporn",
        "bestiality","incest","explicit"
    },
    "medium": {
        "weapon","drugs","cocaine","meth","heroin","violence","abuse","assault",
        "gun","rifle","knife","bomb","explosive","terror","kill"
    },
}

COMMON_TERMS = {
    "developer","engineer","android","ios","backend","frontend","fullstack","software",
    "api","rest","graphql","microservices","ml","ai","machine","learning","kotlin","java",
    "python","node","react","sql","docker","kubernetes","aws","gcp","azure","analytics",
    "data","model","pipeline","etl","testing","ci","cd"
}

SECTION_PATTERNS = {
    "experience": re.compile(r"\b(work|experience|employment|professional experience)\b", re.I),
    "skills": re.compile(r"\b(skills|technical skills|core skills)\b", re.I),
    "education": re.compile(r"\b(education|academics|qualification)\b", re.I),
    "projects": re.compile(r"\b(projects|project work)\b", re.I),
    "summary": re.compile(r"\b(summary|profile|objective)\b", re.I),
    "certifications": re.compile(r"\b(certifications|certificates|licenses)\b", re.I),
}

def load_json_config(path, default_value):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_value

ROLES_PATH = os.path.join(BASE_DIR, "config", "roles.json")
SCORING_PATH = os.path.join(BASE_DIR, "config", "scoring.json")

roles_cfg = load_json_config(ROLES_PATH, {})
scoring_cfg = load_json_config(SCORING_PATH, {})

ROLE_KEYWORDS = {
    k: set(v) for k, v in (roles_cfg.get("role_keywords") or {}).items()
}
ROLE_SKILLS = {
    k: set(v) for k, v in (roles_cfg.get("role_skills") or {}).items()
}
SKILL_SYNONYMS = roles_cfg.get("skill_synonyms") or {}

WEIGHTS = scoring_cfg.get("weights") or {}
THRESHOLDS = scoring_cfg.get("thresholds") or {}

def clean_text(text):
    text = text.replace("\x00", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()

def tokenize(text):
    return re.findall(r"\b[a-zA-Z][a-zA-Z\-\+\.]{2,}\b", text.lower())

def normalize_token(token):
    t = token.lower()
    return SKILL_SYNONYMS.get(t, t)

def normalize_tokens(tokens):
    return [normalize_token(t) for t in tokens]

def candidate_terms(resume, jd):
    tokens_resume = set(normalize_tokens(tokenize(resume)))
    tokens_jd = set(normalize_tokens(tokenize(jd)))

    all_role_skills = set()
    for skills in ROLE_SKILLS.values():
        all_role_skills |= set(skills)

    candidates = set()
    candidates |= tokens_resume
    candidates |= tokens_jd
    candidates |= set(SKILL_SYNONYMS.keys())
    candidates |= set(SKILL_SYNONYMS.values())
    candidates |= all_role_skills
    candidates |= COMMON_TERMS

    return set([c for c in candidates if len(c) > 2])

def correct_text(text, candidates):
    tokens = tokenize(text)
    corrected = []
    for t in tokens:
        if len(t) < 4 or re.search(r"\d", t):
            corrected.append(t)
            continue
        if zipf_frequency(t, "en") >= 2.5:
            corrected.append(t)
            continue
        match = process.extractOne(t, candidates, scorer=fuzz.ratio, score_cutoff=92)
        corrected.append(match[0] if match else t)
    return " ".join(corrected)

def semantic_score(resume, jd):
    resume_emb = model.encode([resume])
    jd_emb = model.encode([jd])
    score = cosine_similarity(resume_emb, jd_emb)[0][0]
    return float(score)

def contains_nsfw(text):
    hits = []
    tokens = set(tokenize(text))
    for term in NSFW_TERMS["severe"]:
        if term in tokens:
            hits.append(term)
    for term in NSFW_TERMS["medium"]:
        if term in tokens:
            hits.append(term)
    severe_hit = any(term in NSFW_TERMS["severe"] for term in hits)
    if severe_hit or len(hits) >= 3:
        return True, hits[:5]
    return False, hits[:5]

def misspelling_rate(tokens):
    if not tokens:
        return 0.0, []
    suspects = []
    zipf_min = THRESHOLDS.get("misspell_zipf_min", 2.5)
    for t in tokens:
        if len(t) < 4:
            continue
        if zipf_frequency(t, "en") < zipf_min and not re.search(r"\d", t):
            suspects.append(t)
    rate = len(suspects) / max(len(tokens), 1)
    return rate, list(dict.fromkeys(suspects))[:8]

def quantify_score(resume):
    numbers = re.findall(r"\d+%|\$\d+|\d+ years?|\d+ months?|\d+\+\s*years?", resume.lower())
    return min(len(numbers) / 6, 1.0)

def section_score(resume):
    found = {k: bool(p.search(resume)) for k, p in SECTION_PATTERNS.items()}
    score = sum(1 for v in found.values() if v) / len(found)
    missing = [k for k, v in found.items() if not v]
    return score, missing

def detect_role(jd):
    jd_l = jd.lower()
    role_scores = {}
    for role, keys in ROLE_KEYWORDS.items():
        score = 0
        for k in keys:
            if k in jd_l:
                score += 1
        role_scores[role] = score
    best = max(role_scores.items(), key=lambda x: x[1])
    return best[0] if best[1] > 0 else "software"

def extract_keywords(jd, max_terms=30):
    tokens = [t for t in normalize_tokens(tokenize(jd)) if t not in STOPWORDS]
    freq = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    bigrams = []
    for i in range(len(tokens) - 1):
        if tokens[i] in STOPWORDS or tokens[i+1] in STOPWORDS:
            continue
        bigrams.append(f"{tokens[i]} {tokens[i+1]}")
    for b in bigrams:
        freq[b] = freq.get(b, 0) + 2
    role = detect_role(jd)
    for skill in ROLE_SKILLS.get(role, set()):
        if skill in jd.lower():
            freq[skill] = freq.get(skill, 0) + 3

    for skill in ROLE_SKILLS.get(role, set()):
        if " " in skill and skill in jd.lower():
            freq[skill] = freq.get(skill, 0) + 4

    sorted_terms = sorted(freq.items(), key=lambda x: (-x[1], x[0]))
    return [t for t, _ in sorted_terms[:max_terms]]

def keyword_coverage(resume, jd):
    resume_tokens = set(normalize_tokens(tokenize(resume)))
    resume_text = resume.lower()
    jd_terms = extract_keywords(jd)
    matched = []
    missing = []

    for term in jd_terms:
        if " " in term:
            found = term in resume_text
        else:
            found = normalize_token(term) in resume_tokens
            if not found:
                match = process.extractOne(
                    term, resume_tokens, scorer=fuzz.ratio, score_cutoff=90
                )
                found = bool(match)
        if found:
            matched.append(term)
        else:
            missing.append(term)

    coverage = len(matched) / max(len(jd_terms), 1)
    return coverage, matched[:25], missing[:25]

def role_skill_coverage(resume, jd):
    role = detect_role(jd)
    skills = ROLE_SKILLS.get(role, set())
    if not skills:
        return 0.0, role
    resume_tokens = set(normalize_tokens(tokenize(resume)))
    resume_text = resume.lower()
    matched = 0
    for skill in skills:
        if " " in skill:
            if skill in resume_text:
                matched += 1
        else:
            if normalize_token(skill) in resume_tokens:
                matched += 1
    return matched / max(len(skills), 1), role

def format_score(resume):
    words = tokenize(resume)
    word_count = len(words)
    lines = [l.strip() for l in resume.splitlines() if l.strip()]
    bullet_lines = [l for l in lines if l.startswith(("-", "*", "•"))]
    bullet_ratio = len(bullet_lines) / max(len(lines), 1)
    tab_lines = [l for l in lines if "\t" in l or "|" in l]
    space_columns = [l for l in lines if re.search(r"\s{5,}\S", l)]
    table_penalty_ratio = THRESHOLDS.get("table_line_ratio_penalty", 0.15)
    table_penalty = 0.2 if (len(tab_lines) + len(space_columns)) / max(len(lines), 1) > table_penalty_ratio else 0.0
    wc_min = THRESHOLDS.get("word_count_min", 200)
    wc_max = THRESHOLDS.get("word_count_max", 1200)
    length_score = 1.0 if wc_min <= word_count <= wc_max else 0.5
    bullet_good = THRESHOLDS.get("bullet_ratio_good", 0.20)
    bullet_ok = THRESHOLDS.get("bullet_ratio_ok", 0.10)
    bullet_score = 1.0 if bullet_ratio >= bullet_good else 0.6 if bullet_ratio >= bullet_ok else 0.3
    base = (0.6 * length_score) + (0.4 * bullet_score)
    return max(0.0, base - table_penalty)

def contact_score(resume):
    email = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", resume, re.I)
    phone = re.search(r"(\+?\d[\d\-\s\(\)]{8,}\d)", resume)
    score = 1.0 if email and phone else 0.5 if (email or phone) else 0.0
    missing = []
    if not email:
        missing.append("email")
    if not phone:
        missing.append("phone")
    return score, missing

def final_score(resume, jd):
    resume_raw = resume or ""
    jd_raw = jd or ""
    resume = clean_text(resume_raw)
    jd = clean_text(jd_raw)

    candidates = candidate_terms(resume, jd)
    jd_corrected = correct_text(jd, candidates)
    resume_corrected = correct_text(resume, candidates)

    nsfw_resume, nsfw_hits_r = contains_nsfw(resume)
    nsfw_jd, nsfw_hits_j = contains_nsfw(jd)
    if nsfw_resume or nsfw_jd:
        hits = list(dict.fromkeys(nsfw_hits_r + nsfw_hits_j))[:5]
        return {
            "score": 0,
            "matched": [],
            "missing": [],
            "suggestions": [],
            "red_flags": [f"NSFW or unsafe content detected: {', '.join(hits)}"],
            "subscores": {},
        }

    sem = semantic_score(resume_corrected, jd_corrected)
    coverage, matched, missing = keyword_coverage(resume_corrected, jd_corrected)
    role_cov, role = role_skill_coverage(resume_corrected, jd_corrected)
    quantify = quantify_score(resume)
    sections, missing_sections = section_score(resume)
    fmt = format_score(resume_raw)
    contact, missing_contact = contact_score(resume_raw)

    tokens = tokenize(resume)
    misspell_rate, misspell_samples = misspelling_rate(tokens)
    misspell_penalty = THRESHOLDS.get("misspell_penalty_mult", 2.0)
    spelling = max(0.0, 1.0 - (misspell_rate * misspell_penalty))

    w = {
        "semantic": WEIGHTS.get("semantic", 0.30),
        "keyword_coverage": WEIGHTS.get("keyword_coverage", 0.25),
        "role_skill_coverage": WEIGHTS.get("role_skill_coverage", 0.15),
        "quantified_impact": WEIGHTS.get("quantified_impact", 0.10),
        "sections": WEIGHTS.get("sections", 0.10),
        "formatting": WEIGHTS.get("formatting", 0.05),
        "spelling": WEIGHTS.get("spelling", 0.03),
        "contact": WEIGHTS.get("contact", 0.02),
    }

    jd_token_count = len(tokenize(jd_corrected))
    confidence = "high"
    red_flags = []
    if jd_token_count < 20:
        confidence = "low"
        red_flags.append("Job description is very short. Score may be unreliable.")

    final = (
        (w["semantic"] * sem) +
        (w["keyword_coverage"] * coverage) +
        (w["role_skill_coverage"] * role_cov) +
        (w["quantified_impact"] * quantify) +
        (w["sections"] * sections) +
        (w["formatting"] * fmt) +
        (w["spelling"] * spelling) +
        (w["contact"] * contact)
    )

    return {
        "score": round(final * 100, 2),
        "matched": matched,
        "missing": missing,
        "suggestions": generate_suggestions(
            missing, quantify, missing_sections, misspell_samples, fmt, role, missing_contact
        ),
        "red_flags": red_flags,
        "subscores": {
            "semantic": round(sem * 100, 2),
            "keyword_coverage": round(coverage * 100, 2),
            "role_skill_coverage": round(role_cov * 100, 2),
            "quantified_impact": round(quantify * 100, 2),
            "sections": round(sections * 100, 2),
            "formatting": round(fmt * 100, 2),
            "spelling": round(spelling * 100, 2),
            "contact": round(contact * 100, 2),
            "role_detected": role,
            "confidence": confidence,
        },
    }

def generate_suggestions(missing, quantify, missing_sections, misspell_samples, fmt, role, missing_contact):
    suggestions = []

    if missing:
        suggestions.append(
            f"Add missing relevant skills or keywords such as: {', '.join(missing[:6])}"
        )

    if quantify < 0.5:
        suggestions.append("Add measurable achievements using numbers, percentages, or impact metrics.")

    if missing_sections:
        suggestions.append(
            f"Add or improve sections: {', '.join(missing_sections[:4])}."
        )

    if fmt < 0.6:
        suggestions.append("Use concise bullet points and keep resume length within 1-2 pages.")

    if misspell_samples:
        suggestions.append(
            f"Review possible spelling issues: {', '.join(misspell_samples[:6])}."
        )

    if missing_contact:
        suggestions.append(
            f"Add missing contact details: {', '.join(missing_contact)}."
        )

    suggestions.append(
        f"Focus on {role}-specific achievements and align your resume language with the job description."
    )

    suggestions.append(
        "Replace weak bullets like 'Responsible for' with impact statements such as "
        "'Delivered X resulting in Y% improvement.'"
    )

    suggestions.append("Align your resume language closely with the job description.")

    return suggestions
