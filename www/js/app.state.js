

angular
    .module('bilbonApp')
    .config(stateConfig);

    stateConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$translateProvider', 
    					   'localStorageServiceProvider', 'WELIVE_SERVICE_ID'];

    function stateConfig($stateProvider, $urlRouterProvider, $translateProvider, localStorageServiceProvider, 
    					 WELIVE_SERVICE_ID) {
        
        // configure translate provider
    	$translateProvider.useStaticFilesLoader({
			prefix: 'js/messages/locale-', 
			suffix: '.json'
		});
		$translateProvider.preferredLanguage('es_ES'); // es_ES | eu_ES | en_EN
		$translateProvider.useSanitizeValueStrategy('escape'); // avoid Cross-site Scripting (XSS) attacks

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
		// Each state's controller can be found in controllers/
		$stateProvider

			// setup an abstract state for show the menu
		    .state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
		    })

		    .state('app.terms', {
				url: '/terms',
				views: {
				'menuContent': {
					templateUrl: 'templates/terms.html',
					controller: 'TermsCtrl'
					}
				},
				resolve: TermsController.resolve
		    })
		    
		    .state('app.login', {
				url: '/login',
				views: {
				'menuContent': {
						templateUrl: 'templates/login.html',
						controller: 'LoginCtrl'
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

		    .state('app.poi', {
				url: '/poi?categoryCustomNumericId&poiId&type',
				views: {
				'menuContent': {
						templateUrl: 'templates/poi-details.html',
						controller: 'POIDetailsCtrl'
					}
				}
		    })

		    .state('app.create', {
				url: '/create',
				views: {
				'menuContent': {
						templateUrl: 'templates/create-poi.html',
						controller: 'CreatePOICtrl'
					}
				}
		    })

		    .state('app.about', {
				url: '/about',
				views: {
				'menuContent': {
						templateUrl: 'templates/about.html',
						controller: 'AboutCtrl'
					}
				}
		    });

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/terms');

    }
