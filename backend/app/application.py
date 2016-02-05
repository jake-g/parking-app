from flask import Flask, request, abort
from flask.ext.mysql import MySQL
import time
import datetime
import math

app = Flask(__name__)
mysql = MySQL()
 
app.config['MYSQL_DATABASE_USER'] = 'parking'
app.config['MYSQL_DATABASE_PASSWORD'] = 'sdotpark1ng'
app.config['MYSQL_DATABASE_DB'] = 'parking'
app.config['MYSQL_DATABASE_HOST'] = 'parking-cluster.cluster-c9q5edmigsud.us-west-2.rds.amazonaws.com'
app.config['MYSQL_DATABASE_PORT'] = 3306
mysql.init_app(app)

conn = mysql.connect()
cur = conn.cursor()

@app.route('/', methods=['GET', 'POST'])
def index():
    return str([(k, v) for k, v in request.args.iteritems()])

@app.route('/paystations', methods=['GET', 'POST'])
def get_paystations():
    element_keys = request.args.get('element_keys', None)
    query = "SELECT * FROM pay_stations"
    if element_keys:
        query += " WHERE element_key IN ({0})" 
        cur.execute(query.format(', '.join(element_keys.split())))
    else:
        cur.execute(query)
    return str(cur.fetchall())

@app.route('/paystations_in_radius', methods=['GET', 'POST'])
def get_paystations_in_radius():
    lat = request.args.get('latitude', None)
    lon = request.args.get('longitude', None)
    rad = request.args.get('radius', None)
    if not lon or not lat or not rad:
        abort(400)

    lat = float(lat)
    lon = float(lon)
    rad = float(rad)
    R = 6371 

    maxlat = lat + math.degrees(rad/R)
    minlat = lat - math.degrees(rad/R)

    maxlon = lon + math.degrees(rad/R/math.cos(math.radians(lat)))
    minlon = lon - math.degrees(rad/R/math.cos(math.radians(lat)))

    query = "SELECT element_key, latitude, longitude, max_occupancy, \
                acos(sin({0})*sin(radians(latitude)) + cos({0})*cos(radians(latitude))*cos(radians(longitude)-{1})) * {2} AS D \
            FROM ( \
                SELECT* \
                FROM pay_stations\
                WHERE latitude BETWEEN {3} AND {4} \
                  AND longitude BETWEEN {5} AND {6} \
            ) AS firstcut \
            WHERE acos(sin({0})*sin(radians(latitude)) + cos({0})*cos(radians(latitude))*cos(radians(longitude)-{1})) * {2} < {7} \
            ORDER BY D"

    cur.execute(query.format(math.radians(lat), math.radians(lon), R, minlat, maxlat, minlon, maxlon, rad))
    return str(cur.fetchall())

@app.route('/transactions')
def get_transactions(self, start=631180800, end=int(time.mktime(datetime.datetime.now().timetuple()))):
    pass

if __name__ == "__main__":
    app.debug = True
    app.run()
