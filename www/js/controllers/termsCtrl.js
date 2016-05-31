
bilbonAppControllers
    .controller('TermsCtrl', TermsCtrl);

TermsCtrl.$inject = ['$scope', '$ionicHistory', '$state', '$filter', 'localStorageService', '$ionicPopup', 
                    '$timeout', '$ionicSideMenuDelegate'];

/**
 * Controller - Privacy policy
 */
function TermsCtrl(
    $scope,
    $ionicHistory,
    $state,
    $filter,
    localStorageService,
    $ionicPopup,
    $timeout,
    $ionicSideMenuDelegate) {

    // Avoid dragging content to show side menu and go to another page without accepting the privacy policy
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.acceptPrivacy = acceptPrivacy;
    $scope.refusePrivacy = refusePrivacy;
    
    // go to the app's first page
    function goToProposalsList() {
        $ionicHistory.nextViewOptions({ disableBack: true }); // Avoid back button in the next view
        $state.go('app.map');
    };

    function acceptPrivacy() {
        localStorageService.set("isPrivacyAccepted", true); //window.localStorage.setItem("isPrivacyAccepted", true);
        goToProposalsList();
    };

    function refusePrivacy() {
        var myPopup = $ionicPopup.show({
        template: "<center>" + $filter('translate')('terms.refused-alert-text') + "</center>",
        cssClass: 'custom-class custom-class-popup'
        });
        $timeout(function() { myPopup.close(); }, 1800) //close the popup after 1.8 seconds for some reason
            .then(function(){
                navigator.app.exitApp(); // sometimes doesn't work with Ionic View
                //ionic.Platform.exitApp();
                console.log('App closed');
            });
    };

}

/**
 * Code to be executed before route change goes here (/app/terms)
 */
TermsCtrl.resolve = {
    checkBeforeDraw: function (localStorageService, $ionicHistory, $state, $timeout, $q) {
        var isPrivacyAccepted = localStorageService.get("isPrivacyAccepted"); //window.localStorage.getItem("isPrivacyAccepted");

        if (isPrivacyAccepted){
            goToProposalsList();
        }

        function goToProposalsList() {
            $timeout(function() {
                $ionicHistory.nextViewOptions({ disableBack: true }); // Avoid back button in the next view
                $state.go('app.map')
            }, 0);
            return $q.reject();
        };
    }
};