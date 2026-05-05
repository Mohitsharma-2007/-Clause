"""
Violation Scanner Module
Uses Gemini to scan for compliance violations by evaluating rules against sample data.
"""
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SCAN_PROMPT = """You are a compliance violation detection AI. You are given a set of compliance rules and must generate realistic violation scenarios that could be detected by an automated scanning system.

For each rule, determine if a plausible violation could occur in a typical organization. If yes, generate a violation report.

Compliance Rules:
---
{rules_text}
---

For each violation found, output a JSON object with these fields:
- "rule_title": The title of the violated rule
- "entity": The organization/department/system where the violation was detected (use realistic names like "Engineering Dept / AWS S3", "HR Division / Employee Records", "Marketing / Google Drive")
- "description": A clear, specific description of the violation
- "reasoning": AI reasoning explaining how the violation was detected and why it matters
- "confidence": A confidence score from 60-99
- "severity": One of "Critical", "High", "Medium", or "Low"

Return ONLY a valid JSON array of violation objects. Generate 2-4 realistic violations. No markdown, no explanation.

Generate violation reports:"""


def scan_for_violations(rules: list[dict]) -> list[dict]:
    """
    Scan compliance rules and generate violation reports using Gemini.
    
    Args:
        rules: A list of compliance rule dictionaries.
    
    Returns:
        A list of violation dictionaries.
    """
    if not rules:
        return []

    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Format rules for the prompt
        rules_text = "\n".join(
            f"- [{r.get('severity', 'Medium')}] {r.get('title', 'Unknown')}: {r.get('description', '')}"
            for r in rules
        )

        prompt = SCAN_PROMPT.format(rules_text=rules_text)
        response = model.generate_content(prompt)

        # Parse the JSON response
        response_text = response.text.strip()

        # Clean up markdown code fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        violations = json.loads(response_text)

        # Validate each violation
        for v in violations:
            if v.get("severity") not in ("Critical", "High", "Medium", "Low"):
                v["severity"] = "Medium"
            if not isinstance(v.get("confidence"), int):
                v["confidence"] = 75
            v["confidence"] = max(0, min(100, v["confidence"]))
            v["status"] = "Pending"

        return violations

    except json.JSONDecodeError as e:
        print(f"Failed to parse Gemini scan response as JSON: {e}")
        return []
    except Exception as e:
        print(f"Violation scanning error: {e}")
        return []
