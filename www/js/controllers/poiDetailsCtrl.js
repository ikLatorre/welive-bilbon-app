
bilbonAppControllers
    .controller('POIDetailsCtrl', POIDetailsCtrl);


/**
 * Controller - Details of a POI (Point of interest)
 */
function POIDetailsCtrl(
	$scope, 
	$state, 
	$filter, 
	$ionicPopup, 
	$stateParams,
	FilteredPOIs){

	console.log('');
	console.log('categoryCustomNumericId', $stateParams.categoryCustomNumericId);
	console.log('poiId', $stateParams.poiId);
	console.log('type', $stateParams.type);

	var isOfficial = true;
	if($stateParams.type == 'citizen'){
		isOfficial = false;
	}

	// get poi's details from stored POIs arrays
	$scope.poiDetails = FilteredPOIs.getPOI(isOfficial, $stateParams.categoryCustomNumericId, $stateParams.poiId);

	if($scope.poiDetails == null){
		// couldn't get poi details
		$ionicPopup.alert({
            title: $filter('translate')('poi-details.error-popup-title'),
            template: $filter('translate')('poi-details.error-popup-text'),
            okText: $filter('translate')('poi-details.error-ok-button-label'),
            okType: 'button-assertive' 
        });
		$state.go('app.map');
	}
	console.log($scope.poiDetails);

	/* poiDetails example:
		country: "España"
		documentDescription:"En el restaurante Beraia utilizan como materia prima mariscos, pescados y carnes de primera calid..."
		documentName:"Beraia"
		email:"info@beraia.com"
		historicTerritory:"BIZKAIA"
		historicTerritoryCode:48
		id:123
		latitudelongitude:"43.2654242,-2.9341127000000142"
		municipality:"BILBAO"
		municipalityCode:480020
		phoneNumber:"944 052 844"
		territory:"BIZKAIA"
		web:"http://www.facebook.com/pages/Restaurante-Beraia/207847902629777?sk=info&tab=page_info"
	*/

}