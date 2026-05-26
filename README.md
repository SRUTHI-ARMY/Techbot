# TechBot — Machine Learning Spam Detection Engine

TechBot is an automated text-security assistant that intercepts user inputs, screens them for malicious intent or spam keywords, and issues immediate alerts. The project combines a statistical machine learning backend with a clean, responsive web interface.

## Technologies Used

### Backend & Machine Learning
* **Python:** Used as the core programming language for data processing and model execution.
* **Scikit-Learn (Sklearn):** Implements the **Multinomial Naive Bayes Classifier** for high-accuracy, text-based spam probability scoring.
* **NLTK / RegEx:** Utilized for text preprocessing, tokenization, and filtering out noise words before classification.

### Frontend Interface
* **HTML5:** Framework for building the structured user dashboard and input forms.
* **Vanilla JavaScript (ES6):** Handles asynchronous communication between the interface and the backend, dynamically rendering security warning elements without page reloads.
* **CSS3:** For a clean, modern UI featuring real-time visual alert animations.

---

## How the Machine Learning Works
The core intelligence relies on a **Naive Bayes Classifier**. Here is the mathematical foundation behind how the bot processes data:

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

Where:
* **$P(\text{Spam}|\text{Keywords})$:** The probability that a message is spam given the words it contains.
* **$P(\text{Keywords}|\text{Spam})$:** The likelihood that these specific spam keywords appear together based on historical training data.
* **$P(\text{Spam})$:** The overall prior probability of any message being spam.

The text is transformed into numerical vectors using a Bag-of-Words strategy, allowing the Naive Bayes algorithm to make split-second, highly efficient classification updates.
