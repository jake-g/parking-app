import pickle
import marshal

# load data
all_blocks = marshal.load(open('../datastore/allblockfaces.m', 'rb'))
used_keys = pickle.load(open('../datastore/elem_key_2014_2016.p', 'rb'))
print max(used_keys) # keys are 4 digits

# create dictionary of used element keys {element_key:[coordinates]}
error_keys = []
used_blocks = dict()
for key in used_keys:
    key = int(key)
    try:
        used_blocks[key] = all_blocks[key]
    except:     # sometimes keys are recorded that dont exist!
        error_keys.append(key)
        print 'Key %d not found in allblocks' % key

print 'Dict Length : %d' % len(used_blocks)
print 'These keys have errors : '
print error_keys

# Dump used element key dict to pickle
output = open('../datastore/usedblocks.p', 'wb')
pickle.dump(used_blocks, output)
