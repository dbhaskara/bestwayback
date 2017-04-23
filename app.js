var imported = document.createElement('script');
imported.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyATStvJFHPadqlOozhMkFTykKpMSdpzlns&callback=myMap';
document.head.appendChild(imported);

function myMap() {
  var mapCanvas = document.getElementById("map");
  var myCenter=new google.maps.LatLng(38.02768,-78.48915);
  var mapOptions = {center: myCenter, zoom: 5};
  var map = new google.maps.Map(mapCanvas, mapOptions);
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(map, event.latLng);
  });
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

