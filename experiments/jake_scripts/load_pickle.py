import pickle

path = '../datastore/elem_key_2014_2016.p'
data = pickle.load(open(path, "rb"))
print 'Data length : %d' % len(data)
print data
