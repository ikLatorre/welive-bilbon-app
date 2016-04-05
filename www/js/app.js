// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'bilbonApp.config',
  'LocalStorageModule', 'pascalprecht.translate', 'ngCordova'])

.run(function($ionicPlatform, $ionicPopup, $timeout) {
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
  });
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider, localStorageServiceProvider, WELIVE_SERVICE_ID) {

  $translateProvider.useStaticFilesLoader({
    prefix: 'js/messages/locale-', 
    suffix: '.json'
  });
  $translateProvider.preferredLanguage('es_ES'); // eu-ES | es-ES
  $translateProvider.useSanitizeValueStrategy('escape'); // to avoid Cross-site Scripting (XSS) attacks

  localStorageServiceProvider
      .setPrefix(WELIVE_SERVICE_ID)
      .setStorageType('localStorage') 
        // 'localStorage':   Data stored in localStorage persists until explicitly deleted. 
        //                   Changes made are saved and available for all current and future visits to the site.
        // 'sessionStorage': Changes are only available per window (or tab in browsers like Chrome 
        //                   and Firefox). Changes made are saved and available for the current page, as well as future 
        //                   visits to the site on the same window. Once the window is closed, the storage is deleted
      .setStorageCookie(45, '<path>'); // path default: '/'

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for show the menu
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
        }
      }
    })

    .state('app.registry', {
      url: '/registry',
      views: {
        'menuContent': {
          templateUrl: 'templates/registry.html',
          controller: 'RegistryCtrl'
        }
      }
    })

    .state('app.map', {
      url: '/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
    })

    .state('app.create', {
      url: '/create',
      views: {
        'menuContent': {
          templateUrl: 'templates/create.html',
          controller: 'CreateCtrl'
        }
      }
    })

    .state('app.proposal', {
      url: '/poi/:poiId',
      views: {
        'menuContent': {
          templateUrl: 'templates/poi.html',
          controller: 'POICtrl'
        }
      }
    })

    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');

});
