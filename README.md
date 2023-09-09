
# <img src="Icons/ThePhishermen.png" width="100" height="113"> The Phishermen 

https://www.loom.com/share/6017c490be70460db05e1a118da7416f?sid=82c26196-e7ba-499a-b840-1fe7602588d5
## Table of Content
  * [Introduction](#introduction)
  * [Installation](#installation)
  * [Directory Tree](#directory-tree)

## Introduction
In today's rapidly evolving digital landscape, cyberattacks, particularly phishing, pose significant threats. Phishing, often executed through deceptive emails, exploits human vulnerabilities like lack of knowledge and attention.<br>

Usable security tools offer a solution by simplifying cybersecurity and alerting users on suspicious activities. Our Chrome extension addresses email phishing by analyzing content, links, grammar, sender information, and urgency, according to user preferences. When risks are detected, users are alerted through the utilization of machine learning models and Gmail API integration.  

## Installation
**Setting up the environment**
1. Clone the repository to your computer.<br>
2. Open terminal from the repository locaition on your computer and run: 
```
python app.py
```
<br>
3. Wait for the server to go up.<br>
4. Open terminal from the repository locaition on your computer and run

```
del __pycache__

```
for windows, or 

```
rm __pycache__s
```
for mac. 

**Load the extension to your browser [In any computer]**

5. Go to <a href="chrome://extensions/" target="_blank">chrome://extensions/</a> page.<br>
6. Enable Developer mode.<br>
7. Select "Load unpacked" and load the extenstion's folder.<br>
8. We recommend to pin the extension.

**Authorization with Google**

9. Click on the extension icon. <br>
10. Select the Gmail account you want to work with and log in if needed.<br>
11. Go to gmail to start the extension.<br>
12. Accept any incoming warnings comming from Google<br>
-  The extension is in the development stages, which is why you receive these warnings (it's not published)

**Start working with the extension**

13. Select your preferences and click "Save and Close".<br>
14. From now on, each unread email from your inbox will be examined by the extension, according to your preferences.<br>
15. Feel free to fit your preferences to your needs.<br>

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

