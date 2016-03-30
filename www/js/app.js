// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers',
  'LocalStorageModule', 'pascalprecht.translate', 'bilbonApp.config'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
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

    .state('app.create', {
      url: '/create',
      views: {
        'menuContent': {
          templateUrl: 'templates/create.html',
          controller: 'CreateCtrl'
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

    .state('app.playlists', {
        url: '/playlists?zone',
        //cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'ProposalListCtrl'
          }
        }
      })

    .state('app.proposal', {
      url: '/playlists/:playlistId',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlist.html',
          controller: 'ProposalCtrl'
        }
      }
    })

    .state('app.statistics', {
      url: '/playlists/:playlistId/statistics',
      views: {
        'menuContent': {
          templateUrl: 'templates/statistics.html',
          controller: 'StatisticsCtrl'
        }
      }
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

    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');

});
