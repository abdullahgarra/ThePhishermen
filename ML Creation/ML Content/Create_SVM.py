import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.metrics import precision_score
from sklearn.metrics import recall_score
from sklearn.metrics import f1_score
from sklearn.metrics import confusion_matrix
from sklearn.metrics import precision_recall_curve
from sklearn.metrics import average_precision_score
import matplotlib.pyplot as plt

"""
    Prepare the dataset.
"""
more_phishing = pd.read_excel("gptPhishing_dataset.xlsx")
more_phishing.to_csv("gptPhishing_dataset.csv", index=None, header=True)
more_phishing = more_phishing.dropna()

small_dataset = pd.read_csv("curated_set_improved.csv")
small_dataset = small_dataset[["text", "label"]]

legit_mails = pd.read_csv("enron_emails_filtered.csv")
legit_mails = legit_mails[['Email body', 'Phishing']]
legit_mails = legit_mails[legit_mails['Phishing'] == '0']
legit_mails = legit_mails.rename(columns={'Email body': 'text', 'Phishing': 'label'})
legit_mails['label'] = legit_mails['label'].astype(int)
legit_mails = legit_mails.sample(n=10000)
data = pd.concat([small_dataset, legit_mails], ignore_index=True)
data = data.dropna()
data = pd.concat([data, more_phishing])

# Perform text vectorization on the text column using TF-IDF vectorization
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(data["text"])

"""
    Split the dataset into training and testing sets.
    We use stratify to maintain an identical distribution of data in the test and training sets.
"""
X_train, X_test, y_train, y_test = train_test_split(X, data["label"], test_size=0.2, stratify=data['label'])
beta = 2
svm = SVC(probability=True)
svm.fit(X_train, y_train)
# Obtain predicted probabilities for the positive class
y_scores = svm.predict_proba(X_test)[:, 1]

# Compute precision, recall and thresholds values
precision, recall, thresholds = precision_recall_curve(y_test, y_scores)

# Find the threshold that maximizes the F2 score
f2_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
best_threshold = thresholds[f2_scores.argmax()]

model_info = {'svm_model': svm, 'vectorizer' : vectorizer, 'beta': beta, 'best_threshold':best_threshold}
model_info_filename = 'svm_model.pkl'
joblib.dump(model_info, model_info_filename)
