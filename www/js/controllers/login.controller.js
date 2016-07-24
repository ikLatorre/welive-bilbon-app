

angular
    .module('bilbonApp.controllers')
    .controller('LoginCtrl', LoginController);

LoginController.$inject = ['$scope', '$state', '$ionicLoading', '$ionicPopup', '$filter', '$ionicHistory',
                    '$timeout', 'Login', 'UserLocalStorage', 'KPI'];

/**
 * Controller - Use WeLve's AAC
 */
function LoginController(
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

        // Oauth authentication flow: get the code --> request token with the code --> get the user token --> request user profile.
        // If one of the step fails, the error will be propagated through the promises' chain (the second argument of each promise response
        // handlers a rejected promise, but the chain will continue). In this case the error will continue the chain until the first 
        // error handler (second argument) in the chain, that is only defined in the last step of it. 
        // That is to say, if an error occurs in a chain's step, the 'Login' service's corresponding function will return a
        // 'rejected' status, and the chain will continue until the las step, where 'showAACerrorMsg()' function is called.
        Login.requestAuthorize()
            .then(function(){
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                            + $filter('translate')('login.loading')
                });
                return Login.requestOauthToken();
            })
            .then(Login.requestOauthTokenSuccessCallback)
            .then(Login.requestBasicProfile)
            .then(requestBasicProfileSuccessCallback, showAACerrorMsg);

        
        /**
        * Manage an error in the promises' chain (login flow). Stop the 'loading' panel and show an error message.
        * @param callbackResponse: the error callback from the AAC API
        */
        function showAACerrorMsg(response){
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

                // clean login local data (user profile and OAuth data) if the chain failed when some data was already getted
                UserLocalStorage.removeUserData(); // remove user profile data if it is already stored (name, surname, socialId, userId)
                UserLocalStorage.removeOAuthData(); // remove user's OAuth session data (accessToken, refreshToken, expiresIn, tokenType, scope)
                
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
            KPI.appUserRegistered(basicProfileResponse.data.userId)
            .then(function(successCallback){
              console.log("'appUserRegistered' KPI logged");
            }, function(errorCallback){
              console.log("Error logging 'appUserRegistered' KPI", errorCallback);
            });

            // store user's basic information
            var currentUserBasicProfile = {
                name: basicProfileResponse.data.name,
                surname: basicProfileResponse.data.surname,
                socialId: basicProfileResponse.data.socialId,
                userId: basicProfileResponse.data.userId
            };
            UserLocalStorage.setUserData(currentUserBasicProfile);

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

            }, 1600); //close the popup after 1.6 seconds 

        };

    }
}
