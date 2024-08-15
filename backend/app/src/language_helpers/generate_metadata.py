
import textstat
from textblob import TextBlob

from .generate_OCEAN import generate_OCEAN
from .generate_MTBI import generate_MTBI
from .generate_grammar import generate_grammar
from .generate_emotion import generate_emotion


def generate_metadata(text: str):

    ocean_result = generate_OCEAN([text])

    mtbi_result = generate_MTBI(text)

    grammar_result = generate_grammar(text)

    emotion_result = generate_emotion(text)

    # textstat reading ease
    reading_ease = textstat.flesch_reading_ease(text)

    # textblob sentiment analysis
    sentiment_result = TextBlob(text).sentiment

    sentiment_dict = {
        "polarity": sentiment_result.polarity,
        "subjectivity": sentiment_result.subjectivity
    }


    output_dict = {
        "sentiment": sentiment_dict,
        "emotion": emotion_result,
        "flesh_reading_ease": reading_ease,
        "grammar": grammar_result,
        "MTBI": mtbi_result,
        "OCEAN": ocean_result
    }

    return output_dict
