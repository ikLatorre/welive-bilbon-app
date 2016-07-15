// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules

// define app modules (retrieve them for subsequent use with 'angular.module(name)')
angular.module('bilbonApp.controllers', []);
angular.module('bilbonApp.services', []);
angular.module('bilbonApp.directives', []);

// 'bilbonApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
  .module('bilbonApp', [
    'ionic',
    'ionic.service.core', 

    'bilbonApp.controllers', 
    'bilbonApp.services', 
    'bilbonApp.directives',

    'pascalprecht.translate', 
    'ionic-modal-select', 
    'LocalStorageModule'
  ])

  .run(run);


  run.$inject = ['$ionicPlatform', 'Login', 'UserLocalStorage', 'KPI'];

  function run($ionicPlatform, Login, UserLocalStorage, KPI) {

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
        StatusBar.styleDefault();
      }

      // refresh current user's access token in order to create new POIs (the user login is persistent)
      if(UserLocalStorage.getUserId() != null){ 
        // the user is previously logged in the app
        Login.refreshOauthToken()
        .then(function(token){ // token refreshed and stored in local storage, avoid 'log out'
        }, function(errorCallback){ 
            if(errorCallback == 'isAlreadyLogout')
              console.log("Is not necessary to refresh the access token, the user is not logged");
            else
              console.log("Error refreshing the user's access token", errorCallback);
            // force 'log out'
            UserLocalStorage.removeUserData(); // remove 'name', 'surname', 'socialId', 'userId'
            UserLocalStorage.removeOAuthData(); // remove 'accessToken', 'refreshToken', 'expiresIn', 'tokenType', 'scope'
        });
      }

      // get WeLive's client token 
      Login.requestWeliveClientAppOauthToken()
      .then(function(token){
          KPI.setClientAppToken(token); // store app token in KPI service to enable securized logging system

          // KPI when the app started
          KPI.appStarted().then(function(successCallback){
            console.log("'appStarted' KPI logged");
          }, function(errorCallback){
            console.log("Error logging 'appStarted' KPI", errorCallback);
          });

      }, function(errorCallback){
          KPI.setClientAppToken(null); 
          console.log("Error obtaining client app's token", errorCallback);
      });

    });

  }
