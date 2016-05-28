
var bilbonAppServices = angular.module('starter.services', []);

bilbonAppServices
    .factory('Map', mapService);

//mapService.$inject = []; 

/**
* @desc Manage map and google autocomplete's objects
*/
function mapService(){
	var map = {};
	map.mapObj = null;
	map.googlePlacesAutocompleteObj = null;
	map.selectedLocationInput = ''; // used for Google Places' input element
	map.searchedTextInput = ''; // used for text's filter

	return {
	  getMap: function(){
	    return map.mapObj;
	  },
	  setMap: function(mapObj){
	    map.mapObj = mapObj;
	  },
	  getAutocomplete: function(){
	    return map.googlePlacesAutocompleteObj;
	  },
	  setAutocomplete: function(googlePlacesAutocompleteObj){
	    map.googlePlacesAutocompleteObj = googlePlacesAutocompleteObj;
	  },
	  // manage selected location:
	  getGPlacesLocationToSearch: function(){
	    return map.selectedLocationInput;
	  },
	  setGPlacesLocationToSearch: function(locationInputText){
	    map.selectedLocationInput = locationInputText;
	  },
	  // manage searched text:
	  getTextToSearch: function(){
	    return map.searchedTextInput;
	  },
	  setTextToSearch: function(searchedTextInput){
	    map.searchedTextInput = searchedTextInput;
	  }
	}
}