import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: Gemini API Key not found. Please set GEMINI_API_KEY or GOOGLE_API_KEY in .env")

# Initialize the client
client = genai.Client(api_key=GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        self.model_id = 'models/gemini-2.5-flash'  # Current v1beta supported model

    async def translate_text(self, text: str, target_language: str) -> str:
        prompt = f"""
        Translate the following medical text to {target_language}.
        Ensure the translation is accurate, preserves medical meaning, and is concise.
        
        Text: "{text}"
        
        Translation:
        """
        try:
            response = client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Translation error: {e}")
            return "Translation failed."

    async def generate_summary(self, conversation_text: str) -> str:
        prompt = f"""
        Generate a medical summary based on the following conversation.
        Format the summary with bullet points under these sections:
        - Symptoms
        - Diagnoses
        - Medications
        - Follow-up actions
        
        Do not hallucinate information. If a section has no information, state "None".
        
        Conversation:
        {conversation_text}
        """
        try:
            response = client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Summary generation error: {e}")
            return "Summary generation failed."

gemini_service = GeminiService()
