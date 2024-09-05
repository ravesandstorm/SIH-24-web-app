from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from typing import List
import only4

app = FastAPI()

# Enable CORS for all origins (you can restrict this to specific domains as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins. Change this to specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Load the dataset
data_path = 'data/SIH Data.csv'  # Make sure this path is correct
data = pd.read_csv(data_path)
data['Datetime'] = pd.to_datetime(data['Datetime'], errors='coerce')  # Ensure correct datetime parsing
data.set_index('Datetime', inplace=True)

class PredictRequest(BaseModel):
    Date: str
    Time: str

@app.post("/getval/")
def getVal():
    newValues = only4.getNewValues()
    return {"value": newValues}

@app.post("/predict/")
def predict(request: PredictRequest):
    newValues = only4.getNewValues()
    # Combine Date and Time to form a datetime object
    input_datetime = pd.to_datetime(f"{request.Date} {request.Time}", errors='coerce')

    if input_datetime not in data.index:
        return {"error": "Date and Time not found in the dataset"}

    # Extract the relevant row for prediction
    row = data.loc[input_datetime]

    # For example, use a simple moving average for demonstration
    # Here, replace with your actual prediction logic
    prediction = row['Load (MW)']

    return {"prediction": prediction, "value": newValues}

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
