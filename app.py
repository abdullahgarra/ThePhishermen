from Email import Email
from flask import Flask, request, jsonify
from flask_cors import CORS
from feature import ExtendedFeatureExtraction, ReducedFeatureExtraction
import numpy as np
# pip install joblib==1.2.0
# pip install scikit-learn==1.0.1
import joblib
from happytransformer import HappyTextToText, TTSettings
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize
from transformers import pipeline
import pickle

import warnings
warnings.filterwarnings('ignore')


app = Flask(__name__)
cors = CORS(app)

"""
 Received data and metadata of the email from the client,
 and perform an analysis to determine if the email is phishing    
"""


@app.route('/analyze', methods=['POST'])
def analyze():
    email_obj = Email.from_json(request.get_data())
    # Calculate the phishing probability
    msg = create_analyze_phishing(email_obj.preferences, email_obj.decoded_content,
                                  email_obj.indicator_of_first_time_sender,
                                  email_obj.indicator_of_first_time_domain, email_obj.links)

    # Results back from create_analyze_phishing
    analysis_result = {'Answer': msg}
    return jsonify(analysis_result)


# Analyze the probability to be phishing
def create_analyze_phishing(preferences, content, indicator_of_first_time_sender,
                            indicator_of_first_time_domain, links):

    res = []

    # Domain case contains sender case
    # Indicator can be 1 or 0
    if indicator_of_first_time_domain:
        res.append("ftsd")
    elif indicator_of_first_time_sender:
        res.append("fts")

    # If the content of the email is empty
    if len(content) <= 2:
        return res

    # --------------- Content --------------- #

    if "Content" in preferences:
        predicted_label_content = analyze_phishing_content(content)
        if predicted_label_content == 1:
            res.append("pc")

    # --------------- Links --------------- #

    links_score = 0
    if "LinksHigh" in preferences:
        links_score = analyze_phishing_links(links, "extended")
    elif "LinksLow" in preferences:
        links_score = analyze_phishing_links(links, "simpler")
    if links_score == 1:
        res.append("pl")

    # ---------- Grammar/Spelling ---------- #

    if "Grammar" in preferences:
        grammar_score = analyze_grammar(content)
        # Can't calculate grammar_score
        if grammar_score == -1:
            res.append('cdg')
            # Higher grammar_score, means more similar to the valid text
        if ("GrammarLow" in preferences) \
                and (grammar_score < 0.90):
            res.append('bg')
        if ("GrammarHigh" in preferences) \
                and (grammar_score < 0.95):
            res.append('bg')

    # --------------- Urgency --------------- #
    if "Urgency" in preferences:
        urgency_score = analyze_urgency(content)
        if ("UrgencyLow" in preferences) \
                and urgency_score > 0.95:
            res.append("u")
        if ("UrgencyHigh" in preferences) \
                and urgency_score > 0.90:
            res.append("u")

    print(res)
    return res


# ---------------------------- Content ---------------------------- #

content_model_path = 'ml_models/svm_model.pkl'
# Load the model from the pickle file
with open(content_model_path, 'rb') as file:
    loaded_model_info = joblib.load(content_model_path)
    # Load the model from the pickle file
    loaded_svm = loaded_model_info['svm_model']
    vectorizer = loaded_model_info['vectorizer']
    best_threshold = loaded_model_info['best_threshold']
    beta = loaded_model_info['beta']
file.close()


def analyze_phishing_content(content):
    # Transform the content of the email into a numerical representation
    # based on the model we trained
    vectorized_content = vectorizer.transform([content])

    # Calculate the probability to pe phishing or not
    y_scores = loaded_svm.predict_proba(vectorized_content)[:, 1]

    # Apply the optimized threshold to make predictions
    return int(y_scores >= best_threshold)


# ---------------------------- Links ---------------------------- #

extended_model_path = 'ml_models/gradient_boosting_model.pkl'
reduced_model_path = 'ml_models/reduce_gradient_boosting_model.pkl'

# Load the model from the pickle file
with open(extended_model_path, 'rb') as file:
    gbc = pickle.load(file)
file.close()
with open(reduced_model_path, 'rb') as file:
    rgbc = pickle.load(file)
file.close()


# Returns 1 if a phishy link was found
# Otherwise, 0
def analyze_phishing_links(links, model_type):
    print(model_type)
    for link in links:
        if model_type == "simpler":
            obj = ReducedFeatureExtraction(link)
            x = np.array(obj.getFeaturesList()).reshape(1, 5)
            print(obj.getFeaturesList())
            y_prediction = rgbc.predict(x)[0]
        elif model_type == "extended":
            obj = ExtendedFeatureExtraction(link)
            print(obj.getFeaturesList())
            x = np.array(obj.getFeaturesList()).reshape(1, 14)
            y_prediction = gbc.predict(x)[0]
            print(gbc.predict(x))

        else:
            raise ValueError("Invalid type")
        print(y_prediction)
        print(link)
        # 1 is phishing, 0 is non phishing
        if y_prediction == 1:
            return 1
    return 0

# ---------------------------- Urgency ---------------------------- #


pipe = pipeline(model="facebook/bart-large-mnli")


# Calculate the urgent sense with zero-shot
def analyze_urgency(content):
    res = pipe(content,
               candidate_labels=["urgent"], )
    return res["scores"][0]


# --------------------- Grammar and Spelling --------------------- #


nltk.download("punkt")
nltk.download("stopwords")
stop_words = set(stopwords.words("english"))
happy_tt = HappyTextToText("T5", "vennify/t5-base-grammar-correction")
args = TTSettings(num_beams=5, min_length=1)


# Given a text, return the set of words
# that appeared in the sentence
# Not including stop words
def get_set_from_text(text):
    words = nltk.word_tokenize(text.lower())
    words = [word for word in words if word.isalnum() and word not in stop_words]
    return set(words)


# Create a valid version of the content
# then create the set of words that the version used
# Had to split into sentences because generate_text
# is restricted to 512 chars
def get_set_from_valid_content(content):
    # Replace semicolons with periods
    # sent_tokenize doesn't split a sentence because of ;
    content = content.replace(';', '.')
    sentences = sent_tokenize(content)
    words = set()

    # Iterate over sentences
    for idx, sentence in enumerate(sentences, start=1):
        if len(sentence) > 512:
            # Can't call generate_text
            return {}
        else:
            # Generate the valid version of the sentence from the content
            result = happy_tt.generate_text("grammar: " + sentence, args=args)
            # Get temporary set of words
            tmp_set = get_set_from_text(result.text)
            words.update(tmp_set)

    # Returns the combination of all tmp_sets
    return words


# Created with chatGPT
# Ignores commas
def analyze_grammar(content):
    # Extract the words into a set
    preprocessed_words1 = get_set_from_valid_content(content)
    preprocessed_words2 = get_set_from_text(content)

    if len(preprocessed_words1) == 0 or len(preprocessed_words2) == 0:
        return -1

    # Calculate Jaccard similarity, to find similarity
    intersection_val = len(preprocessed_words1.intersection(preprocessed_words2))
    union_val = len(preprocessed_words1.union(preprocessed_words2))

    # Similarity can't be calculated
    if union_val == 0:
        return -1

    return intersection_val / union_val


if __name__ == '__main__':
    """
    logging.basicConfig(level=logging.DEBUG)
    cert = '/etc/letsencrypt/live/vm.phishermen.xyz/cert.pem'
    key = '/etc/letsencrypt/live/vm.phishermen.xyz/privkey.pem'
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain(cert,key)

    app.run(host = '0.0.0.0', port=443, debug = True, ssl_context = context)
    """
    app.run()
