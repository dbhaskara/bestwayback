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
            //console.log(endHere);//"Crozet, VA";
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
            console.log("it worked");

            for(var i = 0; i < response.routes.length; i++) {
              new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                routeIndex: i
              });
              if(i == 0) {
              getRouteSafety(response.routes[i]);
              }
              //directionsDisplay.setDirections(response);
            }
            //directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
   });
}

function getRouteSafety(routeArray) {
  console.log(routeArray);
  for(var i = 0; i < routeArray.overview_path.length; i++) {
    console.log(routeArray.overview_path[i].lat() + " " + routeArray.overview_path[i].lng());
  }

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}   

function test() {
  var Tom = {
    "name": "Tom"
  }
  $.ajax({ 
    type: 'POST', 
    url: 'https://best-way-back.firebaseio.com/users.json', 
    data: JSON.stringify(Tom), 
    dataType: 'json',
    success: function () { 
      console.log("It worked");
    }
  });
  $.ajax({ 
    type: 'GET', 
    url: 'https://best-way-back.firebaseio.com/users.json', 
    dataType: 'json',
    success: function (users) { 
      $.each(users, function(user) {
        console.log(user);
      });
      console.log("It worked");
    }
  });
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

function pointSafety(point) { // expect LatLong value
  var rating = 0.0;
  var pLat = pos['lat']; 
  var pLng = pos['lng'];
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
  return rating;
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
