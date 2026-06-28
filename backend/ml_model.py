
# Try to import ML libraries, else provide dummy functions
try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import LabelEncoder
    import joblib
    import os


    WEATHER_CATEGORIES = ["Clear", "Clouds", "Rain", "Drizzle", "Snow", "Thunderstorm"]


    def generate_synthetic_data(num_samples: int = 2000):
        """Generate a synthetic dataset for training demand prediction model"""
        np.random.seed(42)

        cities = ["New York", "London", "Tokyo", "Delhi", "Mumbai", "Paris", "Berlin", "Sydney"]
        weather_conditions = ["Clear", "Clouds", "Rain", "Drizzle", "Snow", "Thunderstorm"]

        data = []
        for _ in range(num_samples):
            city = np.random.choice(cities)
            temperature = np.random.uniform(-5, 40)
            weather = np.random.choice(weather_conditions)
            hour = np.random.randint(0, 24)
            day_of_week = np.random.randint(0, 7)
            holiday = np.random.choice([True, False], p=[0.05, 0.95])
            weekend = day_of_week >= 5

            # Calculate base demand score with known factors
            base_score = 30
            if (hour >= 7 and hour < 10) or (hour >= 17 and hour < 21):
                base_score += 30
            if weather in ["Rain", "Drizzle", "Thunderstorm"]:
                base_score += 25
            if temperature < 5 or temperature > 30:
                base_score += 20
            if holiday:
                base_score += 30
            if weekend:
                base_score += 15

            demand_score = min(100, max(0, int(base_score + np.random.normal(0, 5))))
            surge = round(1 + (demand_score / 100) * 1.8, 2)
            drivers = max(1, int(demand_score / 4.5))

            data.append({
                "temperature": temperature,
                "weather": weather,
                "hour": hour,
                "day_of_week": day_of_week,
                "holiday": holiday,
                "weekend": weekend,
                "demand_score": demand_score,
                "surge_multiplier": surge,
                "recommended_drivers": drivers
            })

        df = pd.DataFrame(data)
        return df


    def train_model():
        print("Generating synthetic training data...")
        df = generate_synthetic_data(5000)

        # Encode weather category
        le_weather = LabelEncoder()
        df["weather_encoded"] = le_weather.fit_transform(df["weather"])

        X = df[["temperature", "weather_encoded", "hour", "day_of_week", "holiday", "weekend"]]
        y_demand = df["demand_score"]
        y_surge = df["surge_multiplier"]
        y_drivers = df["recommended_drivers"]

        print("Training Random Forest models...")
        model_demand = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model_demand.fit(X, y_demand)

        model_surge = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
        model_surge.fit(X, y_surge)

        model_drivers = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
        model_drivers.fit(X, y_drivers)

        os.makedirs("models", exist_ok=True)
        joblib.dump(model_demand, "models/demand_model.pkl")
        joblib.dump(model_surge, "models/surge_model.pkl")
        joblib.dump(model_drivers, "models/drivers_model.pkl")
        joblib.dump(le_weather, "models/weather_encoder.pkl")

        print("Models trained and saved!")


    def load_models():
        if not os.path.exists("models/demand_model.pkl"):
            print("No trained models found, training new models...")
            train_model()

        model_demand = joblib.load("models/demand_model.pkl")
        model_surge = joblib.load("models/surge_model.pkl")
        model_drivers = joblib.load("models/drivers_model.pkl")
        le_weather = joblib.load("models/weather_encoder.pkl")

        return model_demand, model_surge, model_drivers, le_weather


    def predict_ml(temperature: float, weather: str, local_time: str, holiday: bool, weekend: bool):
        model_demand, model_surge, model_drivers, le_weather = load_models()

        try:
            hour = int(local_time.split(":")[0])
        except (ValueError, IndexError):
            hour = 12

        # Get day of week (0-6)
        from datetime import datetime
        day_of_week = datetime.now().weekday()

        # Encode weather
        try:
            weather_encoded = le_weather.transform([weather])[0]
        except ValueError:
            # Use closest matching weather category if not found
            if "rain" in weather.lower() or "storm" in weather.lower():
                weather_encoded = le_weather.transform(["Rain"])[0]
            elif "cloud" in weather.lower() or "overcast" in weather.lower():
                weather_encoded = le_weather.transform(["Clouds"])[0]
            elif "snow" in weather.lower():
                weather_encoded = le_weather.transform(["Snow"])[0]
            else:
                weather_encoded = le_weather.transform(["Clear"])[0]

        # Prepare features
        features = pd.DataFrame([[
            temperature,
            weather_encoded,
            hour,
            day_of_week,
            holiday,
            weekend
        ]], columns=["temperature", "weather_encoded", "hour", "day_of_week", "holiday", "weekend"])

        demand_score = max(0, min(100, int(model_demand.predict(features)[0])))
        surge_multiplier = round(float(model_surge.predict(features)[0]), 2)
        recommended_drivers = max(1, int(model_drivers.predict(features)[0]))

        # Determine demand category
        if demand_score < 30:
            category = "Low"
        elif demand_score < 60:
            category = "Medium"
        elif demand_score < 85:
            category = "High"
        else:
            category = "Very High"

        # Revenue estimate
        if category == "Low":
            revenue = "$150-250"
        elif category == "Medium":
            revenue = "$250-450"
        elif category == "High":
            revenue = "$450-750"
        else:
            revenue = "$750-1200"

        # Explanation
        explanation_parts = []
        if (hour >= 7 and hour < 10) or (hour >= 17 and hour < 21):
            explanation_parts.append("Rush hour demand")
        if weather in ["Rain", "Drizzle", "Thunderstorm"]:
            explanation_parts.append("Rainy weather")
        if temperature < 5 or temperature > 30:
            explanation_parts.append("Extreme temperature")
        if holiday:
            explanation_parts.append("Public holiday")
        if weekend:
            explanation_parts.append("Weekend traffic")

        explanation = "ML prediction using Random Forest model. Factors: " + \
                      (", ".join(explanation_parts) if explanation_parts else "Standard demand.")

        return {
            "demand_score": demand_score,
            "demand_category": category,
            "surge_multiplier": surge_multiplier,
            "recommended_drivers": recommended_drivers,
            "revenue_estimate": revenue,
            "explanation": explanation
        }


    if __name__ == "__main__":
        train_model()
        
except ImportError:
    # If ML libraries are missing, provide dummy functions that just return None/raise
    print("WARNING: ML libraries not available, ML prediction features disabled")
    
    def load_models():
        raise ImportError("ML libraries not installed")
        
    def predict_ml(*args, **kwargs):
        raise ImportError("ML libraries not installed")
