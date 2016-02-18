// var map;
function initMap() {
	// Create Map
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 47.60801,
			lng: -122.335167
		},
		zoom: 15,
		disableDefaultUI: true,
		scrollwheel: true
	});

// 	// draw single line
// 	var data = [-122.33054937746653, 47.601822730001246, -122.3308297335514, 47.602016542002914]
// 	var coords = [
// 		new google.maps.LatLng(data[1], data[0]),
// 		new google.maps.LatLng(data[3], data[2])
// 	];
//
// 	var polygon = new google.maps.Polygon({
// 		clickable: false,
// 		geodesic: true,
// 		fillColor: "#FF0000",
// 		fillOpacity: 0.300000,
// 		paths: coords,
// 		strokeColor: "#FF0000",
// 		strokeOpacity: 1.000000,
// 		strokeWeight: 3
// 	});
// 	polygon.setMap(map);
// }


	$.getJSON("http://127.0.0.1:5000/paystations", function(result) {
		$.each(result, function(i, line) {
			var coords = new Array();

			console.log(JSON.stringify(line))
			//  [
			// 	new google.maps.LatLng(line[0], line[1]),
			// 	new google.maps.LatLng(line[2], line[3])
			// ];
			var coords = [
			    {lat: line[0], lng: line[1]},
			    {lat: line[2], lng: line[3]}
			  ];
			console.log(JSON.stringify(coords));

			var polygon = new google.maps.Polygon({
				clickable: false,
				geodesic: true,
				fillColor: "#FF0000",
				fillOpacity: 0.300000,
				paths: coords,
				strokeColor: "#FF0000",
				strokeOpacity: 1.000000,
				strokeWeight: 3
			});
			polygon.setMap(map);
	// 		var mypath = new Array();
	// 		line = JSON.parse(field.Linestring);
	// 		//Parse the array of LatLngs into Gmap points
	// 		for (var i = 0; i < line.length; i++) {
	// 			//Tokenise the coordinates
	// 			var coords = (new String(line[i])).split(",");
	// 			console.log(coords);
			// }
		});
	});
}
	// var data = [-122.33054937746653, 47.601822730001246, -122.3308297335514, 47.602016542002914]
	// // var mypath = new Array();
	// console.log(data);
	// // mypath.push(new google.maps.LatLng(data.slice(0,2), data.slice(2,4)));
	// var mypath = [
  //   {lat: data[0], lng: data[1]},
  //   {lat: data[2], lng: data[3]},
  // ];
	// console.log(mypath);
	// var polyline = new google.maps.Polyline({
	// 	path: mypath,
	// 	strokeColor: '#ff0000',
	// 	strokeOpacity: 1.0,
	// 	strokeWeight: 3
	// });
	// polyline.setMap(map);

	// Add lines
	// var url = "http://127.0.0.1:5000/paystations"
	// $.getJSON(url, function(data) {
		//  Parse the Linestring field into an array of LatLngs
		// $.each(data, function(index, line) {
			// var mypath = new Array();
			// line = JSON.parse(record);
			// console.log(record);
			// console.log(line);
			// new google.maps.LatLng(line[0], line[1]));
			//Tokanise coordinates
			// for var i = 0; i < line.length; i++) {
			// 	var coords = (new String(line[i])).split(",");
			// 	mypath.push(new google.maps.LatLng(coords[1], coords[0]));
			// }
			// Parse the array of LatLngs into Gmap points
			// for (var i = 0; i < line.length; i++) {
			// 	//Tokenise the coordinates
			// 	var coords = (new String(line[i])).split(",");
			// 	mypath.push(new google.maps.LatLng(coords[1], coords[0]));
			// }
			// var polyline = new google.maps.Polyline({
			// 	path: mypath,
			// 	strokeColor: '#ff0000',
			// 	strokeOpacity: 1.0,
			// 	strokeWeight: 3
			// });
			// polyline.setMap(map);
	// 	});
	// });
