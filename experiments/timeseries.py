import MySQLdb
import datetime
import numpy as np
import time
import marshal


# Settings

elm_ids = [8005, 17066, 32489, 35502, 76429] # in increasing popularity
start_day = '2-23-2015'
end_day = '3-5-2016'
output = 'datastore/time_series_densities.dat' # output path
start_time = time.time() # current time for timing script


# Init
db = MySQLdb.connect(host="parking.c9q5edmigsud.us-west-2.rds.amazonaws.com", port=3306, user='parking', passwd='sdotpark1ng', db="parking")
cur = db.cursor()
start_date = datetime.datetime.strptime(start_day, '%m-%d-%Y')
end_date = datetime.datetime.strptime(end_day, '%m-%d-%Y')
day_count = (end_date - start_date).days
time_series = {}
densities = np.zeros((day_count, 24))
day_lookup = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']

# LOOP FILTERED KEYS
for elm_id in elm_ids:
    print 'Searching Element ID : %d ...' % elm_id

    # LOOP DAY
    for i, date in enumerate(start_date + datetime.timedelta(n) for n in range(day_count)):
        print '\t(%d/%d days) %s,  %s' % (i,day_count,day_lookup[date.weekday()],date.strftime('%Y-%m-%d'))

        query = "SELECT element_key, timestamp, duration FROM transactions " \
                "WHERE date(timestamp) = '{0}' AND element_key= %d" % elm_id
        cur.execute(query.format(date.strftime('%Y-%m-%d')))
        transactions = cur.fetchall()

        # LOOP TRANSACTIONS
        print '\t\t%d transactions' % len(transactions)
        for j, transaction in enumerate(transactions):
            start = transaction[1]
            end = start + datetime.timedelta(seconds=transaction[2])
            id = transaction[0]
            # print '\t\tTransaction #%d : (%s to %s)' % (j,start.time(),end.time())

            if end.day != date.day:
                print "ERROR: start and end of transaction must be same day"
                print start,'to',end
                break

            # LOOP HOURS
            for hr in xrange(start.hour, end.hour):
                densities[i, hr] += 1
    print ' Found : %d' %np.sum(densities)
    # print densities
    time_series[elm_id] = densities

print 'Saving to %s'
marshal.dump(time_series, open(output, 'wb'))
print 'Done in %d ms' % (time.time() - start_time)

