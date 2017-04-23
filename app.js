var imported = document.createElement('script');
imported.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyATStvJFHPadqlOozhMkFTykKpMSdpzlns';
document.head.appendChild(imported);

var pos = {};
var crimes = {};
getCrimes();

function myMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;

  var mapCanvas = document.getElementById("map");
  var myCenter=new google.maps.LatLng(38.02768,-78.48915);
  var mapOptions = {center: myCenter, zoom: 20};
  var map = new google.maps.Map(mapCanvas, mapOptions);
  infoWindow = new google.maps.InfoWindow;
  directionsDisplay.setMap(map);

  //find location
  if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Current Location Found.');
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
  var startHere = "Charlottesville, VA";
  var endHere = "Crozet, VA";

  calculateAndDisplayRoute(directionsService, directionsDisplay, startHere, endHere);
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
          travelMode: 'WALKING'
        }, function(response, status) {
          if (status === 'OK') {
            console.log("it worked");
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
   });
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
  var pLat 
  var pLng
  for (var i = 0; i < Object.keys(crimes).length; i++) {
    crimes[Object.keys(crimes)[i]];
  }
}

