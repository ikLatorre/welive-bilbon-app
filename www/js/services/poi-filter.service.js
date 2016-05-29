
bilbonAppServices
    .factory('FilteredPOIs', filteredPOIs);

filteredPOIs.$inject = ['$http', '$state', '$q', '$ionicLoading', 'WELIVE_DATASET_API_URL']; 

/**
 * @desc Store searched POIs and manage the filtering 
 */
function filteredPOIs($http, $state, $q, $ionicLoading, WELIVE_DATASET_API_URL) { 

	// each item of the array is identified by 'categoryCustomNumericId', and contains all the filetred POIs of 
	// the corresponding category (see 'config/categories.js')
	// (each item will contain the response of the api, an object with 'count' and 'rows' properties)
	var officialPOIs = [];
	var citizenPOIs = [];

	emptyPOIs();

	// define service's methods
	var filter = {
		callCategoryAndTextFilter: callCategoryAndTextFilter,
		callLocationFilter: callLocationFilter,
		getOfficialFilteredPOIs: getOfficialFilteredPOIs,
		getCitizensFilteredPOIs: getCitizensFilteredPOIs,
		getPOI: getPOI,
		emptyPOIs: emptyPOIs,
		removeCategoryPOIs: removeCategoryPOIs
    };
    return filter;

    // get POIs of dataset filtered by category and, if neccesary, by text. Returns a promise (the 'response'
    // if success; rejected promise otherwise).
    function callCategoryAndTextFilter(categoryCustomNumericId, isOfficial, textInput) {
    	var promise;
    	promise = $q(function (resolve, reject) {

	    	// manage the text filter
	    	var sqlTextQueryClause = "";
	    	if(textInput != null){
	    		var textQueryAux = " LIKE '%" + textInput + "%' ";
	     		sqlTextQueryClause = " AND (documentName " + sqlTextQueryAux + " OR documentDescription " + sqlTextQueryAux
	                        	+ " OR web " + sqlTextQueryAux + " OR email " + sqlTextQueryAux + " OR country " + sqlTextQueryAux
	                        	+ " OR territory " + sqlTextQueryAux + " OR municipality " + sqlTextQueryAux
	                        	+ " OR historicTerritory " + sqlTextQueryAux + ") "; 
	    	}

	    	// get parameters based on if the request is to an official dataset or not.
	    	// official POIs' each dataset corresponds to one category; citizen POIs are stored in the same dataset, identified
	    	// by 'category' field
	    	var datasetID = "";
	    	var jsonID = "";
	    	var sqlIdFieldName = null;
	    	var sqlTableName = null;
	    	var sqlCategoryQueryClause = ""; // in case of citizens' dataset
	    	var categoryID = ""; // store categoryID (categoryID = official datasetID = citizens' dataset's 'category' field)
	    	
			var officialCategoryInfo = categories.filter( function(item){ //'categories' array is defined in config/categories.js
				return (item.categoryCustomNumericId == categoryCustomNumericId && item.isOfficial == true); 
			});
		    if(officialCategoryInfo != null) categoryID = officialCategoryInfo[0]['datasetId'];
			else reject(); 

	    	if(isOfficial){
	    		datasetID = officialCategoryInfo[0]['datasetId']; // same as 'categoryID'
	    		jsonID = officialCategoryInfo[0]['jsonId'];
	    		sqlIdFieldName = "_id";
	    		sqlTableName = "rootTable";
	    	}else{
	    		var citizenCategoryInfo = categories.filter( function(item){ 
					return (item.categoryCustomNumericId == categoryCustomNumericId && item.isOfficial == false); 
				});
			    if(citizenCategoryInfo != null){
			    	datasetID = citizenCategoryInfo[0]['datasetId'];;
	    			jsonID = citizenCategoryInfo[0]['jsonId'];
				}else reject(); 
				sqlIdFieldName = "id";
				sqlTableName = "POIS";
	    		sqlCategoryQueryClause = " AND category LIKE '" + categoryID + "' ";
	    	}

	    	// construct url and query statements
	    	var datasetCall = {
		        params : {
		            method: 'POST',
		            url: WELIVE_DATASET_API_URL + datasetID + '/resource/' + jsonID + '/query',
		            headers: {	"Content-Type": "text/plain",
				    			"Accept": "application/json"  },
		            sqlQuery: " SELECT " + sqlIdFieldName + " AS id, documentName, documentDescription, latitudelongitude, web, "
	                		+ " phoneNumber, email, country, territory, municipality, municipalityCode, "
	                		+ " historicTerritory, historicTerritoryCode "
	                		+ " FROM " + sqlTableName 
		            		+ " WHERE municipalityCode = 480020 " + sqlTextQueryClause + sqlCategoryQueryClause + ";",
		            timeout: 6000
		        }
		    };
		    console.log('Getting items from "' + datasetCall.params.url + '"...');

		    // call the corresponding dataset to filter by category and, maybe, by text
	    	$http({
				method: datasetCall.params.method,
				url:  datasetCall.params.url,
				headers: datasetCall.params.headers,
				data: datasetCall.params.sqlQuery, // select from Bilbao (municipalityCode = 480020)
				timeout: datasetCall.params.timeout
		    }).then(function successCallback(successCallback) {
		    		// this callback will be called asynchronously when the successCallback is available
		    		if(isOfficial) officialPOIs[categoryCustomNumericId] = successCallback.data;
			    	else citizenPOIs[categoryCustomNumericId] = successCallback.data;
			    	console.log('Obtained respone: ', successCallback.data);
			    	resolve(successCallback.data);
		        }, function errorCallback(errorCallback) {
		        	if(isOfficial) officialPOIs[categoryCustomNumericId] = {};
			    	else citizenPOIs[categoryCustomNumericId] = {};
		        	reject();
		        }
		    );

    	});

    	return promise;
    };

    // remove from stored POIs those that doens't match the location filter. Returns true if success, or false otherwise.
    function callLocationFilter(categoryCustomNumericId, isOfficial, lat, lng) {
    	var promise;
    	promise = $q(function (resolve, reject) {
    		if(lat == null && lng == null){
    			// get device's gps's location

    		}else{
    			// we have Google Autocomplete's coordinates

    		}


    	});

    	return promise;
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