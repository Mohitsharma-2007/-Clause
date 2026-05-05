"""
Rule Extractor Module
Uses Gemini to extract structured compliance rules from policy document text.
"""
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

EXTRACTION_PROMPT = """You are a compliance rule extraction engine. Analyze the following policy document text and extract all actionable compliance rules.

For each rule, output a JSON object with these fields:
- "title": A short, clear title for the rule (max 80 chars)
- "description": A detailed description of what the rule mandates
- "severity": One of "Critical", "High", "Medium", or "Low" based on the rule's importance

Return ONLY a valid JSON array of rule objects. No markdown, no explanation.

Example output:
[
  {{"title": "Data Retention Limit", "description": "Personal data must not be retained for more than 24 months after account closure.", "severity": "High"}},
  {{"title": "Access Logging Required", "description": "All access to customer PII must be logged with timestamps and user identity.", "severity": "Critical"}}
]

Policy Document Text:
---
{text}
---

Extract all compliance rules as JSON:"""


def extract_rules(document_text: str, source_document: str = "Unknown") -> list[dict]:
    """
    Extract structured compliance rules from document text using Gemini.
    
    Args:
        document_text: The raw text extracted from a policy PDF.
        source_document: The filename/identifier of the source document.
    
    Returns:
        A list of rule dictionaries with title, description, severity, source_document.
    """
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-2.5-flash')

        # If text is very long, process in chunks
        max_chars = 15000
        text_to_process = document_text[:max_chars] if len(document_text) > max_chars else document_text

        prompt = EXTRACTION_PROMPT.format(text=text_to_process)
        response = model.generate_content(prompt)

        # Parse the JSON response
        response_text = response.text.strip()

        # Clean up markdown code fences if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])

        rules = json.loads(response_text)
        
        # Handle dict response with 'rules' key
        if isinstance(rules, dict) and "rules" in rules:
            rules = rules["rules"]
        
        if not isinstance(rules, list):
            print(f"Unexpected rules format: {type(rules)}")
            return []

        # Add source_document to each rule
        for rule in rules:
            if not isinstance(rule, dict):
                continue
            rule["source_document"] = source_document
            # Validate severity
            if rule.get("severity") not in ("Critical", "High", "Medium", "Low"):
                rule["severity"] = "Medium"

        return rules

    except json.JSONDecodeError as e:
        print(f"Failed to parse Gemini response as JSON: {e}")
        return []
    except Exception as e:
        print(f"Rule extraction error: {e}")
        return []
