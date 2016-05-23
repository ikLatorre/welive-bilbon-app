
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
	$http, 
	LoginService, 
	BILBOZKATU_BB_URL){

	$scope.zones = zones; // load 'zones' list from  zones.js for combobox
  	$scope.newProposal = {}; // store form data

  	/*$scope.submitProposal = function(){

	// verify if current user is logged
	var currentUserId = LoginService.getUserId();
	if(currentUserId == null){
	  $ionicPopup.confirm({
	      title: $filter('translate')('info-alert-popup-title'),
	      template: $filter('translate')('proposal-create-page.proposal.user-not-logged-error-label'),
	      cancelText: $filter('translate')('info-confirm-popup-cancel-button-label'),
	      cancelType: 'button-default',
	      okText: $filter('translate')('info-confirm-popup-login-button-label'),
	      okType: 'button-assertive'
	  }).then(function(res) { if(res) { $scope.openLoginModal(); } });
	  return;
	}
	// send the feedback
	$http({
	  method: 'GET',
	  url: BILBOZKATU_BB_URL + '/proposal/add?'
	                      + 'title='+ $scope.newProposal.title
	                      + '&userID=' + currentUserId
	                      + '&zone=' + $scope.newProposal.zone
	                      + '&category=' + $scope.newProposal.category
	                      + '&description=' + $scope.newProposal.description
	                      + '&type=' + 'Ciudadano',
	  timeout: 10000
	}).then(function successCallback(successCallback) {
	      // this callback will be called asynchronously when the successCallback is available
	      var response_data = successCallback.data;
	      if(response_data.hasOwnProperty('message')){ 
	          if(response_data.message == "The proposal was successfully created"){
	              $scope.newProposal = {};
	              $ionicPopup.alert({
	                  title: $filter('translate')('info-alert-popup-title'),
	                  template: $filter('translate')('proposal-create-page.proposal.succesfully-submitted-label'),
	                  okText: $filter('translate')('info-alert-popup-ok-button-label'),
	                  okType: 'button-assertive' 
	              });
	          }else if(response_data.message == "The 'userID' does not exist in the database"){
	              $ionicPopup.alert({
	                  title: $filter('translate')('error-alert-popup-title'),
	                  template: $filter('translate')('proposal-create-page.proposal.user-unregistered-error-label'),
	                  okText: $filter('translate')('error-alert-popup-ok-button-label'),
	                  okType: 'button-assertive' 
	              });
	          }
	      }

	    }, function errorCallback(errorCallback) {
	      $ionicPopup.alert({
	          title: $filter('translate')('error-alert-popup-title'),
	          template: $filter('translate')('proposal-create-page.proposal.user-proposal-submit-error-label'),
	          okText: $filter('translate')('error-alert-popup-ok-button-label'),
	          okType: 'button-assertive' 
	      });
	      //if(errorCallback.status <= 1 || errorCallback.status == 404){
	        // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
	      //}
	    }
	);
	};*/

}