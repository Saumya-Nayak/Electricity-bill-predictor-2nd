import joblib
from datetime import datetime

_model = None
_columns = []
_model_type = ""
_trained_at = None

def save_model(model, columns, model_type):
    global _model, _columns, _model_type, _trained_at
    _model = model
    _columns = columns
    _model_type = model_type
    _trained_at = datetime.now().isoformat()

def get_model_info():
    return {
        "model_type": _model_type,
        "trained_at": _trained_at,
        "features": list(_columns),
    }

def predict_bill(input_data):
    global _model, _columns
    import pandas as pd

    df = pd.DataFrame([input_data])
    df = pd.get_dummies(df)
    for col in _columns:
        if col not in df.columns:
            df[col] = 0  # Fill missing dummy columns
    df = df[_columns]
    return _model.predict(df)[0]
