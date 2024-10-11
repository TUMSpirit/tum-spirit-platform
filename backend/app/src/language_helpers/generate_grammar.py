import language_tool_python
from langdetect import detect
from collections import Counter

def detect_language(text: str):
    try:
        # Use langdetect to detect the language
        lang = detect(text)
        return lang
    except:
        # Return None if language cannot be detected
        return None

def average_sentence_length(text: str):
    # Split text into sentences and count words
    sentences = text.split('. ')
    word_counts = [len(sentence.split()) for sentence in sentences]
    return sum(word_counts) / len(sentences) if sentences else 0

def grammar_mistake_distribution(matches):
    categories = [
        match.rule["category"]["name"] 
        for match in matches 
        if hasattr(match, 'rule') and "category" in match.rule
    ]
    return dict(Counter(categories))

def generate_grammar(text: str):
    # Detect the language of the text
    language = detect_language(text)

    # Create a LanguageTool instance based on the detected language
    if language == 'en':
        tool = language_tool_python.LanguageToolPublicAPI('en-US')
    elif language == 'de':
        tool = language_tool_python.LanguageToolPublicAPI('de-DE')
    else:
        tool = language_tool_python.LanguageToolPublicAPI('en-US')

    # Check text for grammar issues
    matches = tool.check(text)
    corrected_text = language_tool_python.utils.correct(text, matches)

    # Handle distribution carefully
    try:
        mistake_distribution = grammar_mistake_distribution(matches)
    except Exception as e:
        print(f"Error processing mistake distribution: {e}")
        mistake_distribution = {}

    # Calculate average sentence length
    avg_sentence_len = average_sentence_length(text)

    return {
        "grammar_mistakes_count": len(matches),
        "mistake_distribution": mistake_distribution,
        "average_sentence_length": avg_sentence_len,
        "corrected_text": corrected_text
    }
