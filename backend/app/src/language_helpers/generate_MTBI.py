import pickle

import numpy as np
from nltk.collocations import *
from nltk.tokenize import RegexpTokenizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression


import nltk
nltk.download('punkt')


class CustomUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        try:
            return super().find_class(__name__, name)
        except AttributeError:
            return super().find_class(module, name)

dummy_fn = lambda x:x

def generate_MTBI(text):
    

    cv = CustomUnpickler(open('/app/MTBIModel/cv.pickle', 'rb')).load()

    idf_transformer = CustomUnpickler(
        open('/app/MTBIModel/idf_transformer.pickle', 'rb')).load()

    lr_ie = CustomUnpickler(
        open('/app/MTBIModel/LR_clf_IE_kaggle.pickle', 'rb')).load()
    lr_jp = CustomUnpickler(
        open('/app/MTBIModel/LR_clf_JP_kaggle.pickle', 'rb')).load()
    lr_ns = CustomUnpickler(
        open('/app/MTBIModel/LR_clf_NS_kaggle.pickle', 'rb')).load()
    lr_tf = CustomUnpickler(
        open('/app/MTBIModel/LR_clf_TF_kaggle.pickle', 'rb')).load()

    # render

    c = cv.transform(word_tokenize(text))
    x = idf_transformer.transform(c)

    ie = lr_ie.predict_proba(x).flatten()
    ns = lr_ns.predict_proba(x).flatten()
    tf = lr_tf.predict_proba(x).flatten()
    jp = lr_jp.predict_proba(x).flatten()

    probs = np.vstack([ie, ns, tf, jp])

    #         names = ["Introversion - Extroversion", "Intuiting - Sensing", "Thinking - Feeling", "Judging - Perceiving"]
    #         for i, dim in enumerate(names):
    #             print(f"{dim:28s}: {probs[i,1]:.3f} - {probs[i, 0]:.3f}")

    Extraversion = probs[0][0]
    Introversion = probs[0][1]
    Sensing = probs[1][0]
    Intuiting = probs[1][1]
    Feeling = probs[2][0]
    Thinking = probs[2][1]
    Perceiving = probs[3][0]
    Judging = probs[3][1]

    if Introversion >= 0.5:
        IE = "I"
    else:
        IE = "E"
    if Intuiting >= 0.5:
        NS = "N"
    else:
        NS = "S"
    if Thinking >= 0.5:
        TF = "T"
    else:
        TF = "F"
    if Judging >= 0.5:
        JP = "J"
    else:
        JP = "P"

    return {
        "result": IE+NS+TF+JP, 
        "introversion": Introversion,
        "intuiting": Intuiting,
        "thinking": Thinking,
        "judging": Judging,
        "extraversion": Extraversion,
        "sensing": Sensing,
        "feeling": Feeling,
        "perceiving": Perceiving,
    }