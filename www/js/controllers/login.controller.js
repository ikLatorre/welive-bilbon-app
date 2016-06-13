
bilbonAppControllers
    .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$ionicPopup', '$filter', '$ionicHistory',
                    '$timeout', 'Login', 'UserLocalStorage', 'KPI'];

/**
 * Controller - Use WeLve's AAC
 */
function LoginCtrl(
    $scope, 
    $state, 
    $ionicLoading, 
    $ionicPopup, 
    $filter, 
    $ionicHistory, 
    $timeout, 
    Login, 
    UserLocalStorage,
    KPI){ 

    $scope.loginBtnDisable = false;
    $scope.credentialsLogin = credentialsLogin;


    /**
    *  run when 'Login' button is clicked
    */
    function credentialsLogin() {

        // Oauth authentication
        Login.requestAuthorize()
            .then(function(){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                            + $filter('translate')('login.loading')
                });
                return Login.requestOauthToken();
            })
            .then(Login.requestOauthTokenSuccessCallback, requestOauthTokenErrorCallback)
            .then(Login.requestBasicProfile)
            .then(requestBasicProfileSuccessCallback, requestBasicProfileErrorCallback);

        
        /**
        * manage the error of the post request
        * @param response: the error from the request
        */
        function requestOauthTokenErrorCallback(response){
            var promise;
            promise = $q(function(resolve, reject) {
                console.log("ERROR: " + response.data.toString());
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: $filter('translate')('login.error-popup-title'),
                    template: $filter('translate')('login.error-popup-text'),
                    okText: $filter('translate')('login.error-popup-button-label'),
                    okType: 'button-assertive' 
                });
                reject();
            });

            return promise;
        };


        /**
         * manage the success of the get request
         * @param basicProfileResponse: the response from the request
         */
        function requestBasicProfileSuccessCallback(basicProfileResponse){

            // KPI when a user logged in
            KPI.appUserRegistered(basicProfileResponse.data.userId).then(function(){
              console.log("'appUserRegistered' KPI logged");
            }, function(){
              console.log("Error logging 'appUserRegistered' KPI");
            });

            // store user's basic information
            var currentUserBasicProfile = {
                currentUser: {
                  name: basicProfileResponse.data.name,
                  surname: basicProfileResponse.data.surname,
                  socialId: basicProfileResponse.data.socialId,
                  userId: basicProfileResponse.data.userId
                }
            };
            UserLocalStorage.setUserData(currentUserBasicProfile);

            // register user's userId if neccesary

            $scope.loginBtnDisable = true; // disable login button while message appears before change the view (page)
            $ionicLoading.hide();

            // show login message
            var myPopup = $ionicPopup.show({
                template: "<center>" + $filter('translate')('info-alert-popup-login-label-left') + "'" 
                  + UserLocalStorage.getUserName() + "'" + $filter('translate')('info-alert-popup-login-label-right') + "</center>",
                cssClass: 'custom-class custom-class-popup'
            });
            $timeout(function() { 
                myPopup.close();

                // go to map's page
                $ionicHistory.nextViewOptions({ disableBack: true }); // Avoid back button in the next view
                $state.go('app.map');
                //$ionicHistory.clearCache().then(function(){ $state.go('app.map')});
                //alert(Login.code, Login.accessToken);
            }, 1600); //close the popup after 1.6 seconds 

        };


        /**
        * manage the error of the get request
        * @param response: the error from the request
        */
        function requestBasicProfileErrorCallback(response){
            var promise;
            promise = $q(function(resolve, reject) {
                console.log("ERROR: " + response.data.toString());
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: $filter('translate')('login.error-popup-title'),
                    template: $filter('translate')('login.error-popup-text'),
                    okText: $filter('translate')('login.error-popup-button-label'),
                    okType: 'button-assertive' 
                });
                reject();
            });

            return promise;
        };
    }
}
