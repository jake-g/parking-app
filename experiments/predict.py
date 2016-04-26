import matplotlib.pylab as plt
import sys
import pandas as pd
import numpy as np
import random
import pickle

from sklearn.metrics import mean_squared_error
from sklearn.metrics import accuracy_score

from sklearn.ensemble import GradientBoostingRegressor
from sklearn.ensemble.partial_dependence import plot_partial_dependence
from sklearn.ensemble import RandomForestRegressor

import warnings
warnings.filterwarnings('ignore')
from matplotlib.pylab import rcParams
rcParams['figure.figsize'] = 15, 9  # plot window size


# Import pandas dataframe
def load_data(path, alt_start='', alt_end=''):
    ts = pd.read_pickle(path)
    ts = ts.dropna()  # remove nan which are free parking days
    # Set the date range. alt_start/end is optional
    if alt_start is '':
        start = pd.to_datetime(ts.index[0], format='%m-%d-%Y')
    else:
        start = pd.to_datetime(alt_start, format='%m-%d-%Y')
    if alt_end is '':
        end = pd.to_datetime(ts.index[-1], format='%m-%d-%Y')
    else:
        end = pd.to_datetime(alt_end, format='%m-%d-%Y')
    print 'Range :', start, 'to', end
    ts = ts[start:end]
    return ts

# Save prediction dataframe
def save_prediction(pred, output)   :
    print 'Saving prediction as %s' % output
    pickle.dump(pred, open(output, 'wb'))

# Generate features
def init_features(ts):
    X = pd.DataFrame()
    X['month'] = ts.index.month
    # X['day'] = ts.index.day
    # X['rain'] = ts['rain'].values
    X['weekday'] = ts.index.weekday
    X['hour'] = ts.index.hour
    X.index = ts.index
    return X


# Train (n%) Test ((1-n)%) Random
def train_stochastic(X, Y, percent):
    rows = random.sample(X.index, int(len(X) * 0.80))
    x_train, y_train = X.ix[rows], Y.ix[rows]
    x_test, y_test = X.drop(rows), Y.drop(rows)
    return [x_train, y_train, x_test, y_test]


# Train historical data and predict the prediction window
def train_history(X, Y, predict_window):
    n_days = (X.index[-1] - X.index[0]).days
    percent_train = predict_window / float(n_days)
    split_i = int(len(X) * (1 - percent_train))
    x_train, y_train = X.ix[0:split_i - 1], Y.ix[0:split_i - 1]
    x_test, y_test = X.ix[split_i:len(X)], Y.ix[split_i:len(X)]
    return [x_train, y_train, x_test, y_test]


# Prediction Error
def print_error(prediction, y_test):
    mse = mean_squared_error(y_test, prediction)
    r2 = np.mean(abs(y_test - prediction))
    print("MSE: %.4f" % mse)
    print("Mean Error (R2): %.4f cars" % r2)
    print "Accuracy : %0.4f" % float(accuracy_score(prediction, y_test))


# Plot input data
def plot_input(ts):
    ts.plot(legend=True, kind='area', stacked=False)
    plt.ylabel('Transactions (hrs)')
    plt.title('Input Data')

# Plot Predicted data over actual
def plot_prediction(pred_df, y_test):
    plt.figure()
    ax = y_test.plot(legend=True, label='actual', kind='area', stacked=False)
    pred_df.plot(ax=ax, kind='area', stacked=False)


# Plot feature impact
def feature_importance(results, X):
    feature_importance = results.feature_importances_  # make importances relative to max importance
    feature_importance = 100.0 * (feature_importance / feature_importance.max())
    sorted_idx = np.argsort(feature_importance)
    pos = np.arange(sorted_idx.shape[0]) + .5
    plt.figure()
    plt.barh(pos, feature_importance[sorted_idx], align='center')
    plt.yticks(pos, X.columns[sorted_idx])
    plt.xlabel('Relative Importance')
    plt.title('Feature Importance')
    plt.show()


# Plot feature dependence
def feature_dependence(results, X, x_train):
    # print results.feature_importances_
    plot_partial_dependence(results, x_train,
                            features=np.arange(0, len(X.columns)),
                            feature_names=x_train.columns, n_cols=1)
    plt.show()


# Plot training vs actual deviance
def training_deviance(results, x_test, y_test, model_params):
    test_score = np.zeros((model_params['n_estimators'],), dtype=np.float64)
    for i, y_pred in enumerate(results.staged_decision_function(x_test)):
        test_score[i] = results.loss_(y_test, y_pred)

    # Plot
    plt.figure()
    plt.title('Deviance')
    plt.plot(np.arange(model_params['n_estimators']) + 1, results.train_score_, 'b-',
                    label='Training Set Deviance')
    plt.plot(np.arange(model_params['n_estimators']) + 1, test_score, 'r-',
                    label='Test Set Deviance')
    plt.legend(loc='upper right')
    plt.xlabel('Boosting Iterations')
    plt.ylabel('Deviance')


# TODO for input ts, have col be titled by elm id
# TODO lookup size of elm_id http://parking-dev.us-west-2.elasticbeanstalk.com/paystations?element_keys=76429
# TODO Better metric for counting density (use size of block)
# TODO calibrate hyper params
def main():
    # Init Data
    # global data_path
    data_path = 'datastore/paystations/'
    data_file = '76429_1-2013-to-4-2016.d'
    elm_id = 76429
    alt_start = '2-2-2013' # earliest date, optional
    alt_end = '12-20-2015'  # optional
    if len(sys.argv) > 1:
        data_file = sys.argv[1]

    ts = load_data(data_path + data_file, alt_start, alt_end)
    X = init_features(ts)  # features considered for prediction
    Y = ts['density']  # variable to predict


    # Train Model
    # x_train, y_train, x_test, y_test = train_stochastic(X, Y, 0.8)  # random sample (80% train)
    predict_window = 7  # predict 1 week
    x_train, y_train, x_test, y_test = train_history(X, Y, predict_window)  # train past data

    # Gradient boosting
    model_params = {'n_estimators': 200, 'max_depth': 6,
                    'learning_rate': 0.03, 'loss': 'huber', 'alpha': 0.95}
    results = GradientBoostingRegressor(**model_params).fit(x_train, y_train)

    # Random forests
    # results = RandomForestRegressor(n_estimators=10).fit(x_train, y_train)    # not as good..?

    # Predict Dataframe
    y_pred = np.round(results.predict(x_test))  # integers
    y_pred[y_pred < 0] = 0  # no negative
    pred_gb = pd.DataFrame(y_pred, index=x_test.index, columns=['prediction'])
    # output_file = data_path + '%s_predicted_%d_days_from_%s' % \
    #                           (str(elm_id), predict_window, str(pred_gb.index[0]).split()[0]) # output path
    # save_prediction(pred_gb, output_file);

    # Results
    print_error(y_pred, y_test)
    print "Score : %0.4f" % float(results.score(x_test, y_test))
    plot_input(Y)
    plot_prediction(pred_gb, y_test)
    feature_importance(results, X)
    feature_dependence(results, X, x_train)
    training_deviance(results, x_test, y_test, model_params)


if __name__ == "__main__":
    main()
