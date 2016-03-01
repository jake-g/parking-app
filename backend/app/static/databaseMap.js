// String format to work somewhat like pythons print formatter
String.prototype.format = function() {
  var i = 0,
    args = arguments;
  return this.replace(/{}/g, function() {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

//On document creation adds click event handler to forms
$(function() {
  $('#getGpsLocation').bind('click', function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(data) {
        $('input[name="latitudeOrigin"]').val(data.coords.latitude);
        $('input[name="longitudeOrigin"]').val(data.coords.longitude);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
    return false;
  });

///////////////////////////////////////////////////////////////////////////////
  // Button logic event handlers
  document.getElementById("showLines").onclick = function() {
		clearMap();
		drawPaystations();
  };
  document.getElementById("searchTime").onclick = function() {
      var timestamp = $('input[name="timestamp"]').val();
      if(!timestamp) {
        timestamp = 1455290482; //Date.now() / 1000 | 0; // current unix time
      }  // showDensities(1451649600); 1455290482
			// clearMap();
      showDensities(timestamp);
  };
  document.getElementById("refresh").onclick = function() {
		clearMap();
  };

	// Paystation Lines

// TODO auto fit lines to roads
// TODO info text on line hover
// TODO speedup density draw
// TODO html cal select time

	var lineList = []
  // Places line (with color and thinckness weighted)
  function drawLine(coords, color, size) {
    // console.log('drawing...weight = ' + size + ' : color = ' + color);
    var polygon = new google.maps.Polygon({
      clickable: false,
      geodesic: true,
      fillColor: color,
      fillOpacity: 0.100000,
      paths: coords,
      strokeColor: color,
      strokeOpacity: 0.800000,
      strokeWeight: size
    });
    polygon.setMap(map);
		lineList.push(polygon)
  }

  // Parse paystation endpoint
  function drawPaystations() {
    // Loop through paystations and draw each block with dynamic color
    $.getJSON($SCRIPT_ROOT + "/paystations", function(result) {
      $.each(result, function(i, data) {
        coords = [
          new google.maps.LatLng(data[1], data[0]),
          new google.maps.LatLng(data[3], data[2])
        ];

        if (data[6] > 0) {
          // Calculate size and color of line
          var size = data[6] / 1.5;
          var hue = 2 * (55 - data[6]); // big = red small = light_green
          var color = 'hsl(' + hue + ', 100%, 50%)';
          drawLine(coords, color, size);    // Set color based off capacity
        }
      });
    });
  }

  // Parse Occupancy
  var densities = new Map();
  function showDensities(time) {
    // Loop through occupancy at given time
    $.getJSON($SCRIPT_ROOT + '/densities?time=' + time, function(density_json) {
      $.each(density_json, function(id, data) {
        var density = parseFloat(JSON.stringify(eval(data)));
        densities.set(id, density);
      });
      var elm_ids = Array.from(densities.keys());

      // draw line colored based off density
      if (elm_ids.length > 0) {
        url = $SCRIPT_ROOT + "/paystations?element_keys=" + elm_ids.join('%20');
        // console.log(url);
        // console.log(densities);
        $.getJSON(url, function(paystation_json) {
          $.each(paystation_json, function(id, data) {
            coords = [
              new google.maps.LatLng(data[1], data[0]),
              new google.maps.LatLng(data[3], data[2])
            ];
            // scale so red is full, green empty
            var hue = parseInt(130*(1-densities.get(id)));
            hue = Math.max(0, hue); //TODO wtf, some densities are > 1 thus hue < 0
            var color = 'hsl(' + hue + ', 100%, 50%)';
            var size = data[6] / 1.8;
            // console.log(densities.get(id) + ' : ' + coords);
            // console.log(densities.get(id) + '-->' + color);
            drawLine(coords, color, size);
          });
        });
      } else {
        alert("No info found at that time");
      }
    });
  }
////////////////////////////////////////////////////////////////////////////////

  var driveCoordinates = [];
  var drivePath;

  $('#routeToLocation').bind('click', function() {
    destinationLat = nearestPayStation[0];
    destinationLon = nearestPayStation[1];
    originLat = $('input[name="latitudeOrigin"]').val();
    originLon = $('input[name="longitudeOrigin"]').val();

    directionsService.route({
      origin: new google.maps.LatLng(originLat, originLon),
      destination: new google.maps.LatLng(destinationLat, destinationLon),
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request faield due to ' + status);
      }
    });


    directionsServiceBus.route({
      origin: new google.maps.LatLng(originLat, originLon),
      destination: new google.maps.LatLng(destinationLat, destinationLon),
      travelMode: google.maps.TravelMode.TRANSIT
    }, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplayBus.setDirections(response);
      } else {
        window.alert('Directions request faield due to ' + status);
      }
    });

  });


  function addLine() {
    drivePath.setMap(map);
  }

  function removeLine() {
    drivePath.setMap(null);
  }
  //!!@!@!?@!?@?!@?!?///
  var map;
  var directionsService;
  var directionsServiceBus;
  var directionsDisplay;
  var directionsDisplayBus;
  var markersList = [];
  var infoWindowList = [];
  var destination = {
    lat: 47.60801,
    lng: -122.335167
  };
  var nearestPayStation;
  var nearestPayStationID;

  var autoSrc;
  var autoDst;
  //Creates map over seattle and adds click dlistener
  window.initMap = function() {
    directionsService = new google.maps.DirectionsService();
    directionsServiceBus = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplayBus = new google.maps.DirectionsRenderer();


    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 47.60801,
        lng: -122.335167
      },
      //zoom: 12,//see entire city
      zoom: 15, //see middle of downtown
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      },
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('drivingDirections'));
    directionsDisplayBus.setMap(map);
    directionsDisplayBus.setPanel(document.getElementById('busDirections'));

    autoSrc = new google.maps.places.Autocomplete( /** @type {!HTMLInputElement} */ (document.getElementById("dirSrc")));


    autoDest = new google.maps.places.Autocomplete( /** @type {!HTMLInputElement} */ (document.getElementById("dirDst")));



    map.addListener('click', function(e) {
      placeMarkerAndFindPayStations(e.latLng, map);
    });

    //Gets data points from library and plots the markers
    //radius is gotten from textBox, default is 250m
    function placeMarkerAndFindPayStations(latLng, map) {
      clearMap();
      searchRadius = 0.25;
      //Queries python API for datapoints
      $.getJSON($SCRIPT_ROOT + '/paystations_in_radius', {
        latitude: latLng.lat,
        longitude: latLng.lng,
        radius: searchRadius
      }, function(data) {
        // console.log(data);
        markAndCircle(latLng, searchRadius, map);
        //Loop over each datapoint(payStation)
        nearestPayStation = null;
        $.each(data, function(index) {
          payStationItem = data[index];
          // console.log(payStationItem);
          idNumber = index;
          meterLat = payStationItem[5];
          meterLong = payStationItem[4];
          meterMaxOcc = payStationItem[6];
          distance = payStationItem[7];
          if (nearestPayStation === null) {
            nearestPayStation = payStationItem;
            nearestPayStationID = idNumber;
          } else if (nearestPayStation[7] > distance) {
            console.log(distance);
            nearestPayStation = payStationItem;
            nearestPayStationID = idNumber;
          }
          //Adds marker and infowindow  + click listners for each payStation
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(meterLat, meterLong),
            map: map,
            icon: $SCRIPT_ROOT + '/static/parkingBlue.png'
              //have different colored parking .png files for busy/notbusy/somewhat busy
          });
          //TODO: Make a better looking Info window
          infoWindowContent = '<p>parkingMeter {} has a max capacity {} and is {} km away from destination </p>'.format(idNumber, meterMaxOcc, distance);
          var infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
          });
          marker.addListener('click', function() {
            for (var i = 0; i < infoWindowList.length; i++) {
              infoWindowList[i].close();
            }
            infoWindow.open(map, marker);
          });
          markersList.push(marker);
          infoWindowList.push(infoWindow);

        });
        //console.log(nearestPayStation[4]);
      });
      return false;
    }

    //Clerars the map of markers
    function clearMap() {

      for (var i = 0; i < markersList.length; i++) {
        markersList[i].setMap(null);
      }
      if (drivePath) {
        removeLine();
      }
      infoWindowList = [];
      markersList = [];
    }


    //takes a latLong object , radius , and map
    //draws a maker and circle around point
    function markAndCircle(searchCoord, searchRadius, map) {
      var marker = new google.maps.Marker({
        position: searchCoord,
        map: map,
      });
      var cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: searchCoord,
        radius: searchRadius * 1000 //radius is in meters
      });
      destination.lat = searchCoord.lat;
      destination.lng = searchCoord.lng;
      markersList.push(marker);
      //Adds circle into markerList so that it gets cleared at the same time
      markersList.push(cityCircle);
    }
  };
	//Clears the map of markers
	function clearMap() {
		for (var j = 0; j < lineList.length; j++) {
			lineList[j].setMap(null);
		}
		for (var i = 0; i < markersList.length; i++) {
			markersList[i].setMap(null);
		}
		if (drivePath) {
			removeLine();
		}
		infoWindowList = [];
		markersList = [];
		lineList = [];
	}

});
