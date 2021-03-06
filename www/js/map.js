
/**
*   Create map object with the corresponding parameters
*/ 
function initializeMap(domMapContainer){
    
    //var infoWindow = new google.maps.InfoWindow();
    var options = {
        zoom: 14, 
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        center: new google.maps.LatLng(43.263606, -2.935214), // Plaza de Don Federico Moyúa, Bilbao
        mapTypeId: google.maps.MapTypeId.MAP
    };
    
    var map = new google.maps.Map(domMapContainer, options);
    
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter(); 
        google.maps.event.trigger(map, "resize"); 
        map.setCenter(center);
    });

    return map;
};


/**
*   Load and associate Google Places' Autocomplete object with the input element
*   (used in 'map.controller.js' to associate to the abstract 'menu.html's #location-input element)
*/
function loadGooglePlacesAutocompleteFeature(domInputElement, MapFactory, $ionicPopup){
    
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
            // (but in this case there is no the 'enter' button, is a mobile app)
            if( //MapFactory.getGPlacesLocation() == '' //domInputElement.value == '' 
                // first time the place is not defined:
                autocompleteObj.getPlace() == null 
                // enter pressed without selecting or error getting the place:
                || (autocompleteObj.getPlace() != null && domInputElement.value == autocompleteObj.getPlace().name)){ 

                    MapFactory.setGPlacesLocationToSearch('');
            }else{
                    // place changed successfully with Google Places

                    // store 'domInputElement' value, because the user written text ($scope.filter.autocompleteLocation)
                    // is not the entire location (e.g. use 'Caso Viejo,...' instead of 'casc')
                    MapFactory.setGPlacesLocationToSearch(domInputElement.value);

                    // if the loaction filter is enabled with the Google Places option, reload the filter
                    // because of the place changing. Is necessary to pass 'true' in the 'isLocationSwitched'
                    // parameter to force a full reload, otherwise it just applies the location filter to loaded POIs.
                    // this 'controllerScope' refers to AppController's '$scope', so is neccesary to acces if
                    // from outside og the Angular's context (this 'map.js' is just a JavaScript file) 
                    var appElement = document.querySelector('[ng-app=bilbonApp]');
                    var bilbonAppScope = angular.element(appElement).scope();
                    var bilbonAppControllerScope = bilbonAppScope.$$childHead; // access AppCtrl's $scope

                    if(bilbonAppControllerScope.filter.selectedLocation['google-places']){
                        // update location marker's position ('FilteredPOIs.setPositionFilterCoords(lat, lng);')
                        var lat = autocompleteObj.getPlace().geometry.location.lat();
                        var lng = autocompleteObj.getPlace().geometry.location.lng();
                        bilbonAppControllerScope.setPositionFilterCoords(lat, lng);

                        // apply location filter again because the user has selected another location from the 
                        // Google Places' suggestion list
                        bilbonAppControllerScope.callLocationFilter('google-places', true);
                    }
            }

            return;
        }
    );

    return autocompleteObj;
}
