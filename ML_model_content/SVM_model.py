import joblib
from sklearn.metrics import precision_score, recall_score, confusion_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
import sys


def calculate_phishing(input):
    # Load the saved model and threshold information from the file
    model_info_filename = 'svm_model.pkl'
    loaded_model_info = joblib.load(model_info_filename)

    # Extract the loaded SVM model, threshold, and other information
    loaded_svm = loaded_model_info['svm_model']
    vectorizer = loaded_model_info['vectorizer']
    best_threshold = loaded_model_info['best_threshold']
    beta = loaded_model_info['beta']
    # Now you can use the loaded model and threshold to make predictions on new data
    #input = 'To finish setting up this Google account. Verify hilalewin98@gmail.com Or you may be asked to enter this security code: 4071 If you didnt make this request, click here to cancel. Thanks, The Google account team'
    input = vectorizer.transform([input])
    y_scores = loaded_svm.predict_proba(input)[:, 1]

    # Apply the optimized threshold to make predictions
    y_pred = (y_scores >= best_threshold).astype(int)
    print(y_pred)

if __name__ == '__main__':
    calculate_phishing(sys.argv[1])


