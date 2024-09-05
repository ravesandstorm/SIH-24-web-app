import pandas as pd
import warnings
warnings.filterwarnings(action='ignore')

data = pd.read_csv('SIH Data.csv')
data['Datetime'] = pd.to_datetime(data['Datetime'], errors='coerce')
data.set_index('Datetime', inplace=True)
data = data.dropna(how='any',axis=0)

dic = data['Time'].unique()

def a(row):
    if row['Time']==dic[0] or row['Time']==dic[1]:
        return 0
    else:
        return 1
def b(row):
    if row['Time']==dic[0] or row['Time']==dic[2]:
        return 0
    else:
        return 1

data['a'] = data.apply(a, axis=1)
data['b'] = data.apply(b, axis=1)

data['Load Shift 1'] = data['Load (MW)'].shift(1)
data['Load Shift 2'] = data['Load (MW)'].shift(2)
data = data.dropna(how='any',axis=0)

train_size = 0.8  # 80% of data for training, 20% for testing
split_index = int(len(data) * train_size)

# chronological split
train, test = data[:split_index], data[split_index:]

from statsmodels.tsa.statespace.sarimax import SARIMAX

ts = train['Load (MW)']
features=['a', 'b', 'Temp', 'Rain(mm)', 'Gust(km/hr)', 'Rain%', 'IsHoliday', 'Load Shift 1', 'Load Shift 2']
exog_train = train[features]
exog_test = test[features]

model = SARIMAX(ts, exog=exog_train, order=(5, 0, 2), seasonal_order=(0,0,2,4))
model_fit = model.fit()

forecast = model_fit.get_forecast(steps=len(test), exog=exog_test)
forecast_series = pd.Series(forecast.predicted_mean.values, index=test.index)

def getNewValues():
    return forecast.predicted_mean.values[-1]
    #for z,i in zip(test.index[-4:], forecast.predicted_mean.values[-4:]):
    #    print(f"{i:.2f}")