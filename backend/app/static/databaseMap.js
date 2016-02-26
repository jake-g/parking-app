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
			})
		} else {
			alert("Geolocation is not supported by this browser.");
		}
		return false;
	});

    	//////////////////////////////////////////////////////////////
	// Paystation Lines

	// Checkbox logic
	document.getElementById("showLines").onclick = function() {
		if (this.checked) {
			drawPaystations();
		} else {
			console.log('Refreshing...');
			location.reload(); // TODO clear lines instead
		}
	};

	// Places line (with color and thinckness weighted)
	function drawLine(coords, weight) {
		var size = weight / 1.5
		var hue = 2 * (55 - weight) // big = red small = light_green
		var scaledColor = 'hsl(' + hue + ', 100%, 50%)';
		// scaledColor = 'hsla(160, 100%, 90%, 0.68)';
		var polygon = new google.maps.Polygon({
			clickable: false,
			geodesic: true,
			fillColor: scaledColor,
			fillOpacity: 0.100000,
			paths: coords,
			strokeColor: scaledColor,
			strokeOpacity: 0.800000,
			strokeWeight: size
		});
		polygon.setMap(map);
	}

	// Parse paystation endpoint
	function drawPaystations() {
		// Loop through paystations and draw each block with dynamic color
		$.getJSON(  $SCRIPT_ROOT+ "/paystations", function(result) {
			$.each(result, function(i, data) {
				// data [0:3] start and end coords, [4:5] center coord [6] capacity
				var coords = new Array(); //TODO is this line needed

				var coords = [
					new google.maps.LatLng(data[1], data[0]),
					new google.maps.LatLng(data[3], data[2])
				];

				// Set color based off capacity
				if (data[6] > 0) {
					drawLine(coords, data[6]);
				}
				// console.log(JSON.stringify(data))	// DEBUG
			});
		});
	}

	// Parse Occupancy
	var now = Date.now() / 1000 | 0;
	getOccupancy(1451649600);

	function getOccupancy(time) {
		// Loop through occupancy at given time
		$.getJSON(  $SCRIPT_ROOT+ '/densities?time=' + time, function(result) {
			$.each(result, function(id, data) {
				var density = parseFloat(JSON.stringify(data));
				console.log(id + ' : ' + density);
				coords = getCoords(id);
					console.log('found ' + coords);
					drawLine(coords, density*100);
			});
		});
	}

	//TODO get coords list of ids
	function getCoords(elm_id) {
		$.getJSON(  $SCRIPT_ROOT+ "/paystations", function(result) {
			$.each(result, function(id, data) {
				if (elm_id == id) {
					console.log('looking for : ' + elm_id + ' found : ' + id);
					var coords = [
						new google.maps.LatLng(data[1], data[0]),
						new google.maps.LatLng(data[3], data[2])
					];
					console.log(JSON.stringify(coords));
					return coords
				}
				// return []
			});
		});
	}
	////////////////////////////////////////////////////////////////

	var driveCoordinates = [];
	var drivePath;
<<<<<<< HEAD
	$('#routeToLocation').bind('click', function() {
		nearestPayStationLat = nearestPayStation[0];
		nearestPayStationLng = nearestPayStation[1];
        console.log('look for paystation location at'+ nearestPayStationLat +' ' + nearestPayStationLng);
		$.getJSON($SCRIPT_ROOT + '/route', {
				destinationLat: nearestPayStationLat,
				destinationLon: nearestPayStationLng,
				originLat: $('input[name="latitudeOrigin"]').val(),
				originLon: $('input[name="longitudeOrigin"]').val()
			},
			function(data) {
				driveCoordinates = [];
				console.log(data);
				json_object = JSON.parse(data);
				console.log(json_object);
                //TODO: Iterate over options and create differnet directions
				$(json_object.routes[0].legs[0].steps).each(function(index) {
					latC = ($(this.start_location.lat.toString()));
					lngC = ($(this.start_location.lng.toString()));
					latCoord = latC.selector;
					lngCoord = lngC.selector;
					driveCoordinates.push(new google.maps.LatLng(latCoord, lngCoord));
				});
				destinationLat = nearestPayStation[0];
				destinationLng = nearestPayStation[1];
                console.log("destination Lat = " + destinationLat);
                console.log("destination Lng = " + destinationLng);
				driveCoordinates.push(new google.maps.LatLng(destinationLat, destinationLng));
				drivePath = new google.maps.Polyline({
					path: driveCoordinates,
					geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 2
				});
				addLine();
			})
		return false;
	});
=======
	    
    $('#routeToLocation').bind('click', function() {
        destinationLat= nearestPayStation[0];
        destinationLon= nearestPayStation[1];
        originLat = $('input[name="latitudeOrigin"]').val();
		originLon= $('input[name="longitudeOrigin"]').val();
        
        directionsService.route({
            origin: new google.maps.LatLng(originLat,originLon),
            destination: new google.maps.LatLng(destinationLat,destinationLon),
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives:true
        }, function (response,status){
            if(status == google.maps.DirectionsStatus.OK){
                directionsDisplay.setDirections(response);
            }
            else{
                window.alert('Directions request faield due to ' + status);
            }
        });
        
      
      directionsServiceBus.route({
            origin: new google.maps.LatLng(originLat,originLon),
            destination: new google.maps.LatLng(destinationLat,destinationLon),
            travelMode: google.maps.TravelMode.TRANSIT
        }, function (response,status){
            if(status == google.maps.DirectionsStatus.OK){
                directionsDisplayBus.setDirections(response);
            }
            else{
                window.alert('Directions request faield due to ' + status);
            }
        });
        
    })
    
>>>>>>> origin/master

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
    var directionsDisplay ;
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
	    directionsService  = new google.maps.DirectionsService; 
        directionsServiceBus = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
        directionsDisplayBus = new google.maps.DirectionsRenderer;


        map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: 47.60801,
				lng: -122.335167
			},
			//zoom: 12,//see entire city
            zoom:15, //see middle of downtown
			disableDefaultUI: true,
<<<<<<< HEAD
<<<<<<< HEAD
			scrollwheel: false,
=======
			scrollwheel: true,
>>>>>>> 7bb66bae3d8e670b06af4bb8b4328c31d87e1117
=======
>>>>>>> origin/master
			zoomControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.TOP_RIGHT
			},
		});
       directionsDisplay.setMap(map);
       directionsDisplay.setPanel(document.getElementById('drivingDirections'));
       directionsDisplayBus.setMap(map);
       directionsDisplayBus.setPanel(document.getElementById('busDirections'));

       autoSrc  = new google.maps.places.Autocomplete(/** @type {!HTMLInputElement} */ (document.getElementById("dirSrc")));
       
       
       autoDest = new google.maps.places.Autocomplete(/** @type {!HTMLInputElement} */  (document.getElementById("dirDst")));
       


		map.addListener('click', function(e) {
			placeMarkerAndFindPayStations(e.latLng, map);
		});

		//Gets data points from library and plots the markers
		//radius is gotten from textBox, default is 250m
		function placeMarkerAndFindPayStations(latLng, map) {
			clearMap();
			searchRadius = .25;
			//Queries python API for datapoints
			$.getJSON($SCRIPT_ROOT + '/paystations_in_radius', {
				latitude: latLng.lat,
				longitude: latLng.lng,
				radius: searchRadius
			}, function(data) {
				console.log(data)
				markAndCircle(latLng, searchRadius, map);
				//Loop over each datapoint(payStation)
<<<<<<< HEAD
				nearestPayStation == null;
                nearestPayStation == null;
=======
				nearestPayStation = null;
>>>>>>> origin/master
                $.each(data, function(index) {
					payStationItem = data[index];
					console.log(payStationItem);
					idNumber = index;
<<<<<<< HEAD
                    for (var key in payStationItem) {
						meterLat = payStationItem[0];
						meterLong = payStationItem[1];
						meterMaxOcc = payStationItem[2];
						distance = payStationItem[3];
                        if(nearestPayStation == null){
                            nearestPayStation = payStationItem;
                            nearestPayStationID = idNumber;
                        }
						else if(nearestPayStation[3] > payStationItem[3]){
                            console.log(payStationItem[3]);
						    nearestPayStation = payStationItem;
						    nearestPayStationID= idNumber;
                        }
					}
=======
                    meterLat = payStationItem[5];
                    meterLong = payStationItem[4];
                    meterMaxOcc = payStationItem[6];
                    distance = payStationItem[7];
                    if(nearestPayStation == null){
                        nearestPayStation = payStationItem;
                        nearestPayStationID = idNumber; 
                    }
                    else if(nearestPayStation[7] > distance){
                        console.log(distance);
                        nearestPayStation = payStationItem;
                        nearestPayStationID = idNumber;
                    }
>>>>>>> origin/master
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
	}
});
