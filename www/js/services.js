
angular.module('starter.services', [])
    .factory('Map', map)
    .factory('LoginService', loginService);


/**
* @desc manage map and google autocomplete's objects
*/
function map(){
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



/**
* @desc get and set user's data
*/
function loginService(localStorageService){
    return {
        getUserId: function() {
          var userData = localStorageService.get('userData');
          if(userData != null) return JSON.parse(userData).currentUser.userId;
          else userData;
        },
        setUserData: function(userData) {
          return localStorageService.set('userData', JSON.stringify(userData));
        },
        removeUserData: function() {
          return localStorageService.remove('userData');
        }
    };
};
