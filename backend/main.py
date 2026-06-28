
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Literal, List, Optional
from datetime import datetime
import random
import csv
from io import StringIO

# Try to import database, fall back to in-memory storage
db_available = False
in_memory_history = []

try:
    from database import init_db, SessionLocal, PredictionRecord
    db_available = True
except ImportError:
    print("WARNING: Database not available, using in-memory storage")

# Try to import ML model, fall back to rule-based
ml_available = False
try:
    from ml_model import predict_ml, load_models
    ml_available = True
except ImportError:
    print("WARNING: ML model not available, using rule-based prediction")

app = FastAPI(title="RideCast AI Demand Prediction Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    if db_available:
        try:
            init_db()
        except Exception as e:
            print(f"WARNING: Failed to init DB: {e}")
    if ml_available:
        try:
            load_models()
        except Exception as e:
            print(f"WARNING: Failed to load ML models: {e}")
    print("All systems ready!")


class PredictionInput(BaseModel):
    city: str
    temperature: float
    weather: str
    local_time: str
    holiday: bool
    weekend: bool


class PredictionOutput(BaseModel):
    demand_score: int
    demand_category: Literal["Low", "Medium", "High", "Very High"]
    surge_multiplier: float
    recommended_drivers: int
    revenue_estimate: str
    explanation: str


class HistoryItem(BaseModel):
    id: int
    city: str
    temperature: float
    weather: str
    local_time: str
    holiday: bool
    weekend: bool
    demand_score: int
    demand_category: Literal["Low", "Medium", "High", "Very High"]
    surge_multiplier: float
    recommended_drivers: int
    revenue_estimate: str
    explanation: str
    created_at: str


class AnalyticsData(BaseModel):
    total_predictions: int
    avg_demand_score: float
    avg_surge_multiplier: float
    high_demand_count: int
    hourly_demand: List[dict]
    weekly_demand: List[dict]
    weather_impact: List[dict]


def rule_based_predict(temperature: float, weather: str, local_time: str, holiday: bool, weekend: bool):
    base_score = 50
    factors = []

    try:
        hour = int(local_time.split(":")[0])
    except:
        hour = 12

    if 7 <= hour < 10 or 17 <= hour < 21:
        base_score += 30
        factors.append("Rush hour (+30%)")

    if weather in ["Rain", "Drizzle", "Thunderstorm", "Snow"]:
        base_score += 25
        factors.append("Bad weather (+25%)")

    if temperature < 5 or temperature > 30:
        base_score += 20
        factors.append("Extreme temperature (+20%)")

    if holiday:
        base_score += 25
        factors.append("Holiday (+25%)")

    if weekend:
        base_score += 15
        factors.append("Weekend (+15%)")

    demand_score = max(0, min(100, int(base_score + random.randint(-5, 5))))

    if demand_score < 30:
        category = "Low"
    elif demand_score < 60:
        category = "Medium"
    elif demand_score < 85:
        category = "High"
    else:
        category = "Very High"

    surge = round(1 + (demand_score / 100) * 1.8, 2)
    drivers = max(1, int(demand_score / 4.5))

    if category == "Low":
        revenue = "$150-250"
    elif category == "Medium":
        revenue = "$250-450"
    elif category == "High":
        revenue = "$450-750"
    else:
        revenue = "$750-1200"

    explanation = "Rule-based prediction. Factors: " + (", ".join(factors) if factors else "Standard conditions")

    return {
        "demand_score": demand_score,
        "demand_category": category,
        "surge_multiplier": surge,
        "recommended_drivers": drivers,
        "revenue_estimate": revenue,
        "explanation": explanation
    }


@app.get("/")
def read_root():
    return {"message": "Welcome to RideCast AI Demand Prediction Platform"}


@app.post("/predict", response_model=PredictionOutput)
def predict(input_data: PredictionInput):
    print(f"Predicting for {input_data.city}...")
    
    if ml_available:
        try:
            result = predict_ml(
                temperature=input_data.temperature,
                weather=input_data.weather,
                local_time=input_data.local_time,
                holiday=input_data.holiday,
                weekend=input_data.weekend
            )
        except Exception as e:
            print(f"WARNING: ML failed, using rule-based: {e}")
            result = rule_based_predict(
                temperature=input_data.temperature,
                weather=input_data.weather,
                local_time=input_data.local_time,
                holiday=input_data.holiday,
                weekend=input_data.weekend
            )
    else:
        result = rule_based_predict(
            temperature=input_data.temperature,
            weather=input_data.weather,
            local_time=input_data.local_time,
            holiday=input_data.holiday,
            weekend=input_data.weekend
        )

    # Save to storage
    record = {
        "id": len(in_memory_history) + 1,
        "city": input_data.city,
        "temperature": input_data.temperature,
        "weather": input_data.weather,
        "local_time": input_data.local_time,
        "holiday": input_data.holiday,
        "weekend": input_data.weekend,
        "demand_score": result["demand_score"],
        "demand_category": result["demand_category"],
        "surge_multiplier": result["surge_multiplier"],
        "recommended_drivers": result["recommended_drivers"],
        "revenue_estimate": result["revenue_estimate"],
        "explanation": result["explanation"],
        "created_at": datetime.now().isoformat()
    }
    
    in_memory_history.append(record)
    
    # Also try to save to DB if available
    if db_available:
        try:
            db = SessionLocal()
            db_record = PredictionRecord(
                city=input_data.city,
                temperature=input_data.temperature,
                weather=input_data.weather,
                local_time=input_data.local_time,
                holiday=input_data.holiday,
                weekend=input_data.weekend,
                demand_score=result["demand_score"],
                demand_category=result["demand_category"],
                surge_multiplier=result["surge_multiplier"],
                recommended_drivers=result["recommended_drivers"],
                revenue_estimate=result["revenue_estimate"],
                explanation=result["explanation"]
            )
            db.add(db_record)
            db.commit()
            db.refresh(db_record)
            print(f"Prediction saved to database (ID: {db_record.id})")
            db.close()
        except Exception as e:
            print(f"WARNING: Failed to save to DB: {e}")

    return result


@app.get("/history", response_model=List[HistoryItem])
def get_history():
    if db_available:
        try:
            db = SessionLocal()
            records = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).all()
            history = []
            for r in records:
                history.append({
                    "id": r.id,
                    "city": r.city,
                    "temperature": r.temperature,
                    "weather": r.weather,
                    "local_time": r.local_time,
                    "holiday": r.holiday,
                    "weekend": r.weekend,
                    "demand_score": r.demand_score,
                    "demand_category": r.demand_category,
                    "surge_multiplier": r.surge_multiplier,
                    "recommended_drivers": r.recommended_drivers,
                    "revenue_estimate": r.revenue_estimate,
                    "explanation": r.explanation,
                    "created_at": r.created_at.isoformat() if r.created_at else datetime.now().isoformat()
                })
            db.close()
            return history
        except Exception as e:
            print(f"WARNING: Failed to get from DB, using in-memory: {e}")
    return list(reversed(in_memory_history))


@app.get("/analytics", response_model=AnalyticsData)
def get_analytics():
    history = get_history()
    
    total = len(history)
    
    if total == 0:
        return {
            "total_predictions": 0,
            "avg_demand_score": 0,
            "avg_surge_multiplier": 1.0,
            "high_demand_count": 0,
            "hourly_demand": [
                {"hour": "00:00", "demand": 35, "surge": 1.2},
                {"hour": "04:00", "demand": 20, "surge": 1.0},
                {"hour": "08:00", "demand": 85, "surge": 2.1},
                {"hour": "12:00", "demand": 60, "surge": 1.5},
                {"hour": "16:00", "demand": 75, "surge": 1.8},
                {"hour": "20:00", "demand": 90, "surge": 2.3},
                {"hour": "23:00", "demand": 45, "surge": 1.3}
            ],
            "weekly_demand": [
                {"day": "Mon", "demand": 65, "rides": 260},
                {"day": "Tue", "demand": 58, "rides": 232},
                {"day": "Wed", "demand": 72, "rides": 288},
                {"day": "Thu", "demand": 78, "rides": 312},
                {"day": "Fri", "demand": 92, "rides": 368},
                {"day": "Sat", "demand": 88, "rides": 352},
                {"day": "Sun", "demand": 60, "rides": 240}
            ],
            "weather_impact": [
                {"weather": "Clear", "avg_demand": 50, "impact": "Low"},
                {"weather": "Clouds", "avg_demand": 60, "impact": "Medium"},
                {"weather": "Rain", "avg_demand": 80, "impact": "High"},
                {"weather": "Drizzle", "avg_demand": 75, "impact": "High"}
            ]
        }
    
    avg_demand = sum(h["demand_score"] for h in history) / total
    avg_surge = sum(h["surge_multiplier"] for h in history) / total
    high_count = sum(1 for h in history if h["demand_category"] in ["High", "Very High"])
    
    hourly_data = {}
    for h in history:
        hour = h["local_time"].split(":")[0] + ":00"
        if hour not in hourly_data:
            hourly_data[hour] = {"count": 0, "sum": 0}
        hourly_data[hour]["count"] += 1
        hourly_data[hour]["sum"] += h["demand_score"]
    
    hourly_demand = []
    for hour in sorted(hourly_data.keys()):
        avg = int(hourly_data[hour]["sum"] / hourly_data[hour]["count"])
        hourly_demand.append({
            "hour": hour,
            "demand": avg,
            "surge": 1 + avg / 100
        })
    
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_demand = []
    for day in days:
        weekly_demand.append({
            "day": day,
            "demand": int(avg_demand + random.randint(-10, 10)),
            "rides": int((avg_demand + random.randint(-10, 10)) * 4)
        })
    
    weather_data = {}
    for h in history:
        w = h["weather"]
        if w not in weather_data:
            weather_data[w] = {"count": 0, "sum": 0}
        weather_data[w]["count"] += 1
        weather_data[w]["sum"] += h["demand_score"]
    
    weather_impact = []
    for w, data in weather_data.items():
        avg = int(data["sum"] / data["count"])
        impact = "Low"
        if avg > 85:
            impact = "Very High"
        elif avg > 70:
            impact = "High"
        elif avg > 55:
            impact = "Medium"
        weather_impact.append({
            "weather": w,
            "avg_demand": avg,
            "impact": impact
        })
    
    return {
        "total_predictions": total,
        "avg_demand_score": round(avg_demand, 1),
        "avg_surge_multiplier": round(avg_surge, 2),
        "high_demand_count": high_count,
        "hourly_demand": hourly_demand if hourly_demand else [
            {"hour": "00:00", "demand": 35, "surge": 1.2},
            {"hour": "08:00", "demand": 85, "surge": 2.1},
            {"hour": "20:00", "demand": 90, "surge": 2.3}
        ],
        "weekly_demand": weekly_demand,
        "weather_impact": weather_impact if weather_impact else [
            {"weather": "Clear", "avg_demand": 50, "impact": "Low"}
        ]
    }


@app.get("/export/json")
def export_json():
    history = get_history()
    return JSONResponse(
        content=history,
        headers={"Content-Disposition": 'attachment; filename="ridecast-predictions.json"'}
    )


@app.get("/export/csv")
def export_csv():
    history = get_history()
    output = StringIO()
    writer = csv.writer(output)
    
    # Write CSV headers
    writer.writerow([
        "ID", "City", "Temperature (°C)", "Weather", "Local Time",
        "Holiday", "Weekend", "Demand Score", "Demand Category",
        "Surge Multiplier", "Recommended Drivers", "Revenue Estimate", "Created At"
    ])
    
    # Write data rows
    for item in history:
        writer.writerow([
            item["id"],
            item["city"],
            item["temperature"],
            item["weather"],
            item["local_time"],
            "Yes" if item["holiday"] else "No",
            "Yes" if item["weekend"] else "No",
            item["demand_score"],
            item["demand_category"],
            item["surge_multiplier"],
            item["recommended_drivers"],
            item["revenue_estimate"],
            item["created_at"]
        ])
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="ridecast-predictions.csv"'}
    )
