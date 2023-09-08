
# The Phishermen 
<img src="Icons/ThePhishermen.png" width="150" height="169">

https://www.loom.com/share/6017c490be70460db05e1a118da7416f?sid=82c26196-e7ba-499a-b840-1fe7602588d5
## Table of Content
  * [Introduction](#introduction)
  * [Installation](#installation)
  * [Directory Tree](#directory-tree)

## Introduction
In today's rapidly evolving digital landscape, cyberattacks, particularly phishing, pose significant threats. Phishing, often executed through deceptive emails, exploits human vulnerabilities like lack of knowledge and attention.
Usable security tools offer a solution by simplifying cybersecurity and alerting users to suspicious activities. Our Chrome extension addresses email phishing by analyzing content, links, grammar, sender information, and urgency according to user preferences. When risks are detected, users receive warnings, thanks to machine learning and Gmail API integration.
This proactive tool empowers users to make informed email choices, enhancing their online security.

## Installation
**Set up the server**
```
1. Add files from Repo into your google cloud server.
2. Open terminal from that location, and run sudo -E python3 app.py
3. Wait for the server to go up
* You can also run it locally, and change vars accordingly 
```
**Load the extension to your browser [In any computer]**
```
4. Write chrome://extensions/ in your URL in chrome
5. Enable Developer mode
6. Select "Load unpacked" and load the extenstion's folder
```
**Authorization with Google**
```
7. Click on the extension icon
8. Select the Gmail account you want to work with and log in if needed
9. Go to gmail for start the extension
10. Accept any incoming warnings comming from Google
```
**Start working with the extension**
```
11. Select your preferences and click "Save and Close"
12. From now on, each unread new email from your inbox will be examined
    by the extension, according to your preferences
13. Feel free to change your preferences to your needs
```
## Directory Tree
```
├── Icons
├── ML Creation
│   ├── Building the dataset
│   ├── ML Content
│   ├── ML Links
├── ML Models
│   ├── gradient_boosting_model.pkl
│   ├── reduce_gradient_boosting_model.pkl
│   ├── svm_model.pkl
├── PopUps
│   ├── Images
│   ├── PreferencesPopUp.html
│   ├── PreferencesPopUp.js
│   ├── PreferencesPopUp.html
│   ├── WarningPopUp.html
│   ├── WarningPopUp.js
├── App.py
├── Background.js
├── Content.js
├── Email.py
├── Feature.py
├── README.md
├── Manifest.json
```

