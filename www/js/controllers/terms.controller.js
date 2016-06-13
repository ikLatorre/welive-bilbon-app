
bilbonAppControllers
    .controller('TermsCtrl', TermsCtrl);

TermsCtrl.$inject = ['$scope', '$ionicHistory', '$state', '$filter', '$ionicPopup', 
                    '$timeout', '$ionicSideMenuDelegate', 'UserLocalStorage'];

/**
 * Controller - Privacy policy
 */
function TermsCtrl(
    $scope,
    $ionicHistory,
    $state,
    $filter,
    $ionicPopup,
    $timeout,
    $ionicSideMenuDelegate,
    UserLocalStorage) {

    // Avoid dragging content to show side menu and go to another page without accepting the privacy policy
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.acceptPrivacy = acceptPrivacy;
    $scope.refusePrivacy = refusePrivacy;
    
    // go to the app's first page
    function goToPOIsMap() {
        $ionicHistory.nextViewOptions({ disableBack: true }); // Avoid back button in the next view
        $state.go('app.map');
    };

    function acceptPrivacy() {
        UserLocalStorage.setPrivacyAccepted(true);
        goToPOIsMap();
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
    checkBeforeDraw: function (UserLocalStorage, $ionicHistory, $state, $timeout, $q) {
        var isPrivacyAccepted = UserLocalStorage.getPrivacyAccepted();

        if (isPrivacyAccepted){
            goToPOIsMap();
        }

        function goToPOIsMap() {
            $timeout(function() {
                $ionicHistory.nextViewOptions({ disableBack: true }); // Avoid back button in the next view
                $state.go('app.map');
            }, 0);
            return $q.reject();
        };
    }
};