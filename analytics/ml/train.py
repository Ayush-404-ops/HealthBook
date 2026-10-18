"""
analytics/ml/train.py
Trains machine learning models (LogisticRegression baseline vs. RandomForestClassifier)
to predict the probability of appointment no-shows or late cancellations.

Data Leakage Prevention:
------------------------
Features must ONLY include variables available at the time of appointment scheduling.
Post-appointment variables are strictly excluded:
- `status`: Ground truth target; excluded from features.
- `cancelled_at`: Only recorded after cancellation occurs.
- `payment_status` / payment completion timestamps: Finalized during or after consultation.
- Doctor notes, prescriptions, and reviews: Generated during/after consultation.

Class Imbalance:
----------------
No-shows and cancellations constitute a minority class (~20%).
Models use `class_weight='balanced'` and evaluation prioritizes ROC-AUC, Recall, and F1.
"""
import os
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix
)

# Deterministic random seed
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = ML_DIR / 'artifacts'


def load_dataset(csv_fallback_path=None):
    """
    Loads appointment data from Django ORM database or falls back to exported CSV.
    """
    df = None
    try:
        if str(BASE_DIR) not in sys.path:
            sys.path.insert(0, str(BASE_DIR))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        import django
        django.setup()
        from reports.models import AppointmentFact

        queryset = AppointmentFact.objects.select_related('doctor').all().values(
            'mongo_id', 'doctor__specialization', 'patient_hash',
            'date', 'start_time', 'status', 'fee', 'created_at',
            'rescheduled_count'
        )
        records = list(queryset)
        if records:
            df = pd.DataFrame(records)
            df = df.rename(columns={'doctor__specialization': 'specialization'})
            print(f"[Data] Loaded {len(df)} records from Django ORM database.")
    except Exception as e:
        print(f"[Data] Django ORM load note ({e}). Trying CSV fallback...")

    if df is None or df.empty:
        csv_file = csv_fallback_path or (BASE_DIR / 'notebooks' / 'appointments.csv')
        if not Path(csv_file).exists():
            csv_file = ML_DIR.parent / 'notebooks' / 'appointments.csv'
        df = pd.read_csv(csv_file)
        if 'doctor_specialization' in df.columns:
            df = df.rename(columns={'doctor_specialization': 'specialization'})
        print(f"[Data] Loaded {len(df)} records from CSV fallback: {csv_file}")

    return df


def prepare_features(df):
    """
    Cleans and engineers intake features while strictly preventing data leakage.
    """
    df = df.copy()

    # 1. Parse dates and timestamps
    df['date'] = pd.to_datetime(df['date'])
    df['created_at'] = pd.to_datetime(df['created_at'], format='ISO8601', utc=True)

    # 2. Extract scheduled hour
    def extract_hour(val):
        if hasattr(val, 'hour'):
            return val.hour
        return int(str(val).split(':')[0])

    df['hour'] = df['start_time'].apply(extract_hour)

    # 3. Day of week
    df['weekday'] = df['date'].dt.day_name()

    # 4. Lead time in days (advance booking window)
    created_date = pd.to_datetime(df['created_at'].dt.date)
    df['lead_time_days'] = (df['date'] - created_date).dt.days.clip(lower=0)

    # 5. Numerical fee and reschedule count
    df['fee'] = df['fee'].astype(float)
    df['rescheduled_count'] = df['rescheduled_count'].fillna(0).astype(int)

    # 6. Patient historical cancellation count (temporal, leakage-free)
    # Sort chronologically so we only count cancellations that occurred BEFORE this appointment
    df = df.sort_values(by=['created_at', 'date']).reset_index(drop=True)
    is_canc = df['status'].isin(['cancelled', 'no-show']).astype(int)
    # Shift by 1 within patient group so current appointment's outcome is NOT counted
    df['patient_prev_cancellations'] = (
        df.groupby('patient_hash', group_keys=False)
        .apply(lambda g: is_canc.loc[g.index].shift(1).fillna(0).cumsum(), include_groups=False)
    ).astype(int)

    # 7. Target binary variable: 1 if appointment ended as no-show or cancelled, 0 otherwise
    # NOTE: `target` is the prediction outcome; it is NEVER included in X
    df['target'] = df['status'].isin(['no-show', 'cancelled']).astype(int)

    feature_cols = [
        'weekday',
        'hour',
        'lead_time_days',
        'fee',
        'specialization',
        'patient_prev_cancellations',
        'rescheduled_count'
    ]

    X = df[feature_cols].copy()
    y = df['target'].copy()

    return X, y


def build_pipeline(classifier):
    """Constructs preprocessing ColumnTransformer and model Pipeline."""
    numeric_features = ['hour', 'lead_time_days', 'fee', 'patient_prev_cancellations', 'rescheduled_count']
    categorical_features = ['weekday', 'specialization']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
        ]
    )

    return Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', classifier)
    ])


def evaluate_model(pipeline, X_train, y_train, X_test, y_test, model_name="Model"):
    """
    Performs 5-fold Stratified CV on training set, then evaluates on hold-out test set.
    """
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_metrics = cross_validate(
        pipeline, X_train, y_train, cv=cv,
        scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc'],
        error_score='raise'
    )

    # Fit on training set and evaluate on test set
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred).tolist()

    test_metrics = {
        'accuracy': round(float(accuracy_score(y_test, y_pred)), 4),
        'precision': round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        'f1': round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        'roc_auc': round(float(roc_auc_score(y_test, y_prob)), 4),
        'confusion_matrix': cm,
    }

    cv_summary = {
        'cv_accuracy_mean': round(float(np.mean(cv_metrics['test_accuracy'])), 4),
        'cv_precision_mean': round(float(np.mean(cv_metrics['test_precision'])), 4),
        'cv_recall_mean': round(float(np.mean(cv_metrics['test_recall'])), 4),
        'cv_f1_mean': round(float(np.mean(cv_metrics['test_f1'])), 4),
        'cv_roc_auc_mean': round(float(np.mean(cv_metrics['test_roc_auc'])), 4),
    }

    print(f"\n==================== {model_name} ====================")
    print(f"5-Fold CV ROC-AUC: {cv_summary['cv_roc_auc_mean']:.4f} | F1: {cv_summary['cv_f1_mean']:.4f}")
    print(f"Test Accuracy:     {test_metrics['accuracy']:.4f}")
    print(f"Test Precision:    {test_metrics['precision']:.4f}")
    print(f"Test Recall:       {test_metrics['recall']:.4f}")
    print(f"Test F1 Score:     {test_metrics['f1']:.4f}")
    print(f"Test ROC-AUC:      {test_metrics['roc_auc']:.4f}")
    print(f"Confusion Matrix (TN, FP / FN, TP):\n{np.array(cm)}")

    return {
        'test_metrics': test_metrics,
        'cv_summary': cv_summary,
        'fitted_pipeline': pipeline
    }


def train_noshow_pipeline(df=None, save_artifacts=True):
    """
    Main entry point: trains baseline and Random Forest, compares metrics,
    and serializes the best performing model.
    """
    if df is None:
        df = load_dataset()

    X, y = prepare_features(df)
    print(f"[Features] Matrix shape: {X.shape}, Target distribution: {np.bincount(y)}")

    # Stratified Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    # 1. Baseline: Logistic Regression
    lr_pipe = build_pipeline(
        LogisticRegression(class_weight='balanced', max_iter=1000, random_state=RANDOM_STATE)
    )
    lr_results = evaluate_model(lr_pipe, X_train, y_train, X_test, y_test, "Logistic Regression (Baseline)")

    # 2. Random Forest Classifier
    rf_pipe = build_pipeline(
        RandomForestClassifier(
            class_weight='balanced',
            n_estimators=100,
            max_depth=6,
            random_state=RANDOM_STATE
        )
    )
    rf_results = evaluate_model(rf_pipe, X_train, y_train, X_test, y_test, "Random Forest Classifier")

    # Select best model by Test ROC-AUC (fallback to F1)
    if rf_results['test_metrics']['roc_auc'] >= lr_results['test_metrics']['roc_auc']:
        best_name = "RandomForestClassifier"
        best_results = rf_results
    else:
        best_name = "LogisticRegression"
        best_results = lr_results

    print(f"\n[Selection] Best Model Selected: {best_name}")

    # Extract feature importances if Random Forest
    rf_fitted = rf_results['fitted_pipeline']
    feature_importances = {}
    try:
        ohe = rf_fitted.named_steps['preprocessor'].named_transformers_['cat']
        cat_feature_names = ohe.get_feature_names_out(['weekday', 'specialization']).tolist()
        num_feature_names = ['hour', 'lead_time_days', 'fee', 'patient_prev_cancellations', 'rescheduled_count']
        all_features = num_feature_names + cat_feature_names
        rf_importances = rf_fitted.named_steps['classifier'].feature_importances_
        sorted_indices = np.argsort(rf_importances)[::-1]
        for idx in sorted_indices[:10]:
            feature_importances[all_features[idx]] = round(float(rf_importances[idx]), 4)
    except Exception as e:
        print(f"[Warning] Could not extract feature importances: {e}")

    report = {
        'best_model': best_name,
        'dataset_size': len(df),
        'positive_class_count': int(np.sum(y)),
        'negative_class_count': int(len(y) - np.sum(y)),
        'models': {
            'LogisticRegression': {
                'test_metrics': lr_results['test_metrics'],
                'cv_summary': lr_results['cv_summary'],
            },
            'RandomForestClassifier': {
                'test_metrics': rf_results['test_metrics'],
                'cv_summary': rf_results['cv_summary'],
                'top_feature_importances': feature_importances,
            }
        },
        'data_disclosure': 'Trained on synthetic demonstration data. Demonstrates ML engineering pipeline; not intended for clinical use.'
    }

    if save_artifacts:
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        model_path = ARTIFACTS_DIR / 'noshow_model.joblib'
        joblib.dump(best_results['fitted_pipeline'], model_path)
        print(f"[Save] Model artifact saved to: {model_path}")

        metrics_path = ML_DIR / 'metrics.json'
        with open(metrics_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        print(f"[Save] Metrics JSON saved to: {metrics_path}")

    return report, best_results['fitted_pipeline']


if __name__ == '__main__':
    train_noshow_pipeline()
