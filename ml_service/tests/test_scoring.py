import json
import os
from scorer import final_score, detect_role


def test_detect_role_software():
    jd = "We are hiring a backend software engineer with experience in APIs and microservices."
    assert detect_role(jd) == "software"


def test_detect_role_marketing():
    jd = "Looking for a marketing specialist focused on SEO, content, and campaigns."
    assert detect_role(jd) == "marketing"


def test_score_in_range():
    resume = """
    John Doe
    john@example.com | +1 (555) 555-5555
    Summary: Software engineer with experience in Python, Node, and AWS.
    Experience:
    - Built REST APIs in Python and deployed on AWS.
    - Improved latency by 25% using caching.
    Skills: Python, JavaScript, Node, AWS, Docker
    Education: B.S. Computer Science
    """
    jd = """
    We are hiring a backend engineer. Requirements: Python, REST APIs, AWS, Docker.
    Responsibilities include building microservices and improving performance.
    """
    result = final_score(resume, jd)
    assert 0 <= result["score"] <= 100
    assert result["subscores"]["semantic"] >= 40
    assert result["subscores"]["keyword_coverage"] >= 40
    assert result["subscores"]["role_detected"] == "software"


def test_nsfw_blocking():
    resume = "Experienced engineer. porn"
    jd = "Backend engineer role."
    result = final_score(resume, jd)
    assert result["score"] == 0
    assert result["red_flags"]


def test_snapshot_case_software():
    base = os.path.dirname(os.path.abspath(__file__))
    fixture_path = os.path.join(base, "fixtures", "case_software.json")
    snapshot_path = os.path.join(base, "snapshots", "case_software.json")

    with open(fixture_path, "r", encoding="utf-8") as f:
        fixture = json.load(f)
    with open(snapshot_path, "r", encoding="utf-8") as f:
        snapshot = json.load(f)

    result = final_score(fixture["resume"], fixture["job_description"])
    expected = snapshot["expected"]

    assert expected["score"][0] <= result["score"] <= expected["score"][1]
    for k, rng in expected["subscores"].items():
        if k == "role_detected":
            continue
        assert rng[0] <= result["subscores"][k] <= rng[1]
    assert result["subscores"]["role_detected"] == expected["role_detected"]
