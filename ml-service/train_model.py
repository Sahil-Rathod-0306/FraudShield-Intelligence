from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score,
    roc_auc_score,
)


BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "PS_20174392719_1491204439457_log.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "fraud_model_v1.joblib"
)


print("Loading PaySim dataset...")


df = pd.read_csv(
    DATA_PATH,
    usecols=[
        "type",
        "amount",
        "isFraud",
    ],
    dtype={
        "type": "category",
        "amount": "float32",
        "isFraud": "int8",
    },
)


print("Dataset loaded")
print("Total rows:", len(df))

print("\nClass distribution:")
print(df["isFraud"].value_counts())


# ---------------------------------
# Separate fraud and legitimate data
# ---------------------------------

fraud_df = df[
    df["isFraud"] == 1
]

normal_df = df[
    df["isFraud"] == 0
]


print("\nFraud rows:", len(fraud_df))
print("Normal rows:", len(normal_df))


# ---------------------------------
# Development undersampling
#
# Keep ALL fraud records.
# Keep 20 normal records for every
# fraud record.
# ---------------------------------

normal_sample_size = min(
    len(normal_df),
    len(fraud_df) * 20,
)


normal_sample = normal_df.sample(
    n=normal_sample_size,
    random_state=42,
)


model_df = pd.concat(
    [
        fraud_df,
        normal_sample,
    ],
    ignore_index=True,
)


model_df = model_df.sample(
    frac=1,
    random_state=42,
).reset_index(drop=True)


print(
    "\nTraining dataset size:",
    len(model_df),
)

print(
    model_df["isFraud"].value_counts()
)


# ---------------------------------
# Features and target
# ---------------------------------

X = model_df[
    [
        "type",
        "amount",
    ]
]

y = model_df[
    "isFraud"
]


# ---------------------------------
# Train / Test Split
# ---------------------------------

X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )
)


print(
    "\nTraining rows:",
    len(X_train)
)

print(
    "Testing rows:",
    len(X_test)
)


# ---------------------------------
# Feature preprocessing
# ---------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "transaction_type",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            ["type"],
        ),
        (
            "amount",
            StandardScaler(),
            ["amount"],
        ),
    ]
)


# ---------------------------------
# Baseline ML Model
# ---------------------------------

classifier = LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    random_state=42,
)


model = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor,
        ),
        (
            "classifier",
            classifier,
        ),
    ]
)


print(
    "\nTraining Logistic Regression..."
)


model.fit(
    X_train,
    y_train,
)


print("Training complete")


# ---------------------------------
# Evaluation
# ---------------------------------

predictions = model.predict(
    X_test
)

probabilities = (
    model.predict_proba(
        X_test
    )[:, 1]
)


print(
    "\nClassification Report:"
)

print(
    classification_report(
        y_test,
        predictions,
        digits=4,
    )
)


print(
    "\nConfusion Matrix:"
)

print(
    confusion_matrix(
        y_test,
        predictions,
    )
)


roc_auc = roc_auc_score(
    y_test,
    probabilities,
)


pr_auc = average_precision_score(
    y_test,
    probabilities,
)


print(
    f"\nROC-AUC: {roc_auc:.4f}"
)

print(
    f"PR-AUC: {pr_auc:.4f}"
)


# ---------------------------------
# Save model
# ---------------------------------

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)


joblib.dump(
    model,
    MODEL_PATH,
)


print(
    f"\nModel saved to:"
    f"\n{MODEL_PATH}"
)