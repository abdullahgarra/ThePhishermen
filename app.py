from Email import Email
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import ssl
from feature import FeatureExtraction
import numpy as np
import warnings


# ML
import pickle

# Specify the path to the pickle file containing the trained model
model_path = 'naive_bayes_model.pkl'


# Load the model from the pickle file
with open(model_path, 'rb') as file:
    loaded_model = pickle.load(file)
    vectorizer = loaded_model[1]
    model = loaded_model[0]
file.close()


model_path = 'model_links.pkl'

# Load the model from the pickle file
with open(model_path, 'rb') as file:
    gbc = pickle.load(file)
file.close()


app = Flask(__name__)
cors = CORS(app)


"""
 Received data and metadata of the email from the clinet,
 and perform an analysis to determine if the email is phishing    
"""
@app.route('/analyze', methods=['POST'])
def analyze():

    
    emailObj = Email.from_json(request.get_data())
    # Get the fields from the json
    """
    print("Sender Email: " , emailObj.sender_email)
    print("Time: " , emailObj.time)
    print("Subject: " , emailObj.subject)
    print("Content: " , emailObj.content)
    print("Decoded Content: ", emailObj.decoded_content)
    print("Links: " , emailObj.links)
    """
    
    #analysis_result = {'Answer': emailObj.decoded_content}
    #print(emailObj.counter_from_sender)
    #return jsonify(analysis_result)

    # Calculate the phishing prob based on the content
    msg = create_analyze_phishing(emailObj.decoded_content, emailObj.counter_from_sender, emailObj.links)        
    
    analysis_result = {'Answer': msg}
    # print("\n\n" +emailObj.decoded_content)
    #{'Decoded content': emailObj.decoded_content}

    return jsonify(analysis_result)

def analyze_phishing_content(content):
    #preprocessed_content = preprocess(content)  # Preprocess the question using your preprocessing steps
    vectorized_content = vectorizer.transform([content])  # Transform the question into a numerical representation

    # Classify the question
    predicted_label = model.predict(vectorized_content)[0]  # Get the predicted class label
    probability_scores = model.predict_proba(vectorized_content)[0]  # Get the probability scores for each class

    # Print the predicted label and probability scores
    #print("Predicted Label:", predicted_label)
    ##print("Probability Scores:", probability_scores)
    return predicted_label

def analyze_phishing_links(links):

    bad_links = []
    for link in links:
        obj = FeatureExtraction(link)
        x = np.array(obj.getFeaturesList()).reshape(1,30) 
        y_pred =gbc.predict(x)[0]
        # -1 is phishing, 1 is non phishing
        if y_pred == -1:
            bad_links.append(link)
    return bad_links
       


# Analyze the probability to be phishing
def create_analyze_phishing(content,counter_from_sender, links):


    bad_links = analyze_phishing_links(links)

    predicted_label_content = analyze_phishing_content(content)

    msg = ""
    if predicted_label_content == 1:
        msg = "Warning: The content of this email raises suspicion of phishing. \n"
    
    if counter_from_sender == 1:
        msg += "Warning: This is the first time you have received an email from this sender.\n"

    if len(bad_links) > 0:
        msg +=  "Warning: This email contains links that are identified as phishing.\n For example: " 
        for link in bad_links:
            msg += str(link) + " "

    if msg == "":
        msg = "Great news! This email has been thoroughly checked, and we're happy to inform you that it appears to be safe and free from any phishing attempts."

    return msg


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
