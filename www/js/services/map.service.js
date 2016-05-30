
var bilbonAppServices = angular.module('starter.services', []);

bilbonAppServices
    .factory('Map', mapService);

mapService.$inject = ['FilteredPOIs', '$q']; 

/**
* @desc Manage map and google autocomplete's objects
*/
function mapService(FilteredPOIs,$q){
	var map = {};
	map.mapObj = null;
	map.googlePlacesAutocompleteObj = null;
	map.selectedLocationInput = ''; // used for Google Places' input element
	map.searchedTextInput = ''; // used for text's filter

	// define markers' model like POIs array's model of 'poi-filter.service.js'
	map.officialMarkers = [];
	map.citizenMarkers = [];
	map.infoWindow = null;

	initializeMarkersArrays();

	// define service's methods
	var map = {
		getMap: getMap,
		setMap: setMap,
		getAutocomplete: getAutocomplete,
		setAutocomplete: setAutocomplete,
		getGPlacesLocationToSearch: getGPlacesLocationToSearch,
		setGPlacesLocationToSearch: setGPlacesLocationToSearch,
		getTextToSearch: getTextToSearch,
		setTextToSearch: setTextToSearch,

		reloadMarkers: reloadMarkers
    };
    return map;

    function getMap(){
    	return map.mapObj;
    };

    function setMap(mapObj){
    	map.mapObj = mapObj;
    };

    function getAutocomplete(){
    	return map.googlePlacesAutocompleteObj;
    };

    function setAutocomplete(googlePlacesAutocompleteObj){
    	map.googlePlacesAutocompleteObj = googlePlacesAutocompleteObj;
    };

    // manage selected location
    function getGPlacesLocationToSearch(){
    	return map.selectedLocationInput;
    };

    function setGPlacesLocationToSearch(locationInputText){
    	map.selectedLocationInput = locationInputText;
    };

    // manage searched text
    function getTextToSearch(){
    	return map.searchedTextInput;
    };

    function setTextToSearch(searchedTextInput){
    	map.searchedTextInput = searchedTextInput;
    };

    // reload existing POIs' markers in the map
    // Returns a promise that is resolved when markers are reloaded in the map.
    function reloadMarkers(){
    	console.log('Reloading markers... ');
    	var promise;
    	promise = $q(function (resolve, reject) {
    		setMapOnAllMarkers(null); // remove markers from the map
    		initializeMarkersArrays(); // delete markers' by removing references to them in the arrays
    		
	    	var officialPOIs = FilteredPOIs.getOfficialFilteredPOIs();
	    	var citizenPOIs = FilteredPOIs.getCitizensFilteredPOIs();
	    	console.log('Filtered official POIs:', officialPOIs, 'Filtered citizen POIs:', citizenPOIs);

	    	// create markers and add them to the map and to the corresponding arrays
	    	createCategoryMarkers(officialPOIs, true);
	    	createCategoryMarkers(citizenPOIs, false);

	    	resolve();
	    });

    	return promise;
    };








    // ** Define auxiliary functions used in functions of 'filter' variable **

    // initialize POIs' arrays for each category. 'categories' is definied in 'config/categories.js'
    function initializeMarkersArrays() {
    	console.log("Initializing markers' arrays...");
    	map.officialMarkers = [];
		map.citizenMarkers = [];
		map.infoWindow = new google.maps.InfoWindow(); // define one infoWindow to close it when another is opened

    	// arrays cannot have "string indexes", that's why 'categoryCustomNumericId' numeric parameter is used
    	// 'categories' array is defined in 'config/categories.js'
		angular.forEach(categories, function(item, key){
			if(item.isOfficial == true){
				map.officialMarkers[item.categoryCustomNumericId] = []; 
			}else{
				map.citizenMarkers[item.categoryCustomNumericId] = []; 
			}
		});
    };

    // set 'map' parameter to all stored markers (set 'null' to remove markers from the map)
    // ('item' parameter is not used because it is passed by value and is neccesary to modify the item by reference). 
    function setMapOnAllMarkers(mapToSet){
    	console.log('Setting "map" on all markers...', mapToSet);
    	if(map != null && map.hasOwnProperty("officialMarkers") && map.officialMarkers != null){
    		angular.forEach(map.officialMarkers, function(item, categoryKey){
	    		angular.forEach(map.officialMarkers[categoryKey], function(marker, markerKey){
	    			map.officialMarkers[categoryKey][markerKey].setMap(mapToSet);
	    		});
	    	});
		}
    	if(map != null && map.hasOwnProperty("citizenMarkers") && map.citizenMarkers != null){
    		angular.forEach(map.citizenMarkers, function(item, categoryKey){
	    		angular.forEach(map.citizenMarkers[categoryKey], function(marker, markerKey){
	    			map.citizenMarkers[categoryKey][markerKey].setMap(mapToSet);
	    		});
	    	});
    	}
    }

    // create all filtered categories' markers.
    // 'filteredPOIs' parameter is the array of filtered POIs of all categories of one type (official or citizen)
    function createCategoryMarkers(filteredPOIs, isOfficial){
    	// create official or citizen POIs' markers, iterate over the array of dataset results of each category
    	angular.forEach(filteredPOIs, function(datasetItem, categoryKey){

    		if(datasetItem != null && datasetItem.hasOwnProperty("rows")){
    			// iterate over the array of filtered official POIs of specific category
    			angular.forEach(datasetItem.rows, function(POIitem, POIkey){

    				// get marker's coordinates
					var coordinatesLatLng =  POIitem.latitudelongitude.split(",");
					var latitude = Number(coordinatesLatLng[0]);
					var longitude = Number(coordinatesLatLng[1]);

					// get marker's icon (based on category and type (official or not))
					var iconPath = null;
					var categoryInfo = categories.filter( function(item){ //'categories' is defined in config/categories.js
						return (item.categoryCustomNumericId == categoryKey && item.isOfficial == isOfficial); 
					});
					if(categoryInfo != null) iconPath = categoryInfo[0]['marker'];

					// add the marker to the map
    				var marker = new google.maps.Marker({
				        position: new google.maps.LatLng(latitude, longitude),// place[i],
				        map: getMap(),
				        title: POIitem.documentName,
				        icon: iconPath,
				        animation : google.maps.Animation.DROP
					});

    				// set infoWindow to the marker's 'click' event
					google.maps.event.addListener(marker, 'click', function(){
						map.infoWindow.setOptions({
							content: POIitem.documentName,
							maxWidth: 200
						});
						map.infoWindow.open(getMap(), this);
					});

    				// push the marker to the corresponding array
    				if(isOfficial) map.officialMarkers[categoryKey].push(marker);
    				else map.citizenMarkers[categoryKey].push(marker);
    			});
    		}
    		// see for another category
    	});
    	// all categories' items iteration finished
    }



}