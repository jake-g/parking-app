import datetime as dt
import numpy as np
import pandas as pd

elm_ids = [8005, 17066, 32489, 35502, 76429] # in increasing popularity
start_day = '1-1-2015'
end_day = '1-4-2015'
start_date = dt.datetime.strptime(start_day, '%m-%d-%Y')
end_date = dt.datetime.strptime(end_day, '%m-%d-%Y')
day_count = (end_date - start_date).days
hour_count = 24*day_count
day_lookup = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']

# Create data frame
index = pd.date_range(start_day, end_day, freq='H')
densities = np.zeros((len(index), 1))
ts = pd.DataFrame(data=densities, index=index, columns=['density'])
ts = ts.fillna(0)
densities = np.zeros(24)  # temp
densities[2]  += 1
densities[6]  += 6

print densities
ts.density[0:24] = densities
print ts.density[0:24]
print len(densities)