from datetime import datetime

class ParameterResult():
    predicton_s: bool
    predicton_c: float
    predicton_c_probability: float


class OCEANResult():
    openness: ParameterResult
    conscientiousness: ParameterResult
    extraversion: ParameterResult
    agreeableness: ParameterResult
    neuroticism: ParameterResult