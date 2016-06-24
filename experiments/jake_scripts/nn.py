input_04_08 = np.loadtxt('./data/input_04_08.csv', delimiter=',')
input_09 = np.loadtxt('./data/input_09.csv', delimiter=',')
output_04_08 = np.loadtxt('./data/output_04_08.csv', delimiter=',')
output_09 = np.loadtxt('./data/output_09.csv', delimiter=',')

input_04_08 = input_04_08 / input_04_08.max(axis=0)
input_09 = input_09 / input_09.max(axis=0)
output_04_08 = output_04_08 / output_04_08.max(axis=0)
output_09 = output_09 / output_09.max(axis=0)
ds = SupervisedDataSet(2, 1)

for x in range(0, len(ts)):
    ds.addSample(input_04_08[x], output_04_08[x])

n = FeedForwardNetwork()
inLayer = LinearLayer(2)
hiddenLayer = TanhLayer(25)
outLayer = LinearLayer(1)
n.addInputModule(inLayer)
n.addModule(hiddenLayer)
n.addOutputModule(outLayer)
in_to_hidden = FullConnection(inLayer, hiddenLayer)
hidden_to_out = FullConnection(hiddenLayer, outLayer)
n.addConnection(in_to_hidden)
n.addConnection(hidden_to_out)
n.sortModules()

trainer = BackpropTrainer(n, ds, learningrate=0.01, momentum=0.1)

for epoch in range(0, 100000000): 
    if epoch % 10000000 == 0:
        error = trainer.train()  
        print 'Epoch: ', epoch
        print 'Error: ', error


result = np.array([n.activate(x) for x in input_09])