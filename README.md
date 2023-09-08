**Promotional Video**: 
https://www.loom.com/share/6017c490be70460db05e1a118da7416f?sid=732210a3-d96b-4502-ab43-eab3e2258e9e

**Instructions to run the extenstion**
# Set up the server
1. Add the files from https://github.com/hilalewin/phisherman/tree/master into your google cloud server.
2. Open terminal from that location, and run sudo -E python3 app.py
3. Wait for the server to go up.
* You can also run it locally, and change vars accordingly 

# Load the extension to your browser [In any computer]
4. Write chrome://extensions/ in your URL in chrome.
5. Enable Developer mode
6. Select "Load unpacked" and load the extenstion's folder
 
# Authorization with Google
7. Click on the extension icon
8. Select the Gmail account you want to work with and log in if needed.
9. Go to gmail for start the extension, accept the warnings comming from Google.

# Start working with the extension
10. You will be asked to select your preferences, select them and click "Save and Close".
11. From now, each unread new email from your inbox will be examined by the extension, according to your preferences.
12. Feel free to change your preferences to your needs.

**Directory Tree**
├── pickle
│   ├── model.pkl
├── static
│   ├── styles.css
├── templates
│   ├── index.html
├── Phishing URL Detection.ipynb
├── Procfile
├── README.md
├── app.py
├── feature.py
├── phishing.csv
├── requirements.txt



**Files Explanations**
The manifest.json outlines the chrome extenstion permissions, settings, and key components. It establishes a link between the extension and the browser. Our manifest version is 3.0.

The background.js manages the extension's authentication, user preferences, and overall functionality such as creating popups, while content.js handles the preparation for the analysis of email and interaction with web pages. These scripts work together to provide a Chrome extension for email analysis and warning popups.



Run the extension:
1. Add the files from https://github.com/hilalewin/phisherman/tree/master into your google cloud server.
2. Open terminal from that location, and run sudo -E python3 app.py
3. Wait for the server to go up.
4. [In any computer] Go to chrome://extensions/ and select "Load unpacked" the extenstion.
5. 