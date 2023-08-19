from Email import Email
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import ssl
from feature import FeatureExtraction, ReducedFeatureExtraction
import numpy as np
import joblib
from happytransformer import HappyTextToText, TTSettings
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize
from transformers import pipeline
import warnings
warnings.filterwarnings('ignore')

# ML
import pickle

# Tokenize and preprocess the sentences
nltk.download("punkt")
nltk.download("stopwords")

stop_words = set(stopwords.words("english"))

pipe = pipeline(model="facebook/bart-large-mnli")


model_path = 'ml_models/svm_model.pkl'
# Load the model from the pickle file
with open(model_path, 'rb') as file:
    loaded_model_info = joblib.load(model_path)
    # Load the model from the pickle file
    loaded_svm = loaded_model_info['svm_model']
    vectorizer = loaded_model_info['vectorizer']
    best_threshold = loaded_model_info['best_threshold']
    beta = loaded_model_info['beta']
file.close()

model_path = 'ml_models/gradient_boosting_model.pkl'
reduced_model_path = 'ml_models/reduce_gradient_boosting_model.pkl'

# Load the model from the pickle file
with open(model_path, 'rb') as file:
    gbc = pickle.load(file)
file.close()
with open(reduced_model_path, 'rb') as file:
    rgbc = pickle.load(file)
file.close()

happy_tt = HappyTextToText("T5", "vennify/t5-base-grammar-correction")
args = TTSettings(num_beams=5, min_length=1)


app = Flask(__name__)
cors = CORS(app)


"""
 Received data and metadata of the email from the clinet,
 and perform an analysis to determine if the email is phishing    
"""
@app.route('/analyze', methods=['POST'])
def analyze():
    emailObj = Email.from_json(request.get_data())
    
    # Calculate the phishing prob based on the content
    msg = create_analyze_phishing(emailObj.preferences, emailObj.decoded_content, emailObj.counter_from_sender, emailObj.counter_from_domain, emailObj.links)          
    analysis_result = {'Answer': msg}

    return jsonify(analysis_result)

def analyze_phishing_content(content):
    #preprocessed_content = preprocess(content)  # Preprocess the question using your preprocessing steps
    vectorized_content = vectorizer.transform([content])  # Transform the question into a numerical representation

    y_scores = loaded_svm.predict_proba(vectorized_content)[:, 1]
   
    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)
    return y_pred
   
def analyze_phishing_links(links):

    bad_links = []
    for link in links:
        obj = FeatureExtraction(link)
        x = np.array(obj.getFeaturesList()).reshape(1,14) 
        y_pred =gbc.predict(x)[0]
        # 1 is phishing, 0 is non phishing
        if y_pred == 1:
            bad_links.append(link)
    return bad_links
       
def reduced_analyze_phishing_links(links):
    bad_links = []
    for link in links:
        obj = ReducedFeatureExtraction(link) 
        x = np.array(obj.getFeaturesList()).reshape(1,5) 
        y_pred =rgbc.predict(x)[0]
        # 1 is phishing, 0 is non phishing
        if y_pred == 1:
            bad_links.append(link)
    return bad_links

# Analyze the probability to be phishing
def create_analyze_phishing(preferences, content,counter_from_sender,counter_from_domain, links):

    if "LinksHigh" in preferences:
        bad_links = analyze_phishing_links(links)
    elif "LinksLow" in preferences:
        bad_links = reduced_analyze_phishing_links(links)
    else:
        bad_links = []

    if "Content" in preferences:
        predicted_label_content = analyze_phishing_content(content)
    else:
        predicted_label_content = 0
    
    if "Grammar" in preferences:
        grammar_score = analyze_grammer(content)
    else:
        grammar_score = 1.0

    if "Urgency" in preferences:
        urgency_score = analyze_urgency(content)
    else:
        urgency_score = 0.0

    # pc = phishing content
    # pl = phishing links
    # fts = first time sender email 
    # ftsd = first time sender domain 
    # bg = bad grammar 
    # cdg  = can't decide grammar
    # u = urgency
    res = [] 
    # We only care if it is the first time receving from sender / gotten phishing emails
    if counter_from_domain:
        res.append("ftsd")
    elif counter_from_sender: res.append("fts")
    if len(bad_links) > 0: res.append("pl")
    if len(content) > 2 and predicted_label_content == 1: res.append("pc")
    if len(content) > 2 and grammar_score == -1: res.append('cdg')
    # Higher grammar_score, means more similar to the valid text
    # If we are strict, we must allow only high scores
    elif len(content) > 2:
        if ("GrammarLow" in preferences) \
            and (grammar_score < 0.90): res.append('bg')
        if ("GrammarHigh" in preferences) \
            and (grammar_score < 0.95): res.append('bg')
    # Higher urgency_score, means more urgent
    # If we are strict, we count low scores as urgent too 
    if len(content) > 2:
        if ("UrgencyLow" in preferences) \
            and urgency_score > 0.95: res.append("u")
        if ("UrgencyHigh" in preferences) \
            and urgency_score > 0.90: res.append("u")
    print(res)
    return res 

# Token indices sequence length is longer than the specified 
# maximum sequence length for this model (4708 > 512)
# Therefor need to divide into sentences
def calculate_words_arr(content):
    # Replace semicolons with periods
    # sent_tokenize doesn't split with ;
    content = content.replace(';', '.')
    sentences = sent_tokenize(content)
    words = set()
    for idx, sentence in enumerate(sentences, start=1):
        if (len(sentence) > 512):
            return {}
        else:
            result = happy_tt.generate_text("grammar: " + sentence, args=args)        
            tmp_words1 = preprocess_sentence(result.text)
            words.update(tmp_words1)
    return words

# Done with chatGPT
# Don't care for commas
def analyze_grammer(content):
    
    # Extract the words
    preprocessed_words1 = calculate_words_arr(content)
    if preprocessed_words1 == {}:
        return -1
    preprocessed_words2 = preprocess_sentence(content)
    # Calculate Jaccard similarity, to find similarity
    intersection_val = len(preprocessed_words1.intersection(preprocessed_words2))
    union_val = len(preprocessed_words1.union(preprocessed_words2))
    if union_val == 0:
        return -1
    jaccard_similarity = intersection_val / union_val
    return jaccard_similarity


def preprocess_sentence(text):
    words = nltk.word_tokenize(text.lower())
    words = [word for word in words if word.isalnum() and word not in stop_words]
    return set(words)

def analyze_urgency(content):
    res= pipe(content,
    candidate_labels=["urgent"],
    )
    return res["scores"][0]



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
