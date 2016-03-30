
var config_module = angular.module('bilbonApp.config', [])
	//.constant('APP_NAME','WELIVE - Bilbozkatu')
	//.constant('APP_VERSION','0.1')

	.constant('WELIVE_SERVICE_ID', 'bilbon') 

	.constant('WELIVE_DATASET_URL','https://dev.welive.eu/dev/api/dataset/') 



	//.constant('BILBOZKATU_BB_URL','http://donosti.eurohelp.es:8087/BilbozkatuBB/') 
	//.constant('BILBOZKATU_BB_URL','http://172.16.250.3:8087/BilbozkatuBB/') 
	//.constant('BILBOZKATU_BB_URL','http://localhost:8088/')
		// 'http://localhost:8088/'
		// 'http://172.16.250.3:8087/BilbozkatuBB/'
		// 'http://donosti.eurohelp.es:8087/BilbozkatuBB/'

	//.constant('USERS_FEEDBACK_BB_URL','http://donosti.eurohelp.es:8087/UsersFeedbackBB/') 
	//.constant('USERS_FEEDBACK_BB_URL','http://172.16.250.3:8087/UsersFeedbackBB/') 
	//.constant('USERS_FEEDBACK_BB_URL','http://localhost:8087/') 
		// 'http://localhost:8087/'
		// 'http://172.16.250.3:8087/UsersFeedbackBB/'
		// 'http://donosti.eurohelp.es:8087/UsersFeedbackBB/'

	//.constant('PROPOSAL_EXPIRATION_MEASUREMENT_MODE', 'months') // years | months | weeks | days | hours | minutes | seconds
	//.constant('PROPOSAL_EXPIRATION_MEASUREMENT_VALUE', 2) 

	//.constant('ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK', 5) // use ionic's infinite scroll to show proposals block by block
														   // (used in proposals' and feedbacks' list)

	//.constant('NEW_FEEDBACKS_CHECKING_INTERVAL_MODE', 'seconds') // minutes | seconds 												   
	//.constant('NEW_FEEDBACKS_CHECKING_INTERVAL_VALUE', 30) 
;