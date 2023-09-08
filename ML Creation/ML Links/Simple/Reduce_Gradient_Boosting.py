
# This code was created with ChatGPT

import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
# Load the dataset (assuming you have a CSV file with features and labels)
data = pd.read_csv("phishing2.csv")

# Separate features (X) and labels (y)
X = data.drop('class', axis=1)
y = data['class']

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Initialize the Gradient Boosting Classifier
gb_classifier = GradientBoostingClassifier()

# Train the classifier
gb_classifier.fit(X_train, y_train)

# Make predictions on the test set
y_pred = gb_classifier.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
confusion = confusion_matrix(y_test, y_pred)

print("Accuracy:", accuracy)

# Keep the model only if the accuracy is good 
# From debugging, it doesn't look like it gets much higher than that
if accuracy > 0.93:
    with open("reduce_gradient_boosting_model.pkl", "wb") as f:
        pickle.dump((gb_classifier), f)
print('\nAccuracy:', round(accuracy, 5))

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

table = pd.DataFrame({
    'TP': [tp],
    'FP': [fp],
    'TN': [tn],
    'FN': [fn]
})

# Loop over the rows of the DataFrame
for index, row in table.iterrows():
    # Print the row name and its values
    print(f"Phishing -> found phishing: {row['TP']}")
    print(f"Non-Phishing -> found phishing: {row['FP']}")
    print(f"Non-Phishing -> found non-phishing: {row['TN']}")
    print(f"Phishing -> found non-phishing: {row['FN']}")