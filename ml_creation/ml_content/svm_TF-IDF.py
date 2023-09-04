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


print("Support VM: \n")
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

avg_of_accuracy = np.empty((0,4))
avg_of_f1_score = np.empty((0,4))
avg_of_manipulated_f1_score = np.empty((0,4))
avg_of_manipulated_f1_score2 = np.empty((0,4))

for i in range(100):

    # Sample legit emails from dataset
    legit_mails = legit_mails.sample(n=10000)

    # Add in the phishing emails from another dataset
    data = pd.concat([small_dataset, legit_mails], ignore_index=True)

    # Add in the phishing emails from another dataset
    data = pd.concat([data, more_phishing])

    data = data.dropna()

    # Perform text vectorization on the text column using CountVectorizer
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(data["text"])

    # Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, data["label"], test_size=0.2)

    print("optimizing accuracy")
    svm = SVC()
    svm.fit(X_train, y_train)

    # Make predictions on the testing data
    y_pred = svm.predict(X_test)

    # Evaluate the accuracy of the model
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    avg_of_accuracy = np.vstack((avg_of_accuracy, np.array([tn, fp, fn, tp])))
    # table = pd.DataFrame({
    #     'True Positives': [tp],
    #     'False Positives': [fp],
    #     'True Negatives': [tn],
    #     'False Negatives': [fn]
    # })
    #
    # print("Accuracy:", accuracy)
    # print("Precision:", precision)
    # print("Recall:", recall)
    # print("F1 Score:", f1)
    # print("\nConfusion Matrix:")
    # print(table)

    print("optimizing f1_score")
    beta = 1
    # Train an SVM on the training data
    svm = SVC(probability=True)
    svm.fit(X_train, y_train)

    # Obtain predicted probabilities for the positive class
    y_scores = svm.predict_proba(X_test)[:, 1]

    # Compute precision and recall values
    precision, recall, thresholds = precision_recall_curve(y_test, y_scores)

    # Find the threshold that maximizes the F1 score
    f1_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
    best_threshold = thresholds[f1_scores.argmax()]

    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)

    # Evaluate the precision and recall of the model
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    avg_of_f1_score = np.vstack((avg_of_f1_score, np.array([tn, fp, fn, tp])))
    # table = pd.DataFrame({
    #     'True Positives': [tp],
    #     'False Positives': [fp],
    #     'True Negatives': [tn],
    #     'False Negatives': [fn]
    # })
    #
    # print("\nConfusion Matrix:")
    # print(table)

    print("optimizing f1_score beta = 2")
    beta = 2
    # Train an SVM on the training data
    svm = SVC(probability=True)
    svm.fit(X_train, y_train)

    # Obtain predicted probabilities for the positive class
    y_scores = svm.predict_proba(X_test)[:, 1]

    # Compute precision and recall values
    precision, recall, thresholds = precision_recall_curve(y_test, y_scores)

    # Find the threshold that maximizes the F1 score
    f1_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
    best_threshold = thresholds[f1_scores.argmax()]
    print(best_threshold)
    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)

    # Evaluate the precision and recall of the model
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    avg_of_manipulated_f1_score = np.vstack((avg_of_manipulated_f1_score, np.array([tn, fp, fn, tp])))
    model_info = {'svm_model': svm, 'vectorizer' : vectorizer, 'beta': beta, 'best_threshold':best_threshold}
    model_info_filename = 'svm_model.pkl'
    joblib.dump(model_info, model_info_filename)


    print("optimizing f1_score beta = 1.2")
    beta = 1.2
    # Train an SVM on the training data
    svm = SVC(probability=True)
    svm.fit(X_train, y_train)

    # Obtain predicted probabilities for the positive class
    y_scores = svm.predict_proba(X_test)[:, 1]

    # Compute precision and recall values
    precision, recall, thresholds = precision_recall_curve(y_test, y_scores)

    # Find the threshold that maximizes the F1 score
    f1_scores = ((1 + beta ** 2) * (precision * recall)) / ((beta ** 2) * precision + recall)
    best_threshold = thresholds[f1_scores.argmax()]

    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)

    # Evaluate the precision and recall of the model
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    avg_of_manipulated_f1_score2 = np.vstack((avg_of_manipulated_f1_score2, np.array([tn, fp, fn, tp])))

df = pd.DataFrame(avg_of_accuracy, columns=['TN', 'FP', 'FN', 'TP'])

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
print("f1_avg: " + str(f1_avg))


df = pd.DataFrame(avg_of_f1_score, columns=['TN', 'FP', 'FN', 'TP'])

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
print("f1_avg: " + str(f1_avg))


df = pd.DataFrame(avg_of_manipulated_f1_score, columns=['TN', 'FP', 'FN', 'TP'])
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
print("f1_avg: " + str(f1_avg))


df = pd.DataFrame(avg_of_manipulated_f1_score2, columns=['TN', 'FP', 'FN', 'TP'])
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
print("f1_avg: " + str(f1_avg))



