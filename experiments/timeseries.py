import MySQLdb
import datetime as dt
import numpy as np
import time
import pandas as pd
import os
import pickle as pickle

# Settings
elm_ids = [8005, 17066, 32489, 35502, 76429] # in increasing popularity
elm_ids = [32489] # in increasing popularity
buffer_size = 5

start_day = '1-1-2015'
end_day = '1-7-2015'
start_time = time.time() # current time for timing script
path = 'datastore/paystations/'
if not os.path.exists(path):
    os.makedirs(path)

# Init
db = MySQLdb.connect(host="parking.c9q5edmigsud.us-west-2.rds.amazonaws.com", port=3306, user='parking', passwd='sdotpark1ng', db="parking")
cur = db.cursor()
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

# Free park function
def free_parking(d):
    # holiday (skip and if on sunday skip mon)
    holiday = ['01-01', '07-04', '11-11', '12-15']
    d_str = d.strftime('%m-%d')
    if d_str in holiday:
        print '\tskip holiday'
        return True
    mon_after = (d - dt.timedelta(days=1)).strftime('%m-%d')
    if mon_after in holiday and d.weekday() == 0:
        print '\tmon after sun holiday'
        return True
    # Any Sunday
    if d.weekday() == 6:
        print '\tskip sunday...'
        return True
    # 3rd Mon Feb and Jan (mlk and pres day)
    elif d.weekday() == 0 and 14 < d.day < 22 and 1 <= d.month <= 2:
        print '\tskip mlk / pres day...'
        return True
    # Last Mon of may (memorial)
    elif d.weekday() == 0 and 21 < d.day < 32 and  d.month == 5:
        print '\tskip memorial day...'
        return True
    # 1st Mon sept (labor)
    elif d.weekday() == 0 and 0 < d.day < 8 and  d.month == 9:
        print '\tskip labor day...'
        return True
    # 4th Thurs Nov (thanksgiving)
    elif d.weekday() == 3 and 21 < d.day < 29 and  d.month == 11:
        print '\tskip thanksgiving day...'
        return True
    # 4th Thurs Nov (thanksgiving)
    elif d.weekday() == 3 and 21 < d.day < 29 and  d.month == 11:
        print '\tskip thanksgiving day...'
        return True

def save_data(ts, elm_id, curr_count, day_count):
    print ' Found %d hours of parked cars' %np.nansum(ts.density)
    output = path + '%d_%d_days_of_%d.d' % (elm_id, curr_count, day_count-1) # output path
    print 'Saving to %s' % output
    pickle.dump(ts, open(output, 'wb'))
    print ts

# LOOP FILTERED KEYS
for elm_id in elm_ids:
    print 'Searching Element ID : %d ...' % elm_id

    # LOOP DAY
    for i, date in enumerate(start_date + dt.timedelta(n) for n in range(day_count)):
        densities = np.zeros(24)  # temp
        if free_parking(i, date): # skip free parking
            ts.density[24*i:24*i+len(densities)] = np.nan
            continue

        query = "SELECT element_key, timestamp, duration FROM transactions " \
                "WHERE date(timestamp) = '{0}' AND element_key= %d" % elm_id
        cur.execute(query.format(date.strftime('%Y-%m-%d')))
        transactions = cur.fetchall()
        print '  %d/%d :\t%s-%s...\t%d hrs\t@ id %d' % \
              (i,day_count-1,day_lookup[date.weekday()],date.strftime('%Y-%m-%d'),len(transactions),elm_id)

        # LOOP TRANSACTIONS
        for j, transaction in enumerate(transactions):
        # TRANSACTION(32489L, datetime.datetime(2015, 1, 2, 12, 27, 59), 12600L)
            start = transaction[1]
            end = start + dt.timedelta(seconds=transaction[2])
            id = transaction[0]
            # print '\t\tTransaction #%d : (%s to %s)' % (j,start.time(),end.time())

            # TODO handle this case better
            if end.day != date.day:
                print "\t\tERROR: start and end of transaction must be same day"
                print '\t\t',start,'to',end
                break

            # LOOP HOURS
            for hr in xrange(start.hour, end.hour):
                densities[hr] += 1

        # Store day's data to ts
        ts.density[24*i:24*i+len(densities)] = densities  # store from hr 0 to 23 for the ith day

     # Save every 50 days
    if i % buffer_size == 0:
        print 'Saving the last %d days' % buffer_size
        save_data(ts, elm_id, i, day_count)
        print ts.density

print 'Done in %d s' % (time.time() - start_time)
