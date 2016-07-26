

angular
    .module('bilbonApp.controllers')
    .controller('AboutCtrl', AboutController);

AboutController.$inject = ['$scope', '$filter', '$ionicPopup', '$timeout', '$translate',
 'UserLocalStorage', 'WELIVE_SERVICE_ID'];

/**
 * Controller - About
 */
function AboutController(
    $scope, 
    $filter, 
    $ionicPopup,
    $timeout,
    $translate,
    UserLocalStorage,
	WELIVE_SERVICE_ID) {
	
	$scope.launchSurvey = launchSurvey;
    $scope.showSurvey = true;

    // reset the questionnaire completed count (max count is 4)
    //UserLocalStorage.removeCompletedQuestionnaireCount();

    // disable survey launch button if it has been completed successfully 4 times or more
    if(UserLocalStorage.getCompletedQuestionnaireCount() >= 4){
        $scope.showSurvey = false;
    }

    
	function launchSurvey(){
		var result;
        
        var lang = ($translate.use() == "en_EN")? 'EN' : 'ES'; 

        // show alert message if the selected language is basque (it is not supported by WeLive's questionnaire BB)
        if($translate.use() == "eu_ES"){
             var myPopup = $ionicPopup.show({
                template: "<center>" + $filter('translate')('about.questionnaire.basque-not-supported-text')
                        + "</center>",
                cssClass: 'custom-class custom-class-popup'
            });
            $timeout(function() { myPopup.close(); }, 1800); //close the popup after 1.8 seconds 
        }

        var params = {
            app: WELIVE_SERVICE_ID,
            callback : 'http://localhost/callback',
            lang: lang,
            pilotId: 'bilbao'
        };

        // generate the request URL
        var requestUrl = 'https://in-app.cloudfoundry.welive.eu/html/index.html'
            + '?'
            + 'app=' + params.app
            + '&'
            + 'callback=' + params.callback
            + '&'
            + 'lang=' + params.lang
            + '&'
            + 'pilotId=' + params.pilotId;

        // open a new window with the request URL
        var ref = window.open(requestUrl, '_blank', 'location=no');

        console.log('Start URL:' + requestUrl + ' FIN URL');

        // set a listener in order to manage the loadstart event
        ref.addEventListener('loadstart', loadStartListener);

        function loadStartListener(event) {

            console.log('URL:' + event.url + ' FIN URL');
  
            // check if the url is the same of the redirection
            //if ((event.url).startsWith('http://localhost/callback')) { // String.prototype.startsWith() not supported by Android
            if ((event.url).indexOf("http://localhost/callback") > -1){
                
                // take the result from the url
                result = (event.url).split('questionnaire-status=')[1].split('&')[0];
    
                // close the opened window
                ref.close();
                
                // unsuscribe event
                ref.removeEventListener('loadstart', loadStartListener);
                
                // hide survey if ok
                if(result === 'OK'){

                	// disable button to launch questionnaire if the user has completed it 4 times or more
                    UserLocalStorage.addCompletedQuestionnaireCount();
                    if(UserLocalStorage.getCompletedQuestionnaireCount() >= 4){
                        $scope.showSurvey = false;
                        //$scope.$apply();
                    }

                    var myPopup = $ionicPopup.show({
						template: "<center>" + $filter('translate')('about.questionnaire.succesfully-submitted-label')
								+ "</center>",
						cssClass: 'custom-class custom-class-popup'
					});
					$timeout(function() { myPopup.close(); }, 2500); //close the popup after 1.8 seconds 

				}else if(result === 'ERROR'){
                    
					var myPopup = $ionicPopup.show({
						template: "<center>" + $filter('translate')('about.questionnaire.submitted-error-label')
								+ "</center>",
						cssClass: 'custom-class custom-class-popup'
					});
					$timeout(function() { myPopup.close(); }, 4000); //close the popup after 1.8 seconds 

				}else if(result === 'CANCEL'){
					// close questionnaire without message
				}

            }
        }
	}

}  
