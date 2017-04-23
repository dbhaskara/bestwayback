var imported = document.createElement('script');

imported.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyATStvJFHPadqlOozhMkFTykKpMSdpzlns';

document.head.appendChild(imported);

var pos = {};
var crimes = {};
getCrimes();
var map = {};

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
  //var testDest=new google.maps.LatLng(38.02768,-78.48915);
  //calculateAndDisplayRoute(directionsService, directionsDisplay, startHere, endHere);
  //findPath(pos, testDest);
}

function placeMarker(map, location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  var infowindow = new google.maps.InfoWindow({
    content: 'Latitude: ' + location.lat() + '<br>Longitude: ' + location.lng()
  });
  infowindow.open(map,marker);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, start, end) {
        directionsService.route({
          origin: start,
          destination: end,
          travelMode: 'WALKING',
          provideRouteAlternatives: true
        }, function(response, status) {
          if (status === 'OK') {

            for(var i = 0; i < response.routes.length; i++) {
              new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                routeIndex: i
              });
              console.log(getRouteSafety(response.routes[i]));
            }
          } else {
            window.alert('Directions request failed due to ' + status);
          }
   });
}

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

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}   

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

function getPointSafety(point) { // expect LatLong value
  var rating = 0.0;
  var pLat = point['lat']; 
  var pLng = point['lng'];

  // data is initially sorted by longitude value
  var i = findStartIndex(pLng - .023);
  for ( ; i < Object.keys(crimes).length && crimes[Object.keys(crimes)[i]].longitude < pLng + 0.023 ; i++) {
    var lat2 = crimes[Object.keys(crimes)[i]].latitude;  
    if (Math.abs(lat2 - pLat) < 0.023) {
      var d = distance(pLat, pLng, lat2, crimes[Object.keys(crimes)[i]].longitude)
      if (d < .04) {
        d = 0.4; // all distances within .04 count the same
      }
      rating += 1/d;
    }
  }

// Brute force algorithm:
/*  for (var i = 0; i < Object.keys(crimes).length; i++) {
    var crime = crimes[Object.keys(crimes)[i]];
    var d = distance(pLat, pLng, crime['latitude'], crime['longitude']);    
    if (d < 2.0) {
      if (d < 0.4) {
        d = 0.4 // All distances within 200 ft of a crime count the same.
      }
      rating += d;
    }
  }*/
  return rating;
}

//binary search, takes in lattitude, and returns the start index of data that should be used
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

// Returns difference in location (miles)
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
