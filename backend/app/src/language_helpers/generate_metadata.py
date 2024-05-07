
import textstat
from textblob import TextBlob

from .generate_OCEAN import generate_OCEAN
from .generate_MTBI import generate_MTBI


def generate_metadata(text: str):

    ocean_result = generate_OCEAN([text])

    mtbi_result = generate_MTBI(text)

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
        "flesh_reading_ease": reading_ease,
        "MTBI": mtbi_result,
        "OCEAN": ocean_result
    }

    return output_dict
