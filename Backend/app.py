from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from model_store import save_model, get_model_info, predict_bill
import pandas as pd

# Create Flask app instance FIRST
app = Flask(__name__)

# Define models dictionary
models = {
    'linear': LinearRegression,
    'decision_tree': DecisionTreeRegressor,
    'random_forest': RandomForestRegressor
}

# Now define routes (after app is created)
@app.route('/')
def home():
    return "Welcome to your Electricity App!"

@app.route("/train", methods=["POST"])
def train():
    data = request.get_json()
    df = pd.DataFrame(data["dataset"])
    model_type = data.get("model_type", "linear")

    if model_type not in models:
        return jsonify({"error": "Invalid model type"}), 400

    X = df[["units_consumed", "household_size", "weather", "region", "electricity_rate"]]
    y = df["bill"]

    # Convert categorical features
    X = pd.get_dummies(X)

    model = models[model_type]()
    model.fit(X, y)

    save_model(model, X.columns, model_type)
    return jsonify({"message": "Model trained successfully"})

@app.route("/predict", methods=["POST"])
def predict():
    input_data = request.get_json()
    prediction = predict_bill(input_data)
    return jsonify({"predicted_bill": round(prediction, 2)})

@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify(get_model_info())

if __name__ == "__main__":
    app.run(debug=True)