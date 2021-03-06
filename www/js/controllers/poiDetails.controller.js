

angular
    .module('bilbonApp.controllers')
    .controller('POIDetailsCtrl', POIDetailsController);

POIDetailsController.$inject = ['$scope', '$state', '$filter', '$ionicPopup', '$ionicHistory', '$translate', 
								'$stateParams', 'FilteredPOIs', 'KPI'];

/**
 * Controller - Details of a POI (Point of interest)
 */
function POIDetailsController(
	$scope, 
	$state, 
	$filter, 
	$ionicPopup, 
	$ionicHistory,
	$translate,
	$stateParams,
	FilteredPOIs,
	KPI){

	console.log('');
	console.log('categoryCustomNumericId', $stateParams.categoryCustomNumericId);
	console.log('poiId', $stateParams.poiId);
	console.log('type', $stateParams.type);

	var isOfficial = true;
	if($stateParams.type == 'citizen'){
		isOfficial = false;
	}

	// get POI's details from stored POIs arrays
	$scope.poiDetails = FilteredPOIs.getPOI(isOfficial, $stateParams.categoryCustomNumericId, $stateParams.poiId);

	if($scope.poiDetails == null){
		// couldn't get POI details
		$ionicPopup.alert({
            title: $filter('translate')('poi-details.error-popup-title'),
            template: $filter('translate')('poi-details.error-popup-text'),
            okText: $filter('translate')('poi-details.error-ok-button-label'),
            okType: 'button-assertive' 
        });
		$ionicHistory.goBack(); // go back to the 'Map' page
	}

	// set POI type
	if(isOfficial) $scope.poiDetails.type = $filter('translate')('poi-details.official-type-text');
	else $scope.poiDetails.type = $filter('translate')('poi-details.citizen-type-text');
	console.log($scope.poiDetails);

	// set POI category
	var categoryInfo = categories.filter( function(item){
      return (item.categoryCustomNumericId == $stateParams.categoryCustomNumericId && item.isOfficial == true); 
    });
    $scope.poiDetails.categoryName = (categoryInfo != null)? categoryInfo[0][$translate.use()] : '-';

	// KPI when a POI is selected
	KPI.POIsSelected($stateParams.poiId, $scope.poiDetails.documentName, $scope.poiDetails.latitudelongitude)
	.then(function(successCallback){
      console.log("'POIsSelected' KPI logged");
    }, function(errorCallback){
      console.log("Error logging 'POIsSelected' KPI", errorCallback);
    });


	if($scope.poiDetails.documentName == null || $scope.poiDetails.documentName == ''
		|| $scope.poiDetails.documentName == 'null') $scope.poiDetails.documentName = '-';
	
	if($scope.poiDetails.documentDescription == null || $scope.poiDetails.documentDescription == ''
		|| $scope.poiDetails.documentDescription == 'null') $scope.poiDetails.documentDescription = '-';
	
	if($scope.poiDetails.web == null || $scope.poiDetails.web == ''
		|| $scope.poiDetails.web == 'null') $scope.poiDetails.web = '-';
	
	if($scope.poiDetails.email == null || $scope.poiDetails.email == ''
		|| $scope.poiDetails.email == 'null') $scope.poiDetails.email = '-';
	
	if($scope.poiDetails.phoneNumber == null || $scope.poiDetails.phoneNumber == ''
		|| $scope.poiDetails.phoneNumber == 'null') $scope.poiDetails.phoneNumber = '-';

	if($scope.poiDetails.municipality == null || $scope.poiDetails.municipality == ''
		|| $scope.poiDetails.municipality == 'null') $scope.poiDetails.municipality = '-';
	
	if($scope.poiDetails.historicTerritory == null || $scope.poiDetails.historicTerritory == ''
		|| $scope.poiDetails.historicTerritory == 'null') $scope.poiDetails.historicTerritory = '-';

	/* poiDetails example:
		{
			country: "España",
			documentDescription:"En el restaurante Beraia utilizan como materia prima mariscos, pescados y carnes de primera calid...",
			documentName:"Beraia",
			email:"info@beraia.com",
			historicTerritory:"BIZKAIA",
			historicTerritoryCode:48,
			id:123,
			latitudelongitude:"43.2654242,-2.9341127000000142",
			municipality:"BILBAO",
			municipalityCode:480020,
			phoneNumber:"944 052 844",
			territory:"BIZKAIA",
			web:"http://www.facebook.com/pages/Restaurante-Beraia/207847902629777?sk=info&tab=page_info"
		}
	*/

	// used for 'web page' datum if exists, opens it in the system's web browser
	$scope.goToWebPage = function(){
		window.open($scope.poiDetails.web, '_system', 'location=no,clearcache=yes');
	}
	
}