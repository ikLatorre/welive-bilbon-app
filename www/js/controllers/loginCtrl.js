
bilbonAppControllers
    .controller('LoginCtrl', LoginCtrl);

//LoginCtrl.$inject = ['$scope', '$state', '$ionicLoading', 'UserId', 'Login']; // 'Users', 'Language', 'KPI'

function LoginCtrl($scope, $state, $ionicLoading, $ionicPopup, $filter, $ionicHistory, $timeout, Login, UserLocalStorage){ // UserId, Users, Language, KPI

    $scope.loginBtnDisable = false;
    $scope.credentialsLogin = credentialsLogin;

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
            .then(Login.requestOauthTokenSuccessCallback, Login.requestOauthTokenErrorCallback)
            .then(Login.requestBasicProfile)
            .then(requestBasicProfileSuccessCallback, Login.requestBasicProfileErrorCallback);

        /**
         * manage the success of the get request
         * @param basicProfileResponse the response from the request
         */
        function requestBasicProfileSuccessCallback(basicProfileResponse){

            // KPI when a user logged in
            //KPI.appUserRegistered(basicProfileResponse.data.userId);

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
                $ionicHistory.clearCache().then(function(){ $state.go('app.map')});
                //alert(Login.code, Login.accessToken);
            }, 1600); //close the popup after 1.8 seconds 


            // Request Profile and store
            //Login.requestProfile().then(requestProfileSuccessCallback);

            // Launch next state after check the user
            //Users.loaded.then(usersLoaded);


            /*function requestProfileSuccessCallback(response){
                UserId.userId = response.data.ccUserID;
                UserId.name = response.data.name;
                UserId.surname = response.data.surname;
                UserId.referredPilot = response.data.referredPilot;
                UserId.gender = response.data.gender;
                UserId.birthdate = response.data.birthdate;
                UserId.address = response.data.address;
                UserId.city = response.data.city;
                UserId.country = response.data.country;
                UserId.zipCode = response.data.zipCode;
                UserId.email = response.data.email;
            }*/

            /*function usersLoaded() {
                $ionicLoading.hide();

                UserId.setName(basicProfileResponse.data.name);
                UserId.setSurName(basicProfileResponse.data.surname);
                UserId.setSocialId(basicProfileResponse.data.socialId);

                if (Users.findById(parseInt(basicProfileResponse.data.userId))){
                    UserId.setUserId(basicProfileResponse.data.userId);
                    $state.go('app.main');
                }
                else{
                    UserId.setUserId(basicProfileResponse.data.userId);
                    $state.go('location', {userId:parseInt(basicProfileResponse.data.userId), userName:basicProfileResponse.data.name});
                }
            }*/
        }
    }
}
