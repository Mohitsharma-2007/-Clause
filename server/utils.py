import io
import pdfplumber


def parse_pdf(data: bytes) -> str:
    """Extract text from a PDF file's bytes."""
    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            return text
    except Exception as e:
        return f"Error parsing PDF: {str(e)}"


def chunk_text(text: str, chunk_size: int = 2000) -> list[str]:
    """Split text into chunks for processing."""
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
