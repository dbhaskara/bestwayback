// inject Google Maps API into html file
var imported = document.createElement('script');
imported.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyATStvJFHPadqlOozhMkFTykKpMSdpzlns';
document.head.appendChild(imported);

// global variables
var pos = {};
var crimes = {};
getCrimes();
var map = {};
var markers = [];


// myMap uses Google Maps API to render an interactive map 
function myMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;

  var mapCanvas = document.getElementById("map");
  var myCenter=new google.maps.LatLng(38.02768,-78.48915);
  var mapOptions = {center: myCenter, zoom: 20};
  map = new google.maps.Map(mapCanvas, mapOptions);

  var lat = "";
  var lng = "";

  infoWindow = new google.maps.InfoWindow;
  directionsDisplay.setMap(map);

  var endHere = document.getElementById("dest").value;
  
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(map, event.latLng);
  });
  
  //find location
  if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            lat = position.coords.latitude;
            lng = position.coords.longitude;
            infoWindow.setPosition(pos);
            infoWindow.setContent('Current Location Found.');
            
            //var endHere = document.getElementById("dest");
            calculateAndDisplayRoute(directionsService, directionsDisplay, "" + lat + ", " + lng, endHere);
            
            infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}


// called when user input location has error
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}   


// placeMarker places a location marker on the map and displays latitude/longitude values as well 
// as a danger index value. This function is called on click for any point on the interactive map
// param: map (Google Maps API map)
// param: location (Google Maps API LatLng object)
function placeMarker(map, location) {

  // clear previous markers
  for(var i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }

  var danger = getPointSafety({
    "lat" : location.lat(),
    "lng" : location.lng()
  });
  
  // display integer value to improve UX
  danger = Math.floor(danger);
  
  var dangerString = "";
  var markerString = "";
  
  // color of displayed danger index determined by level of danger
  if (danger < 10) { 
    dangerString = "<b><br><br>Risk: " + "<p style='color:green;'>" + danger + "</p></b>";
    markerString = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }
  else if (danger < 60) {
    dangerString = "<b><br>Danger: " + "<p style='color:orange;'>" + danger + "</p></b>";
    markerString = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  }
  else {
    dangerString = "<b><br>Risk: " + "<p style='color:red;'>" + danger + "</p></b>";
    markerString = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }

  // display marker
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: markerString
  });
  markers.push(marker);

  // display information box
  var infowindow = new google.maps.InfoWindow({
    maxWidth: 200,
    content: 'Latitude: ' + location.lat() + '<br>Longitude: ' + location.lng() + dangerString 
    
  });
  infowindow.open(map,marker);
}


// dangerMarker displays the danger value for a given route. This method is called when routes
// are created and displayed.
// param: map (Google Maps API map)
// param: location (Google Maps API LatLng object)
// param: safety (number: safety index returned by getRouteSafety)
function dangerMarker(map, location, safety) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  var infowindow = new google.maps.InfoWindow({
    // display safety value as integer for better UX
    content: '<br>Danger: ' + Math.floor(safety/100); 
  });

  // determine color of marker using safety value
  if(Math.floor(safety) < 1000) {
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
  } else if (Math.floor(safety) < 2000 && Math.floor(safety) > 1000) {
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png')
  } else {
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
  }
  infowindow.open(map,marker);
}


// Given a two locations, calculateAndDisplayRoute calculates possible walking routes to get from
// one location to the other. The method gets danger values for each route and displays them on the
// interactive map with information regarding safety.
// param: directionsService (Google Maps API DirectionsService object)
// param: directionsDisplay (Google Maps API DirectionsDisplay object)
// param: start (Google Maps API LatLng object: starting location for the route)
// param: endt (Google Maps API LatLng object: ending location for the route)
function calculateAndDisplayRoute(directionsService, directionsDisplay, start, end) {
        // get routes from Google Maps
        directionsService.route({
          origin: start,
          destination: end,
          travelMode: 'WALKING',
          provideRouteAlternatives: true
        }, function(response, status) { // calculate and display danger values inside callback
          if (status === 'OK') {
            // determine color of route on gradient scale using safety rating
            for(var i = 0; i < response.routes.length; i++) {
              var safety = getRouteSafety(response.routes[i]);
              var red = 'ff';
              var green = '00';
              var blue = '00';
              if (safety <= 2000) { // default color is most dangerous
                if (safety >= 1000) {
                  var redNumber = Math.floor(255*(safety-1000)/1000);
                  var greenNumber = 128 + Math.floor(37*(safety-1000)/1000);
                  red = '' + redNumber.toString(16); // convert to hex
                  green = '' + greenNumber.toString(16); // convert to hex
                } else {
                  var greenNumber = 165 - Math.floor(165*(safety/1000));
                  green = '' + greenNumber.toString(16); // convert to hex
                }
              }
              var color = "#" + red + green + blue;
              // display route on interactive map
              new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                routeIndex: i,
                polylineOptions: {
                  strokeColor: color
                }
              });
              // display marker with route
              dangerMarker(map,response.routes[i].overview_path[20], getRouteSafety(response.routes[i]));
            }
          } else {
            window.alert('Directions request failed due to ' + status);
          }
   });
}


// getRouteSafety takes in a route and returns the safety value for that route
// param: routeArray (Array of Google Maps API LatLng objects)
// return: rating (number)
function getRouteSafety(routeArray) {
  var rating = 0.0;
  for(var i = 0; i < routeArray.overview_path.length; i+=3) {
    var destination = {
      "lat" :  routeArray.overview_path[i].lat(),
      "lng" :  routeArray.overview_path[i].lng()
    } 
    rating += getPointSafety(destination);
  }
  rating = rating / routeArray.overview_path.length;
  rating = rating * routeArray.legs[0].distance.value;
  return rating;
}


// getCrimes pulls the crime data from the database and stores it globally when the page is loaded 
function getCrimes() {
  $.ajax({ 
    type: 'GET', 
    url: 'https://best-way-back.firebaseio.com/crimes.json', 
    dataType: 'json',
    success: function (data) { 
      console.log("Data pulled successfully");
      crimes = data;
    }
  });
}


// getPointSafety takes in a point and returns its safety rating
// param: point (Object with 'lat' and 'lng' keys)
// return: rating (number)
function getPointSafety(point) { // expect LatLong value
  var rating = 0.0;
  var pLat = point['lat']; 
  var pLng = point['lng'];

  // data is initially sorted by longitude value. use findStartIndex to figure out what index of 'crimes'
  // array to start iteration. (Prevents unnecessary iterations through crimes > .023 longitude from the give point.
  var i = findStartIndex(pLng - .023);
  for ( ; i < Object.keys(crimes).length && crimes[Object.keys(crimes)[i]].longitude < pLng + 0.023 ; i++) {
    var lat2 = crimes[Object.keys(crimes)[i]].latitude;  
    // factors crime into safety rating if both latitude and longitude are within .023 degrees
    if (Math.abs(lat2 - pLat) < 0.023) {
      var d = distance(pLat, pLng, lat2, crimes[Object.keys(crimes)[i]].longitude)
      if (d < .04) {
        d = 0.4; // all distances within .04 count the same
      }
      rating += 1/d;
    }
  }

/*  Brute force algorithm:
    for (var i = 0; i < Object.keys(crimes).length; i++) {
    var crime = crimes[Object.keys(crimes)[i]];
    var d = distance(pLat, pLng, crime['latitude'], crime['longitude']);    
    if (d < 2.0) {
      if (d < 0.4) {
        d = 0.4 // All distances within 200 ft of a crime count the same.
      }
      rating += d;
    }
  }
*/

  return rating;
}


// binary search, takes in lattitude, and returns the start index of data that should be used
function findStartIndex(l) {
  var keys = Object.keys(crimes);
  var high = keys.length - 1;
  var low = 0
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (crimes[keys[mid]].longitude < l) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return mid;
}

// distance returns difference in location (miles) for two points
// param: lat1 (number) 
// param: lon1 (number) 
// param: lat2 (number) 
// param: lat2 (number) 
// return: dist (number)
function distance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	return dist;
}
