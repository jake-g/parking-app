import pickle
import urllib2
import csv
import datetime

"""""""""

parses and serializes data from SDOT API, one week at a time. Creates sets for specific columns of interest
element keys and transaction ids in this case

"""""""""


trans_ids = set()
elem_key = set()
startDate = datetime.datetime(2014, 1, 1)
num_years = 2
trans_file = '../datastore/trans_ids_' + str(startDate.year) + '_' + str(startDate.year + num_years) + '.d'
elem_file = '../datastore/elem_key_' + str(startDate.year) + '_' + str(startDate.year + num_years) + '.d'

for x in xrange(num_years*52):
    print x
    transactions = {}
    start = startDate.strftime('%m%d%Y')
    endDate = startDate + datetime.timedelta(days=7)
    end = endDate.strftime('%m%d%Y')
    url = 'http://web6.seattle.gov/SDOT/wapiParkingStudy/api/ParkingTransaction?from='+start+'&to=' + end
    req = urllib2.urlopen(url)
    csvFile = csv.reader(req)
    keys = csvFile.next()

    # process 1 week
    for row in csvFile:
        trans_ids.add(row[2])
        elem_key.add(row[8])

    print len(elem_key)
    startDate = endDate + datetime.timedelta(days=1)

# Output sets
outputFile = open(trans_file, 'wb')
pickle.dump(list(trans_ids), outputFile)
outputFile.close()

outputFile = open(elem_file, 'wb')
pickle.dump(list(elem_key), outputFile)
outputFile.close()
