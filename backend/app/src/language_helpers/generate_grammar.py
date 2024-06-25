
#Import the modules
import language_tool_python
from langdetect import detect

def detect_language(text: str):
    try:
        # Verwende das langdetect-Modul, um die Sprache zu erkennen
        lang = detect(text)
        return lang
    except:
        # Falls die Sprache nicht erkannt wird, gib None zurück
        return None

def generate_grammar(text: str):
   #tool = language_tool_python.LanguageToolPublicAPI()
    #detected_language = tool.detect_language_of(text)
    #print(f"Detected language: {detected_language}")
    
    # Erstellen eines neuen LanguageTool-Objekts für die erkannte Sprache
    #tool = language_tool_python.LanguageTool(detected_language)

# Sprache des Textes erkennen
    language = detect_language(text)

# LanguageTool-Instanz basierend auf der erkannten Sprache erstellen
    if language == 'en':
        tool = language_tool_python.LanguageTool('en-US')
    elif language == 'de':
        tool = language_tool_python.LanguageTool('de-DE')
    else:
        tool = language_tool_python.LanguageTool('en-US')

    # Text prüfen und Korrekturen vorschlagen
    matches = tool.check(text)
    corrected_text = language_tool_python.utils.correct(text, matches)
    # return corrected_text?
    return len(matches)