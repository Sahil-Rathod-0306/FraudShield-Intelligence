from pathlib import Path

import joblib
import pandas as pd
import shap
import numpy as np

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from explanation_utils import (
    humanize_feature
)

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "fraud_model_v2.joblib"
)


app = FastAPI(
    title="FraudShield ML Service",
    version="1.0.0",
)


# ---------------------------------
# Load Model
# ---------------------------------

if not MODEL_PATH.exists():
    raise RuntimeError(
        "ML model not found. "
        "Run train_model.py first."
    )


model_package = joblib.load(
    MODEL_PATH
)


model = model_package[
    "model"
]


MODEL_NAME = model_package[
    "modelName"
]


MODEL_VERSION = model_package[
    "version"
]


MODEL_METRICS = model_package[
    "metrics"
]
FEATURE_NAMES = model_package.get(
    "featureNames",
    []
)


SHAP_BACKGROUND = model_package.get(
    "shapBackground"
)


preprocessor = (
    model.named_steps[
        "preprocessor"
    ]
)


classifier = (
    model.named_steps[
        "classifier"
    ]
)



# =====================================================
# SHAP EXPLAINER
# =====================================================

try:

    if MODEL_NAME in [
        "Random Forest",
        "XGBoost",
    ]:

        shap_explainer = (
            shap.TreeExplainer(
                classifier
            )
        )

    elif MODEL_NAME == (
        "Logistic Regression"
    ):

        shap_explainer = (
            shap.LinearExplainer(
                classifier,
                SHAP_BACKGROUND,
            )
        )

    else:

        shap_explainer = None


except Exception as error:

    print(
        "SHAP initialization error:",
        error
    )

    shap_explainer = None
# ---------------------------------
# Request Model
# ---------------------------------

class FraudPredictionRequest(BaseModel):

    amount: float = Field(
        ge=0
    )

    transactionType: str


# ---------------------------------
# Type Mapping
# ---------------------------------

TRANSACTION_TYPE_MAP = {

    "PAYMENT": "PAYMENT",

    "TRANSFER": "TRANSFER",

    "WITHDRAWAL": "CASH_OUT",

    "DEPOSIT": "CASH_IN",

    "DEBIT": "DEBIT",
}


# ---------------------------------
# Health Endpoint
# ---------------------------------
@app.get("/health")
def health():

    return {

        "success": True,

        "service":
            "FraudShield ML",

        "status":
            "healthy",

        "modelVersion":
            MODEL_VERSION,

        "modelName":
            MODEL_NAME,
    }

# ---------------------------------
# Prediction Endpoint
# ---------------------------------
@app.post("/explain")
def explain_prediction(
    payload: FraudPredictionRequest
):

    if shap_explainer is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "SHAP explainer "
                "is not available"
            ),
        )


    fraudshield_type = (
        payload.transactionType
        .strip()
        .upper()
    )


    dataset_type = (
        TRANSACTION_TYPE_MAP.get(
            fraudshield_type
        )
    )


    if not dataset_type:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported "
                "transactionType"
            ),
        )


    input_data = pd.DataFrame(
        [
            {
                "type":
                    dataset_type,

                "amount":
                    payload.amount,
            }
        ]
    )


    # ---------------------------------
    # Normal model prediction
    # ---------------------------------

    probability = float(
        model.predict_proba(
            input_data
        )[0][1]
    )


    # ---------------------------------
    # Transform input
    # ---------------------------------

    transformed = (
        preprocessor.transform(
            input_data
        )
    )


    if hasattr(
        transformed,
        "toarray"
    ):
        transformed = (
            transformed.toarray()
        )


    # ---------------------------------
    # SHAP values
    # ---------------------------------

    shap_values = (
        shap_explainer(
            transformed
        )
    )


    values = (
        shap_values.values
    )


    # Different SHAP versions/models
    # can return slightly different
    # dimensions.

    if values.ndim == 3:

        # Binary classification:
        # take FRAUD class
        values = values[
            :,
            :,
            1
        ]


    contribution_values = (
        values[0]
    )


    # ---------------------------------
    # Build explanation
    # ---------------------------------

    explanations = []


    for (
        feature_name,
        feature_value,
        shap_value,
    ) in zip(
        FEATURE_NAMES,
        transformed[0],
        contribution_values,
    ):

        explanations.append(
            {
               "feature":
    humanize_feature(
        str(feature_name)
    ),

                "value":
                    float(
                        feature_value
                    ),

                "contribution":
                    float(
                        shap_value
                    ),
            }
        )


    explanations.sort(
        key=lambda item:
            abs(
                item[
                    "contribution"
                ]
            ),
        reverse=True,
    )


    return {

        "success":
            True,

        "modelVersion":
            MODEL_VERSION,

        "modelName":
            MODEL_NAME,

        "prediction":
            (
                "FRAUD"
                if probability >= 0.50
                else "LEGITIMATE"
            ),

        "fraudProbability":
            round(
                probability,
                4
            ),

        "mlRisk":
            round(
                probability * 100
            ),

        "explanation":
            explanations[:10],
    }

    return {

        "success": True,

      "modelVersion":
    MODEL_VERSION,

"modelName":
    MODEL_NAME,

        "prediction":
            prediction,

        "fraudProbability":
            round(
                probability,
                4
            ),

        "mlRisk":
            ml_risk,
    }