
/*
    Returns an array of markers identified by zone (id) 
*/
//function initialize(proposalsCountByZones, $scope){
function initializeMap(domMapContainer){
    
    var infoWindow = new google.maps.InfoWindow();
    var options = {
        zoom: 14, 
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        center: new google.maps.LatLng(43.263606, -2.935214), // Plaza de Don Federico Moyúa, Bilbao
        mapTypeId: google.maps.MapTypeId.MAP
    };
    
    var map = new google.maps.Map(domMapContainer, options);
    //var limits = new google.maps.LatLngBounds();

    var infoWindowArray = new Array();
    /*
    angular.forEach(zones, function (zone) {         
        zone.position = new google.maps.LatLng(zone.latitude, zone.longitude);
        var marker = new google.maps.Marker({
            position: zone.position, //new google.maps.LatLng(zone.latitude, zone.longitude),// place[i],
            map: map,
            title: zone.label,
            icon: 'img/pin.png',
            animation : google.maps.Animation.DROP
        });
        google.maps.event.addListener(marker, 'click', function(){

            // load marker's infoWindow's content
            var infoWindowContent = getInfoWindowContent(zone.id, this.title, proposalsCountByZones, 
                $scope.proposalLabel_sing, $scope.proposalLabel_plu);
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, this);

            infoWindowArray[zone.id] = infoWindow; // add marker's infoWindow to the array
            // set current marker's infoWindow's data to use in MapCtrl if language changes
            $scope.currentMarkerZoneId = zone.id; 
            $scope.currentMarkerTitle = this.title;

        });
        google.maps.event.addListener(infoWindow, 'closeclick', function(){
            // 'closeclick' listener runs for every infoWindow created, so initialize 
            // $scope.currentMarkerZoneId only once
            if($scope.currentMarkerZoneId == zone.id) $scope.currentMarkerZoneId = null;
        });
        limits.extend(zone.position);
    });*/

   // map.fitBounds(limits);
    
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter(); 
        google.maps.event.trigger(map, "resize"); 
        map.setCenter(center);
    });

    return map;

    //$scope.loadGooglePlacesAutocompleteFeature(document.getElementById('location-input'));
};

// load and associate Google Places' Autocomplete object with the input element
function loadGooglePlacesAutocompleteFeature(domInputElement, MapFactory){
    
    var bilbaoBounds = new google.maps.LatLngBounds(  //Constructs a rectangle from the points at its south-west and north-east corners
        new google.maps.LatLng(43.199927, -3.017116),   //south-west corner
        new google.maps.LatLng(43.310109, -2.827070));  //north-east corner
    // (Google Places) Create the autocomplete object, restricting the search to geographical location types.
    var autocompleteObj = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */
        (domInputElement), {
            types : [ 'geocode' ],
            componentRestrictions: { country: 'es' },
            bounds: bilbaoBounds //The area in which to search for places. 
                                 // Results are biased towards, but not restricted to, places contained within these bounds.
        });

    // When the user selects an address from the dropdown:
    /*If the user enters the name of a Place that was not suggested by the control and presses the 
    Enter key, or if a Place detail request fails, a place_changed event will be fired that contains 
    the user input in the name property, with no other properties defined.*/
    // This listener is triggered when the user selects a location from the list, and also when the checkbox is activated
    google.maps.event.addListener(autocompleteObj, 'place_changed',
        function() {
            console.log('"place_changed" event fired.');
            
            // If the user press 'enter' with the sidebar's searcher, but without selecting an item from the list
            if(//MapFactory.getGPlacesLocation() == '' //domInputElement.value == '' 
                // first time the place is not defined:
                autocompleteObj.getPlace() == null 
                // enter pressed without selecting or error getting the place:
                || (autocompleteObj.getPlace() != null && domInputElement.value == autocompleteObj.getPlace().name)){ 
                console.log("Select a location from the suggestion list before activate the Google Places' filter");

                $ionicPopup.alert({
                    title: $filter('translate')('menu.filter.location-search.error-popup-title'),
                    template: $filter('translate')('menu.filter.location-search.error-popup-text'),
                    okText: $filter('translate')('menu.filter.location-search.error-ok-button-label'),
                    okType: 'button-assertive' 
                });

                MapFactory.setGPlacesLocation('');
            }else{
                // store 'domInputElement' value, because the user written text ($scope.filter.autocompleteLocation)
                // is not the entire location (e.g. use 'Caso Viejo,...' instead of 'casc')
                MapFactory.setGPlacesLocation(domInputElement.value);
            }

            return;
        }
    );

    return autocompleteObj;
}


// returns the content of currentInfo windo based on selected language
/*function getInfoWindowContent(currentMarkerZoneId, currentMarkerTitle, proposalsCountByZones, 
    proposalLabelSing, proposalLabelPlu){
    // get proposals' count of zone (and link to proposals' list if neccesary)
    var proposalsCountOfZoneArray = [];
    if(proposalsCountByZones.length > 0){ // there are results from web service about proposals' count
        proposalsCountOfZoneArray = proposalsCountByZones.filter(
            function(item){ return item.zone == currentMarkerZoneId; }
        );
    }
    var proposalsCountOfZone = 0;
    if(proposalsCountOfZoneArray.length > 0){
        proposalsCountOfZone = proposalsCountOfZoneArray[0]['proposalsCount'];
    }
    
    // complete link based on proposal's count and language
    var proposalCountInfo;
    if(proposalsCountOfZone > 0){
        proposalCountInfo = "<a href='#/app/playlists?zone=" + currentMarkerZoneId + "'>";
        if(proposalsCountOfZone == 1){
            if(proposalLabelSing == "petición") proposalCountInfo += proposalsCountOfZone + " " + proposalLabelSing;
            else proposalCountInfo += proposalLabelSing + " " + proposalsCountOfZone;
        }else{
            proposalCountInfo += proposalsCountOfZone + " " + proposalLabelPlu;
        }
        proposalCountInfo += "</a>";
    }else{
        proposalCountInfo = proposalsCountOfZone + " " + proposalLabelPlu;
    }
    return "<p style='text-align:center'>" + currentMarkerTitle + "<br />(" + proposalCountInfo + ")</p>";
};*/

//google.maps.event.addDomListener(window, 'load', initialize);