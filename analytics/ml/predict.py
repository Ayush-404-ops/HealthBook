"""
analytics/ml/predict.py
Inference module for appointment no-show and late-cancellation probability scoring.
Validates input payload and produces prediction using the trained scikit-learn pipeline.

This is a decision-support demo, not medical advice.
"""
from pathlib import Path
import joblib
import pandas as pd
from typing import Dict, Any, Tuple

ARTIFACT_PATH = Path(__file__).resolve().parent / 'artifacts' / 'noshow_model.joblib'
_MODEL_CACHE = None

VALID_WEEKDAYS = {'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'}


def get_model(artifact_path: Path = None):
    """Loads and caches the serialized model pipeline."""
    global _MODEL_CACHE
    path = artifact_path or ARTIFACT_PATH
    if _MODEL_CACHE is None:
        if not path.exists():
            # If not yet trained, train on the fly to produce artifact
            from .train import train_noshow_pipeline
            _, pipeline = train_noshow_pipeline(save_artifacts=True)
            _MODEL_CACHE = pipeline
        else:
            _MODEL_CACHE = joblib.load(path)
    return _MODEL_CACHE


def validate_and_parse_input(data: Dict[str, Any]) -> Tuple[pd.DataFrame, str]:
    """
    Validates input features for no-show risk assessment.
    Returns (DataFrame, "") if valid, or (None, error_msg) if invalid.
    """
    if not isinstance(data, dict):
        return None, "Input payload must be a JSON object."

    # 1. Weekday validation
    weekday = data.get('weekday')
    if not weekday or not isinstance(weekday, str):
        return None, "Field 'weekday' is required and must be a valid day name (e.g., 'Monday')."
    weekday_title = weekday.strip().capitalize()
    if weekday_title not in VALID_WEEKDAYS:
        return None, f"Invalid 'weekday' value '{weekday}'. Must be one of: {sorted(list(VALID_WEEKDAYS))}."

    # 2. Hour validation (0-23)
    try:
        hour = int(data.get('hour', -1))
        if not (0 <= hour <= 23):
            return None, "Field 'hour' must be an integer between 0 and 23."
    except (ValueError, TypeError):
        return None, "Field 'hour' must be a valid integer."

    # 3. Lead time in days (>= 0)
    try:
        lead_time_days = float(data.get('lead_time_days', -1))
        if lead_time_days < 0:
            return None, "Field 'lead_time_days' must be a non-negative number."
    except (ValueError, TypeError):
        return None, "Field 'lead_time_days' must be a valid number."

    # 4. Fee (>= 0)
    try:
        fee = float(data.get('fee', -1))
        if fee < 0:
            return None, "Field 'fee' must be a non-negative number."
    except (ValueError, TypeError):
        return None, "Field 'fee' must be a valid number."

    # 5. Specialization
    specialization = data.get('specialization')
    if not specialization or not isinstance(specialization, str) or not specialization.strip():
        return None, "Field 'specialization' is required and must be a non-empty string."
    specialization = specialization.strip()

    # 6. Patient previous cancellations (>= 0)
    try:
        patient_prev_cancellations = int(data.get('patient_prev_cancellations', 0))
        if patient_prev_cancellations < 0:
            return None, "Field 'patient_prev_cancellations' must be >= 0."
    except (ValueError, TypeError):
        return None, "Field 'patient_prev_cancellations' must be an integer."

    # 7. Rescheduled count (>= 0)
    try:
        rescheduled_count = int(data.get('rescheduled_count', 0))
        if rescheduled_count < 0:
            return None, "Field 'rescheduled_count' must be >= 0."
    except (ValueError, TypeError):
        return None, "Field 'rescheduled_count' must be an integer."

    row = {
        'weekday': weekday_title,
        'hour': hour,
        'lead_time_days': lead_time_days,
        'fee': fee,
        'specialization': specialization,
        'patient_prev_cancellations': patient_prev_cancellations,
        'rescheduled_count': rescheduled_count,
    }

    return pd.DataFrame([row]), ""


def predict_noshow_probability(data: Dict[str, Any], model=None) -> Dict[str, Any]:
    """
    Scores intake features and returns predicted no-show / cancellation probability.
    Raises ValueError on invalid input.
    """
    input_df, error_msg = validate_and_parse_input(data)
    if error_msg:
        raise ValueError(error_msg)

    pipeline = model or get_model()
    # Probability of positive class (index 1 = no-show / cancellation)
    prob = float(pipeline.predict_proba(input_df)[0, 1])

    if prob >= 0.50:
        risk_level = "High"
    elif prob >= 0.30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        'probability': round(prob, 4),
        'risk_level': risk_level,
        'disclaimer': 'Decision-support demonstration only; not clinical or medical advice.'
    }
