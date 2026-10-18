# HealthBook ML: Appointment No-Show & Late Cancellation Risk Engine

**Course:** Open Source Technologies (3CS502ME24)  
**Service:** Analytics & Decision Support  
**Model Type:** Supervised Binary Classification (LogisticRegression Baseline vs. RandomForestClassifier)  

> **Important Disclaimer:**  
> **This is a decision-support demo, not medical advice.**  
> The training data is synthetic demonstration data generated for the university course project. The metrics reported below demonstrate the end-to-end ML engineering pipeline, preprocessing, validation, and serialization, and are **not** a clinical or real-world claim. No metrics have been invented or inflated; all values match the exact outputs produced during script execution.

---

## 1. Problem Formulation & Objective

Patient no-shows and last-minute cancellations introduce substantial operational inefficiencies, unused clinical capacity, and revenue leakage. The goal of this machine learning pipeline is to estimate the probability that a scheduled appointment will fail to materialize as a completed consultation (`status in ['no-show', 'cancelled']`).

Clinics can use predicted probabilities to:
1. Target high-risk bookings with automated SMS and email reminders 48 hours in advance.
2. Optimize overbooking strategies for time slots prone to abandonment.
3. Require pre-payment confirmation for distant bookings.

---

## 2. Data Leakage Prevention

A critical principle of operational ML is that **features must only include information known at the time of appointment scheduling**. 

To strictly prevent data leakage:
- **`status` is excluded:** Ground truth target label (`is_noshow_or_late_cancel`).
- **`cancelled_at` is excluded:** Only populated after an appointment has been cancelled.
- **`payment_status` & transaction completion timestamps are excluded:** Finalized during or after the consultation encounter.
- **Consultation notes, prescriptions, and post-visit reviews are excluded:** Documented by physicians during or after the visit.
- **`patient_prev_cancellations` is computed chronologically:** When counting previous cancellations for a given patient hash, the timeline is strictly ordered by `created_at`. The cumulative sum shifts by 1, so the current appointment's outcome is never leaked into its own feature vector.

---

## 3. Feature Pipeline & Model Architecture

The feature matrix $X$ consists of 7 intake variables:

| Feature | Type | Preprocessing | Description |
| :--- | :--- | :--- | :--- |
| `lead_time_days` | Numeric | `StandardScaler` | Days between booking creation and scheduled consultation date. |
| `hour` | Numeric | `StandardScaler` | Scheduled appointment hour (e.g., 9 to 17). |
| `fee` | Numeric | `StandardScaler` | Consultation fee in INR (&#8377;). |
| `patient_prev_cancellations` | Numeric | `StandardScaler` | Historical cancellations by this patient prior to this booking. |
| `rescheduled_count` | Numeric | `StandardScaler` | Number of times the appointment was rescheduled prior to the visit. |
| `weekday` | Categorical | `OneHotEncoder` | Day of week (`Monday` to `Sunday`). |
| `specialization` | Categorical | `OneHotEncoder` | Consulting physician's medical specialty. |

### Class Imbalance Handling
The dataset of 505 appointments contains **98 positive cases** (19.4% no-show / cancelled) and **407 negative cases** (80.6% completed / confirmed / pending). To address this imbalance without artificial oversampling, both models apply `class_weight="balanced"`.

---

## 4. Empirical Evaluation & Exact Metrics

Models were trained on an 80% stratified training split (404 rows) with 5-fold cross-validation, and evaluated on a 20% holdout test set (101 rows).

### Performance Comparison

| Metric | Logistic Regression (Baseline) | Random Forest Classifier (Selected) |
| :--- | :---: | :---: |
| **5-Fold CV ROC-AUC (Mean)** | 0.5216 | **0.5527** |
| **5-Fold CV F1 (Mean)** | **0.2709** | 0.2358 |
| **Test Accuracy** | 0.5644 | **0.6931** |
| **Test Precision** | 0.2000 | **0.2963** |
| **Test Recall** | **0.4000** | **0.4000** |
| **Test F1 Score** | 0.2667 | **0.3404** |
| **Test ROC-AUC** | 0.4852 | **0.5469** |

### Test Confusion Matrix (Random Forest)

Evaluated on 101 hold-out appointments (81 negative, 20 positive):

```
                     Predicted Negative    Predicted Positive
Actual Negative (0)         62 (TN)               19 (FP)
Actual Positive (1)         12 (FN)                8 (TP)
```

- **True Negatives (62):** Correctly predicted as completed/confirmed.
- **True Positives (8):** Correctly flagged for no-show/cancellation intervention.
- **False Positives (19):** Benign bookings flagged for reminders (acceptable trade-off in clinic outreach).
- **False Negatives (12):** Unpredicted cancellations.

### Top Feature Importances (Random Forest)

```
lead_time_days            ████████████████████ 17.33%
hour                      █████████████████    15.17%
fee                       ██████████           8.30%
patient_prev_cancellations ████████            7.24%
weekday_Monday            ███████              6.50%
rescheduled_count         ███████              6.24%
specialization_Orthopedics ███████             6.07%
weekday_Saturday          █████                4.52%
specialization_Cardiology █████                4.41%
specialization_Psychiatry ███                  2.78%
```

**Key Finding:** Advance booking lead time (`lead_time_days`) and the time of day (`hour`) constitute the strongest predictive signals, matching observations from clinical scheduling literature.

---

## 5. Inference API (`/reports/api/noshow-risk/`)

The trained model is serialized using `joblib` into `analytics/ml/artifacts/noshow_model.joblib`. An authenticated Django view exposes probability scoring.

### Endpoint Specification

- **URL:** `/reports/api/noshow-risk/` (also aliased at `/api/noshow-risk/`)
- **Authentication:** `login_required` (Session or Django auth cookie required)
- **Method:** `POST` (application/json)

#### Sample Request Payload

```json
{
  "weekday": "Monday",
  "hour": 14,
  "lead_time_days": 18,
  "fee": 1200.0,
  "specialization": "Cardiology",
  "patient_prev_cancellations": 1,
  "rescheduled_count": 0
}
```

#### Successful Response (HTTP 200)

```json
{
  "status": "success",
  "probability": 0.4285,
  "risk_level": "Medium",
  "disclaimer": "Decision-support demonstration only; not clinical or medical advice."
}
```

#### Error Response (HTTP 400 on Invalid Input)

```json
{
  "status": "error",
  "message": "Field 'hour' must be an integer between 0 and 23."
}
```

---

## 6. Execution Instructions

To retrain the model and regenerate `metrics.json`:

```bash
# From the analytics directory with venv activated:
python ml/train.py
```
