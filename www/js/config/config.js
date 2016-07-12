
var config_module = angular.module('bilbonApp.config', [])
	
	.constant('WELIVE_SERVICE_ID', 'bilbon')	// appId

	.constant('WELIVE_SERVICE_NAME', 'Bilbon')	// appName

	.constant('WELIVE_DATASET_API_URL','https://dev.welive.eu/dev/api/ods/')	// WeLive's Open Data Stack API URL

;