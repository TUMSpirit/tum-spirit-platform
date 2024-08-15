
#Import the modules
import text2emotion as te

def generate_emotion(text: str):
    text2emotion_result = te.get_emotion(text)

    return text2emotion_result
