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
             navigator.geolocation.getCurrentPosition( function(data) {
                   $('input[name="latitudeOrigin"]').val(data.coords.latitude);
                   $('input[name="longitudeOrigin"]').val(data.coords.longitude);
            })
            }
         else {
             alert( "Geolocation is not supported by this browser.");
         }
        return false;
    });

<<<<<<< HEAD
//On document creation adds click event handler to forms
$(function() {
	$('a#calculate').bind('click', function() {
		$.getJSON($SCRIPT_ROOT + '/paystations_in_radius', {
			latitude: $('input[name="latitude"]').val(),
			longitude: $('input[name="longitude"]').val(),
			radius: $('input[name="radius"]').val()
		}, function(data) {
			$.each(data.result, function(index) {
				payStationItem = data.result[index]
				console.log(index);
				idNumber = payStationItem[0];
				meterLat = payStationItem[1];
				meterLong = payStationItem[2];
				meterMaxOcc = payStationItem[3];
				distance = payStationItem[4];
				text = '<li> PayStation {} is located at ({} , {}), maximum occupancy is {} cars and is {} km away'.format(idNumber, meterLong, meterLat, meterMaxOcc, distance);
				$("#resultList").after(text);
=======
      var driveCoordinates = [];
      var drivePath;
    $('#routeToLocation').bind('click', function() {
        nearestPayStationLat = nearestPayStation[1];
        nearestPayStationLng = nearestPayStation[2];
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
>>>>>>> origin/master

               $(json_object.routes[0].legs[0].steps).each(function (index){
                    latC = ($(this.start_location.lat.toString()));
                    lngC = ($(this.start_location.lng.toString()));
                    latCoord = latC.selector;
                    lngCoord = lngC.selector;
                    driveCoordinates.push( new google.maps.LatLng(latCoord,lngCoord));
                });
                destinationLat = nearestPayStation[1];
                destinationLng = nearestPayStation[2];
                driveCoordinates.push( new google.maps.LatLng(destinationLat,destinationLng));
                drivePath = new google.maps.Polyline({
                    path : driveCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                    addLine();
                })
        return false;
    });

    function addLine(){
        drivePath.setMap(map);
    }

<<<<<<< HEAD
	var map;
	var markersList = [];
	var infoWindowList = [];
	//Creates map over seattle and adds click listener
	window.initMap = function() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: 47.60801,
				lng: -122.335167
			},
			zoom: 15,
			disableDefaultUI: true,
			scrollwheel: true
		});
		map.addListener('click', function(e) {
			placeMarkerAndFindPayStations(e.latLng, map);
		});

		var url = "https://raw.githubusercontent.com/ngdaniel/parking-project/master/backend/app/static/streets.json";

		$.getJSON(url, function(data) {

			//  Parse the Linestring field into an array of LatLngs
			$.each(data.data, function(index, record) {
				var mypath = new Array();
				line = JSON.parse(record.Linestring);
				//  Parse the array of LatLngs into Gmap points
				for (var i = 0; i < line.length; i++) {
					//Tokenise the coordinates
					var coords = (new String(line[i])).split(",");
					mypath.push(new google.maps.LatLng(coords[1], coords[0]));
				}
				var polyline = new google.maps.Polyline({
					path: mypath,
					strokeColor: '#ff0000',
					strokeOpacity: 1.0,
					strokeWeight: 3
				});
				polyline.setMap(map);
			});

		});

		//Gets data points from library and plots the markers
		//radius is gotten from textBox, default is 250m
		function placeMarkerAndFindPayStations(latLng, map) {
			clearMap();
			searchRadius = $('input[name="radius"]').val();
			if (searchRadius == 0) {
				searchRadius = .25
			}
			//Queries python API for datapoints
			$.getJSON($SCRIPT_ROOT + '/paystations_in_radius', {
				latitude: latLng.lat,
				longitude: latLng.lng,
				radius: searchRadius
			}, function(data) {
				markAndCircle(latLng, searchRadius, map);
				//Loop over each datapoint(payStation)
				$.each(data.result, function(index) {
					payStationItem = data.result[index]
					idNumber = payStationItem[0];
					meterLat = payStationItem[1];
					meterLong = payStationItem[2];
					meterMaxOcc = payStationItem[3];
					distance = payStationItem[4];
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
			});
			return false;
		}
=======
    function removeLine(){
        drivePath.setMap(null);
    }
    //!!@!@!?@!?@?!@?!?///
    var map;
    var markersList = [];
    var infoWindowList = [];
    var destination = {lat: 47.60801, lng: -122.335167};
    var nearestPayStation ; 
    //Creates map over seattle and adds click dlistener
    window.initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 47.60801, lng: -122.335167},
            zoom: 15, 
            disableDefaultUI: true,
            scrollwheel:false,
            zoomControl: true,
            zoomControlOptions: {
                 position: google.maps.ControlPosition.TOP_RIGHT
            },
        });
        map.addListener('click',function(e) {
            placeMarkerAndFindPayStations(e.latLng,map);
        });
         
        //Gets data points from library and plots the markers 
        //radius is gotten from textBox, default is 250m 
        function placeMarkerAndFindPayStations(latLng,map){
             clearMap();
             searchRadius = .25;
             //Queries python API for datapoints
             $.getJSON($SCRIPT_ROOT + '/paystations_in_radius', {
                latitude: latLng.lat,
                longitude: latLng.lng,
                radius: searchRadius
                }, function(data) {
                console.log(data)
                markAndCircle(latLng,searchRadius,map);
                //Loop over each datapoint(payStation)
                console.log(data);
                //nearestPayStation = data.result[0];
                $.each(data, function(index){
                    payStationItem = data[index]
                    console.log(payStationItem)
                    for (var key in payStationItem) {
                        idNumber=key
                        meterLat =payStationItem[key][0];
                        meterLong = payStationItem[key][1];
                        meterMaxOcc =payStationItem[key][2];
                        distance =payStationItem[key][3];

                        //if(nearestPayStation[4] > payStationItem[3]){
                         //   nearestPayStation = payStationItem;
                        //}
                    }
                    //Adds marker and infowindow  + click listners for each payStation
                    var marker = new google.maps.Marker({
                        position : new google.maps.LatLng(meterLat,meterLong),
                        map: map,
                        icon:$SCRIPT_ROOT + '/static/parkingBlue.png'
                        //have different colored parking .png files for busy/notbusy/somewhat busy
                     });
                    //TODO: Make a better looking Info window
                     infoWindowContent = '<p>parkingMeter {} has a max capacity {} and is {} km away from destination </p>'.format(idNumber,meterMaxOcc,distance); 
                    var infoWindow = new google.maps.InfoWindow({
                        content: infoWindowContent
                     });
                     marker.addListener('click',function(){
                        for(var i = 0; i <infoWindowList.length; i ++){
                             infoWindowList[i].close();
                    }
                        infoWindow.open(map,marker);
                    });
                     markersList.push(marker);
                     infoWindowList.push(infoWindow);

                });
              //console.log(nearestPayStation[4]);
              });
              return false;
        }
  
        //Clerars the map of markers
        function clearMap(){
            for(var i = 0; i <markersList.length; i ++){
                markersList[i].setMap(null);
                }
                if(drivePath){removeLine(); }
                infoWindowList = [];
                markersList = [];
        }
>>>>>>> origin/master


        //takes a latLong object , radius , and map 
        //draws a maker and circle around point
       function markAndCircle(searchCoord,searchRadius,map){
            var marker = new google.maps.Marker({
                position :searchCoord ,
                map: map,
                 });
            var cityCircle = new google.maps.Circle({
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#FF0000',
              fillOpacity: 0.35,
              map: map,
              center:searchCoord ,
              radius: searchRadius*1000 //radius is in meters
              });
              destination.lat= searchCoord.lat;
              destination.lng = searchCoord.lng;
            markersList.push(marker);
            //Adds circle into markerList so that it gets cleared at the same time
            markersList.push(cityCircle);
           }
    }
  });
    
