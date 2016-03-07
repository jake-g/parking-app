import MySQLdb
import datetime
import pytz
import marshal

# 8005 #00cc66 76429 #cc0000 32489 #ff9933 35502 #ff5050 17066 #ffff00

#         green  yellow orange  red  drk red
elm_ids = [8005, 17066, 32489, 35502, 76429]
elm_id = elm_ids[-1] # most popular
start = '1-1-2016'
end = '1-3-2016'

start_date = datetime.datetime.strptime(start, '%m-%d-%Y')
end_date = datetime.datetime.strptime(end, '%m-%d-%Y')




db = MySQLdb.connect(host="parking.c9q5edmigsud.us-west-2.rds.amazonaws.com", port=3306, user='parking', passwd='sdotpark1ng', db="parking")
cur = db.cursor()

# max_occupancies = {}
# for elm_id in elm_ids:
#     query = "SELECT * FROM blockfaces WHERE element_key= %d" % elm_id
#     cur.execute(query)
#     blockface = cur.fetchall()[0]
#     max_occupancies[blockface[0]] = blockface[7]
#
# print max_occupancies

hour_counts= {}

# for x in xrange(0, 15):
start_date = datetime.datetime.strptime(start, '%m-%d-%Y')
end_date = datetime.datetime.strptime(end, '%m-%d-%Y')
day_count = (end_date - start_date).days + 1
for date in (start_date + datetime.timedelta(n) for n in range(day_count)):
    # date = datetime.datetime.now(tz=pytz.timezone('US/Pacific')) #- datetime.timedelta(days=x)
    print date.strftime('%Y-%m-%d')
    query = "SELECT element_key, timestamp, duration FROM transactions " \
            "WHERE date(timestamp) = '{0}' AND element_key= %d" % elm_id
    cur.execute(query.format(date.strftime('%Y-%m-%d')))
    transactions = cur.fetchall()
    for transaction in transactions:
        start = transaction[1]
        end = start + datetime.timedelta(seconds=transaction[2])
        if end.day == date.day:
            for y in xrange(start.hour, end.hour):
                counts = hour_counts.get(transaction[0], [0 for z in xrange(0, 23)])
                counts[y] += 1
                hour_counts[transaction[0]] = counts

print hour_counts
print len(hour_counts[76429])
# marshal.dump(hour_counts, open('datastore/hist.b', 'wb'))
