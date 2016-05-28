
bilbonAppServices
    .factory('FilteredPOIs', filteredPOIs);

filteredPOIs.$inject = ['$http', '$state', '$q', '$ionicLoading']; 

/**
 * @desc Store searched POIs and manage the filtering 
 */
function filteredPOIs($http, $state, $q, $ionicLoading) { 

	// each item of the array is identified by 'categoryCustomNumericId', and contains all the filetred POIs of 
	// the corresponding category (see 'config/categories.js')
	// (each item will contain the response of the api, an object with 'count' and 'rows' properties)
	var officialPOIs = [];
	var citizenPOIs = [];

	emptyPOIs();

	// define service's methods
	var filter = {
		applyCategoryAndTextFilter: applyCategoryAndTextFilter,
		applyLocationFilter: applyLocationFilter,
		getOfficialFilteredPOIs: getOfficialFilteredPOIs,
		getCitizensFilteredPOIs: getCitizensFilteredPOIs,
		getPOI: getPOI,
		emptyPOIs: emptyPOIs,
		removeCategoryPOIs: removeCategoryPOIs
    };
    return filter;

    // get POIs of dataset filtered by category and, if neccesary, by text. Returns the response, or null otherwise.
    function applyCategoryAndTextFilter(categoryID, isOfficial) {


    	if(isOfficial){
    		officialPOIs[categoryID] = apiResponse;
    	}else{
    		citizenPOIs[categoryID] = apiResponse;
    	}
    };

    // remove from stored POIs those that doens't match the location filter. Returns true if success, or false otherwise.
    function applyLocationFilter(categoryID, isOfficial) {
    	
    };

    function getOfficialFilteredPOIs() {
    	return officialPOIs;
    };

    function getCitizensFilteredPOIs() {
    	return citizenPOIs;
    };

    // get an obtained (filtered) POI's object
    function getPOI(isOfficial, categoryCustomNumericId, POI_ID) {
    	var poiInfo = null;
    	if(isOfficial){
    		var datasetResults = officialPOIs[categoryCustomNumericId];
    		if(datasetResults != null && datasetResults.hasOwnProperty("rows")){
    			poiInfo = datasetResults.rows.filter( function(item){ return item['_id'] == POI_ID; } );
    		}
    	}else{
    		var datasetResults = citizenPOIs[categoryCustomNumericId];
    		if(datasetResults != null && datasetResults.hasOwnProperty("rows")){
    			poiInfo = datasetResults.rows.filter( function(item){ return item['id'] == POI_ID; } );
    		}
    	}
    	if(poiInfo != null && poiInfo.length > 0){
    		return poiInfo[0];
    	} 
    	else{
    		return null;
    	}
    };

    // initialize POIs' arrays for each category. 'categories' is definied in 'config/categories.js'
    function emptyPOIs() {
    	officialPOIs = [];
    	citizenPOIs = [];

    	// arrays cannot have "string indexes", that's why 'categoryCustomNumericId' numeric parameter is used
		angular.forEach(categories, function(item, key){
			if(item.datasetId != "bilbon-user-pois"){
				officialPOIs[item.categoryCustomNumericId] = {}; // initialize array's item for that category's POIs
			}else{
				citizenPOIs[item.categoryCustomNumericId] = {}; // initialize array's item for that category's POIs
			}
		});

		/*angular.forEach(officialPOIs, function(item, key){
			//console.log(key);
		});*/
    };

    // remove POIs from a specific category and type (official or not)
    function removeCategoryPOIs(categoryCustomNumericId, isOfficial){
    	if(isOfficial){
    		officialPOIs[categoryCustomNumericId] = {};
    	}else{
    		citizenPOIs[categoryCustomNumericId] = {};
    	}
    }

}