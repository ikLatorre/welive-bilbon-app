
bilbonAppControllers
    .controller('AboutCtrl', AboutCtrl);

AboutCtrl.$inject = ['$scope', '$filter', '$ionicPopup', '$timeout', 'WELIVE_SERVICE_ID'];

/**
 * Controller - About
 */
function AboutCtrl(
    $scope, 
    $filter, 
    $ionicPopup,
    $timeout,
	WELIVE_SERVICE_ID) {
	
	$scope.launchSurvey = launchSurvey;
    $scope.showSurvey = true;
    
	function launchSurvey(){
		var result;
        
		//app: WELIVE_SERVICE_ID | 'test'
        var params = {
            app: WELIVE_SERVICE_ID,
            callback : 'http://localhost/callback',
            lang: 'ES',
            pilotId: 'bilbao'
        };

        // generate the request URL
        var requestUrl = 'https://in-app.welive.smartcommunitylab.it/html/index.html'
            + '?'
            + 'app=' + params.app
            + '&'
            + 'callback=' + params.callback
            + '&'
            + 'lang=' + params.lang
            + '&'
            + 'pilotId=' + params.pilotId;

        // open a new window with the request URL
        // window.open = cordova.InAppBrowser.open;
        var ref = window.open(requestUrl, '_blank', 'location=no');

        console.log('Start URL:' + requestUrl + ' FIN URL');

        // set a listener in order to manage the loadstart event
        ref.addEventListener('loadstart', loadStartListener);

        function loadStartListener(event) {

            console.log('URL:' + event.url + ' FIN URL');

            // check if the url is the same of the redirection
            if ((event.url).startsWith('http://localhost/callback')) {

                // take the result from the url
                result = (event.url).split('questionnaire-status=')[1].split('&')[0];

                // close the opened window
                ref.close();

                // unsuscribe event
                ref.removeEventListener('loadstart', loadStartListener);

                // hide survey if ok
                if(result === 'OK'){
                	$scope.showSurvey = false;
                    $scope.$apply();

                    var myPopup = $ionicPopup.show({
						template: "<center>" + $filter('translate')('about.questionnaire.succesfully-submitted-label')
								+ "</center>",
						cssClass: 'custom-class custom-class-popup'
					});
					$timeout(function() { myPopup.close(); }, 1800); //close the popup after 1.8 seconds 
				}else if(result === 'ERROR'){
					var myPopup = $ionicPopup.show({
						template: "<center>" + $filter('translate')('about.questionnaire.submitted-error-label')
								+ "</center>",
						cssClass: 'custom-class custom-class-popup'
					});
					$timeout(function() { myPopup.close(); }, 1800); //close the popup after 1.8 seconds 

				}else if(result === 'CANCEL'){
					// close questionnaire without message
				}
            }
        }
	}

}  
