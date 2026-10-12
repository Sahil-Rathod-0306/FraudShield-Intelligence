from pathlib import Path
from time import perf_counter

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)

from xgboost import XGBClassifier


# =====================================================
# PATHS
# =====================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "PS_20174392719_1491204439457_log.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "fraud_model_v2.joblib"
)

METRICS_PATH = (
    BASE_DIR
    / "models"
    / "fraud_model_v2_metrics.csv"
)


# =====================================================
# LOAD DATA
# =====================================================

print("\nLoading PaySim dataset...")

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

print("Total rows:", len(df))

print("\nOriginal class distribution:")
print(df["isFraud"].value_counts())


# =====================================================
# SPLIT FRAUD / NORMAL
# =====================================================

fraud_df = df[
    df["isFraud"] == 1
]

normal_df = df[
    df["isFraud"] == 0
]

print(
    "\nFraud transactions:",
    len(fraud_df),
)

print(
    "Normal transactions:",
    len(normal_df),
)


# =====================================================
# DEVELOPMENT SAMPLING
#
# Keep every fraud transaction.
# Keep 20 normal transactions for
# every fraud transaction.
# =====================================================

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
).reset_index(
    drop=True
)

print("\nTraining dataset:")

print(
    model_df[
        "isFraud"
    ].value_counts()
)


# =====================================================
# FEATURES
# =====================================================

X = model_df[
    [
        "type",
        "amount",
    ]
]

y = model_df[
    "isFraud"
]


# =====================================================
# TRAIN / TEST SPLIT
# =====================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print(
    "\nTraining rows:",
    len(X_train),
)

print(
    "Testing rows:",
    len(X_test),
)


# =====================================================
# PREPROCESSOR
# =====================================================

def create_preprocessor():

    return ColumnTransformer(
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


# =====================================================
# MODELS
# =====================================================

models = {

    "Logistic Regression":
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42,
        ),

    "Random Forest":
        RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ),

    "XGBoost":
        XGBClassifier(
            n_estimators=250,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
        ),
}


# =====================================================
# RESULTS
# =====================================================

results = []

trained_models = {}


# =====================================================
# TRAIN EACH MODEL
# =====================================================

for model_name, classifier in models.items():

    print(
        "\n================================="
    )

    print(
        f"Training: {model_name}"
    )

    print(
        "================================="
    )


    # =================================================
    # CREATE PIPELINE
    # =================================================

    pipeline = Pipeline(
        steps=[

            (
                "preprocessor",
                create_preprocessor(),
            ),

            (
                "classifier",
                classifier,
            ),
        ]
    )


    # =================================================
    # TRAIN
    # =================================================

    train_start = perf_counter()

    pipeline.fit(
        X_train,
        y_train,
    )

    train_time = (
        perf_counter()
        - train_start
    )


    # =================================================
    # PREDICTION
    # =================================================

    predict_start = perf_counter()

    predictions = pipeline.predict(
        X_test
    )

    probabilities = pipeline.predict_proba(
        X_test
    )[:, 1]

    prediction_time = (
        perf_counter()
        - predict_start
    )


    # =================================================
    # METRICS
    # =================================================

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0,
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities,
    )

    pr_auc = average_precision_score(
        y_test,
        probabilities,
    )


    # =================================================
    # CONFUSION MATRIX
    # =================================================

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions,
    ).ravel()


    # =================================================
    # MODEL RESULT
    # =================================================

    result = {

        "model":
            model_name,

        "precision":
            round(
                precision,
                4
            ),

        "recall":
            round(
                recall,
                4
            ),

        "f1":
            round(
                f1,
                4
            ),

        "roc_auc":
            round(
                roc_auc,
                4
            ),

        "pr_auc":
            round(
                pr_auc,
                4
            ),

        "true_positive":
            int(tp),

        "false_positive":
            int(fp),

        "true_negative":
            int(tn),

        "false_negative":
            int(fn),

        "training_seconds":
            round(
                train_time,
                4
            ),

        "prediction_seconds":
            round(
                prediction_time,
                4
            ),
    }


    results.append(
        result
    )

    trained_models[
        model_name
    ] = pipeline


    # =================================================
    # PRINT RESULT
    # =================================================

    print(
        "\nResults:"
    )

    for key, value in result.items():

        print(
            f"{key}: {value}"
        )


# =====================================================
# CREATE RESULTS DATAFRAME
# =====================================================

results_df = pd.DataFrame(
    results
)


print(
    "\n\nMODEL COMPARISON"
)


print(
    results_df.to_string(
        index=False
    )
)


# =====================================================
# SELECT BEST MODEL
#
# Priority:
#
# 1. PR-AUC
# 2. F1
# 3. Recall
# =====================================================

results_df = results_df.sort_values(
    by=[
        "pr_auc",
        "f1",
        "recall",
    ],
    ascending=False,
)


best_result = results_df.iloc[0]


best_model_name = best_result[
    "model"
]


best_model = trained_models[
    best_model_name
]


# =====================================================
# PRINT BEST MODEL
# =====================================================

print(
    "\n================================="
)

print(
    "BEST MODEL"
)

print(
    "================================="
)

print(
    best_model_name
)

print(
    "\nPR-AUC:",
    best_result["pr_auc"],
)

print(
    "F1:",
    best_result["f1"],
)

print(
    "Recall:",
    best_result["recall"],
)


# =====================================================
# CREATE MODEL DIRECTORY
# =====================================================

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)


# =====================================================
# PREPARE EXPLAINABILITY INFORMATION
# =====================================================

best_preprocessor = (
    best_model.named_steps[
        "preprocessor"
    ]
)

best_classifier = (
    best_model.named_steps[
        "classifier"
    ]
)


feature_names = (
    best_preprocessor
    .get_feature_names_out()
    .tolist()
)


# Small background sample for SHAP
background_sample = (
    X_train
    .sample(
        n=min(
            200,
            len(X_train)
        ),
        random_state=42,
    )
)


background_transformed = (
    best_preprocessor.transform(
        background_sample
    )
)


# Convert sparse data when needed
if hasattr(
    background_transformed,
    "toarray"
):
    background_transformed = (
        background_transformed
        .toarray()
    )


# =====================================================
# SAVE MODEL PACKAGE
# =====================================================

joblib.dump(
    {
        "model":
            best_model,

        "modelName":
            best_model_name,

        "version":
            "fraud-model-v2",

        "metrics":
            best_result.to_dict(),

        "featureNames":
            feature_names,

        "shapBackground":
            background_transformed,
    },

    MODEL_PATH,
)

# =====================================================
# SAVE MODEL COMPARISON
# =====================================================

results_df.to_csv(
    METRICS_PATH,
    index=False,
)


# =====================================================
# FINAL OUTPUT
# =====================================================

print(
    "\nBest model saved:"
)

print(
    MODEL_PATH
)

print(
    "\nMetrics saved:"
)

print(
    METRICS_PATH
)