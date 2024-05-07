import pickle

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


class CustomUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        try:
            return super().find_class(__name__, name)
        except AttributeError:
            return super().find_class(module, name)

class Model():  # Note "Model" represents the Big 5 OCEAN Model. I can't rename as it seems to affect the pickled files
    def __init__(self):
        self.rfr = RandomForestRegressor(bootstrap=True,
                                         max_features='sqrt',
                                         min_samples_leaf=1,
                                         min_samples_split=2,
                                         n_estimators=200)
        self.rfc = RandomForestClassifier(
            max_features='sqrt', n_estimators=110)
        self.tfidf = TfidfVectorizer(
            stop_words='english', strip_accents='ascii')

    def fit(self, X, y, regression=True):
        X = self.tfidf.fit_transform(X)
        if regression:
            self.rfr = self.rfr.fit(X, y)
        else:
            self.rfc = self.rfc.fit(X, y)

    def predict(self, X, regression=True):
        X = self.tfidf.transform(X)
        if regression:
            return self.rfr.predict(X)
        else:
            return self.rfc.predict(X)

    def predict_proba(self, X, regression=False):
        X = self.tfidf.transform(X)
        if regression:
            raise ValueError('Cannot predict probabilites of a regression!')
        else:
            return self.rfc.predict_proba(X)

def generate_OCEAN(text_array):
    model = Model()
    models = {}
    models['openness'] = CustomUnpickler(
        open('/app/BigFiveModel/OPN_model.pkl', 'rb')).load()
    models['conscientiousness'] = CustomUnpickler(
        open('/app/BigFiveModel/CON_model.pkl', 'rb')).load()
    models['extraversion'] = CustomUnpickler(
        open('/app/BigFiveModel/CON_model.pkl', 'rb')).load()
    models['agreeableness'] = CustomUnpickler(
        open('/app/BigFiveModel/AGR_model.pkl', 'rb')).load()
    models['neuroticism'] = CustomUnpickler(
        open('/app/BigFiveModel/NEU_model.pkl', 'rb')).load()
    
    # analysis OCEAN
    predictions = {}
    trait_list = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']

    for trait in trait_list:
        pkl_model = models[trait]

        trait_scores = pkl_model.predict(text_array, regression=True).reshape(1, -1)

        predictions[trait] = {}

        predictions[trait]['predicton_s'] = trait_scores.flatten()[0]

        trait_categories = pkl_model.predict(text_array, regression=False)
        predictions[trait]['predicton_c'] = str(trait_categories[0])

        trait_categories_probs = pkl_model.predict_proba(text_array)
        predictions[trait]['predicton_c_probability'] = trait_categories_probs[:, 1][0]
        
    return predictions