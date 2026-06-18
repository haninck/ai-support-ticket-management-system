import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# Read dataset
df = pd.read_csv("ticket.csv")

# Input tickets
X = df["Ticket"]

# Output categories
y = df["Category"]

# Priority labels
y_priority = df["Priority"]

# Convert text to word counts
vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1,2)
)

X_vectorized = vectorizer.fit_transform(X)

# Create model
model = MultinomialNB()

# Train model
model.fit(X_vectorized, y)

# Save model
joblib.dump(model, "ticket_model.pkl")

# Save vectorizer
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model trained successfully")