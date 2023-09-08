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


print("SVM TF-IDF: \n")

"""
    We first read the all the data from 3 files each into its unique dataframe
    - More phishing actually contains legit and phishing emails
    - Small_datatset contains only phishing emails
    - enron emails is the dataset that we extracted from enron. Contains only legit emails
"""

"""
    Data preparation
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

"""
    The following variables are matrices that will help us calculate the 
    averages of the TN, FP, FN, TP across all iterations.
    
    The row "k" in these matrices is a vector corresponding to the (TN, FP, FN, TP) 
    in the k'th iteration of the model with the optimized metric.
    
    For example: The average of TN of the model that optimized the f2_score will 
    be the average of the first column in avg_f2_score.
"""

avg_accuracy = np.empty((0, 4))
avg_f1_score = np.empty((0, 4))
avg_f2_score = np.empty((0, 4))
avg_f1_2_score = np.empty((0, 4))

for i in range(100):
    # Sample 3600 legiteimate emails from the enron dataset
    legit_mails = legit_mails.sample(n=3600)
    # Data preparation
    data = pd.concat([small_dataset, legit_mails], ignore_index=True)
    data = data.dropna()
    data = pd.concat([data, more_phishing])

    # Perform text vectorization on the text column using TF-IDF vectorization
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(data["text"])

    # Split the dataset into training and testing sets. We use the stratify parameter maintain an identical
    # distribution in the test set and the training set similar
    X_train, X_test, y_train, y_test = train_test_split(X, data["label"], test_size=0.2, stratify=data['label'])

    print("optimizing accuracy")
    # Train an SVM on the data sample
    svm = SVC()
    svm.fit(X_train, y_train)

    # Make predictions on the testing data
    y_pred = svm.predict(X_test)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    avg_accuracy = np.vstack((avg_accuracy, np.array([tn, fp, fn, tp])))

    print("optimizing f1_score")
    beta = 1
    # Train an SVM on the same data sample - with the parameter probability = TRUE
    # since we need to find the best threshold
    svm = SVC(probability=True)
    svm.fit(X_train, y_train)

    # Obtain predicted probabilities for the positive class
    y_scores = svm.predict_proba(X_test)[:, 1]

    # Compute precision, recall and thresholds values
    precision, recall, thresholds = precision_recall_curve(y_test, y_scores)

    # Find the threshold that maximizes the F1 score
    f1_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
    best_threshold = thresholds[f1_scores.argmax()]

    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

    # Add the vector (TN, FP, FN, TP) as a row in avg_f1_score
    avg_f1_score = np.vstack((avg_f1_score, np.array([tn, fp, fn, tp])))

    """
        On the next stages we perform optimize another metric on the same model. Hence, we look 
        for thresholds that optimize a different metric but on the same model.
        That's why we don't need to train a new SVM.
    """

    print("optimizing f1_score beta = 2")
    beta = 2
    # Find the threshold that maximizes the F2 score
    f2_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
    best_threshold = thresholds[f2_scores.argmax()]

    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

    # Add the vector (TN, FP, FN, TP) as a row in avg_f2_score
    avg_f2_score = np.vstack((avg_f2_score, np.array([tn, fp, fn, tp])))

    print("optimizing f1_score beta = 1.2")
    beta = 1.2
    # Find the threshold that maximizes the F1 score
    f1_2_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
    best_threshold = thresholds[f1_2_scores.argmax()]

    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    # Add the vector (TN, FP, FN, TP) as a row in avg_f1_2_score
    avg_f1_2_score = np.vstack((avg_f1_2_score, np.array([tn, fp, fn, tp])))


"""
    Presenting the results:
    We will extract the averages of TN, FP, FN, FP.
    We then calculate the averages of the accuracy, precision, recall and f1 score 
    across the 100 iterations.
"""

print("Accuracy results: ")
df = pd.DataFrame(avg_accuracy, columns=['TN', 'FP', 'FN', 'TP'])
# Calculate the average of each column
column_averages = df.mean()
print(column_averages)
# Calculate the the metrics' averages
accuracy_avg = (column_averages["TP"] + column_averages["TN"])/(column_averages["TP"]+column_averages["TN"]+column_averages["FN"]+column_averages["FP"])
precision_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FP"])
recall_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FN"])
f1_avg = (2*precision_avg*recall_avg)/(precision_avg + recall_avg)
print("accuracy_avg: " + str(accuracy_avg))
print("precision_avg: " + str(precision_avg))
print("recall_avg: " + str(recall_avg))
print("f1_avg: " + str(f1_avg) + "\n")


print("F1_score results: ")
df = pd.DataFrame(avg_f1_score, columns=['TN', 'FP', 'FN', 'TP'])
# Calculate the average of each column
column_averages = df.mean()
print(column_averages)
# Calculate the the metrics' averages
accuracy_avg = (column_averages["TP"] + column_averages["TN"])/(column_averages["TP"]+column_averages["TN"]+column_averages["FN"]+column_averages["FP"])
precision_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FP"])
recall_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FN"])
f1_avg = (2*precision_avg*recall_avg)/(precision_avg + recall_avg)
print("accuracy_avg: " + str(accuracy_avg))
print("precision_avg: " + str(precision_avg))
print("recall_avg: " + str(recall_avg))
print("f1_avg: " + str(f1_avg) + "\n")

print("F2_score results: ")
df = pd.DataFrame(avg_f2_score, columns=['TN', 'FP', 'FN', 'TP'])
# Calculate the average of each column
column_averages = df.mean()
print(column_averages)
# Calculate the the metrics' averages
accuracy_avg = (column_averages["TP"] + column_averages["TN"])/(column_averages["TP"]+column_averages["TN"]+column_averages["FN"]+column_averages["FP"])
precision_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FP"])
recall_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FN"])
f1_avg = (2*precision_avg*recall_avg)/(precision_avg + recall_avg)
print("accuracy_avg: " + str(accuracy_avg))
print("precision_avg: " + str(precision_avg))
print("recall_avg: " + str(recall_avg))
print("f1_avg: " + str(f1_avg)+"\n")


print("F1_2_score results: ")
df = pd.DataFrame(avg_f1_2_score, columns=['TN', 'FP', 'FN', 'TP'])
# Calculate the average of each column
column_averages = df.mean()
print(column_averages)
accuracy_avg = (column_averages["TP"] + column_averages["TN"])/(column_averages["TP"]+column_averages["TN"]+column_averages["FN"]+column_averages["FP"])
precision_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FP"])
recall_avg = column_averages["TP"]/(column_averages["TP"]+column_averages["FN"])
f1_avg = (2*precision_avg*recall_avg)/(precision_avg + recall_avg)
print("accuracy_avg: " + str(accuracy_avg))
print("precision_avg: " + str(precision_avg))
print("recall_avg: " + str(recall_avg))
print("f1_avg: " + str(f1_avg) + "\n")


