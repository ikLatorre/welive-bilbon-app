var myApp = angular.module('starter.controllers', []);




myApp.factory('LoginService', function(localStorageService){
    return {
        getUserId: function(){
          var userData = localStorageService.get('userData');
          if(userData != null) return JSON.parse(userData).currentUser.userId;
          else userData;
        },
        setUserData: function(userData) {
          return localStorageService.set('userData', JSON.stringify(userData));
        },
        removeUserData: function() {
          return localStorageService.remove('userData');
        }
    };
});




myApp.factory('Map', function() {
  var map;
  var googlePlacesAutocomplete;

  return {
      getMap: function(){
        return map;
      },
      setMap: function(mapObj){
        map = mapObj;
      },
      getAutocomplete: function(){
        return googlePlacesAutocomplete;
      },
      setAutocomplete: function(googlePlacesAutocompleteObj){
        googlePlacesAutocomplete = googlePlacesAutocompleteObj;
      }
  }
});





myApp.controller('AppCtrl', function($scope, $rootScope, $state, $timeout, $translate, $ionicHistory, $ionicPopup, 
  $filter, LoginService, Map, $http, $ionicPopup, $ionicPlatform, $ionicLoading) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // filter's model (for angularJS)
  $scope.filter = {}; 
  // store selection's values of categories (true|false), identified by 'id' attribute of categories.js:
  $scope.filter.selectedCategories = []; 
  $scope.filter.areCategoriesShown = false; // control whether the sublist of categories is displayed or not
  // store selection's values of location modes (true|false), identified by google-places' and 'device-gps':
  $scope.filter.selectedLocation = []; 
  $scope.filter.isLocationShown = false; // control whether the sublist of location modes is displayed or not
  $scope.filter.autocompleteLocation = null; // 


 
  // Configure language of categories' array to use in the corresponding combobox/lists
  $scope.translatedCategories = []; // this variable will contain categories' list in the current language (used in ng-repeat)
  $scope.spanishCategoriesArray = [];
  $scope.basqueCategoriesArray = [];

  // Build spanish categories' array and initialize $scope.filter.selectedCategories array
  angular.forEach(categories, function(item){
      $scope.spanishCategoriesArray.push({id:item.id, datasetId:item.datasetId, jsonId:item.jsonId, 
        label:item.es_ES, img_src:item.img_src}); 
      $scope.filter.selectedCategories[item.id] = false; // initialize model's categories to false (checkbox selection)
  });
  $scope.translatedCategories = $scope.spanishCategoriesArray; // initialize categories' language to spanish
  // Build basque categories' array
  angular.forEach(categories, function(item){
      $scope.basqueCategoriesArray.push({id:item.id, datasetId:item.datasetId, jsonId:item.jsonId, 
        label:item.eu_ES, img_src:item.img_src});  
  });

  // Define functionality for menu's categories' item (toggle element)
  $scope.toggleCategories = function() {
    if ($scope.areCategoriesShown()){
     $scope.filter.areCategoriesShown = false;
    }
    else{ 
      $scope.filter.isLocationShown = false;
      $scope.filter.areCategoriesShown = true;
    }
  };
  $scope.areCategoriesShown = function() {
    return $scope.filter.areCategoriesShown;
  };
  // watch category selection
  $scope.$watchCollection('filter.selectedCategories', 
    function(newValues, oldValues) { 
      angular.forEach(oldValues, function(item, key){
        // 'key' is the category identifier (1..N) of categories.js
        if(newValues[key] != null && oldValues[key] !== newValues[key]){
          if(newValues[key]) $scope.callDatasetCategoriesFilter(key); // do the search because of the activation of this filter
          else $scope.disableCategoryFilter(key); // disable filter
        }
            
      });
    }, 
    true
  );
 

  // initialize $scope.filter.selectedLocation array
  $scope.filter.selectedLocation['google-places'] = false;
  $scope.filter.selectedLocation['device-gps'] = false;

  // Define functionality for menu's location item (toggle element)
  $scope.toggleLocation = function() {
    if ($scope.isLocationShown()) {
      $scope.filter.isLocationShown = false;
    }
    else {
      $scope.filter.areCategoriesShown = false;
      $scope.filter.isLocationShown = true;
    }
  };
  $scope.isLocationShown = function() {
    return $scope.filter.isLocationShown;
  };
  // detect location selection changing ($watchCollection does not work in this case)
  // used in 'ng-change' attribute. Only one location filter can be activated at the same time.
  $scope.locationSelectionChanged = function(locationMode, otherLocationMode){
    // switch between location modes if neccesary ('google-places' | 'device-gps')
    if($scope.filter.selectedLocation[locationMode]){
      // activate location mode, check if the other mode is already activated to disable it if is neccesary
      if($scope.filter.selectedLocation[otherLocationMode]){ 
        $scope.filter.selectedLocation[otherLocationMode] = false;
        $scope.disableLocationFilter(otherLocationMode); // disable filter
      }
      $scope.callLocationFilter(locationMode); // do the search because of the activation of this filter
    }else{
      $scope.disableLocationFilter(locationMode); // disable filter
    }
  };
 


  /**** Al iniciar la app, hacer que se hagan las llamadas a dataset despues de terminar inicialización del mapa (promise?) ****/
  $scope.loadMarkers = function(categoryItemsFromDataset){
    console.log(categoryItemsFromDataset.count, categoryItemsFromDataset);
    angular.forEach(categoryItemsFromDataset.rows, function(item, key){
      var coordinatesLatLng =  item.latitudelongitude.split(",");
      //console.log(coordinatesLatLng[0], coordinatesLatLng[1], typeof coordinatesLatLng[0]);
      var latitude = Number(coordinatesLatLng[0]);
      var longitude = Number(coordinatesLatLng[1]);
      //console.log(typeof coordinatesLatLng[0], typeof latitude, latitude);

      //console.log('aqui, $scope.map: ', $scope.map);
      var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),// place[i],
            map: Map.getMap(),
            title: item.documentName,
            icon: 'img/pin.png',
            animation : google.maps.Animation.DROP
      });
      
      var infoWindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker, 'click', function(){
          // load marker's infoWindow's content
          //var infoWindowContent = getInfoWindowContent(zone.id, this.title, proposalsCountByZones, 
          //    $scope.proposalLabel_sing, $scope.proposalLabel_plu);
          infoWindow.setContent(item.documentName);
          infoWindow.open(Map.getMap(), this);

          //infoWindowArray[zone.id] = infoWindow; // add marker's infoWindow to the array
          // set current marker's infoWindow's data to use in MapCtrl if language changes
          //$scope.currentMarkerZoneId = zone.id; 
          //$scope.currentMarkerTitle = this.title;

      });
      /*google.maps.event.addListener(infoWindow, 'closeclick', function(){
          // 'closeclick' listener runs for every infoWindow created, so initialize 
          // $scope.currentMarkerZoneId only once
          if($scope.currentMarkerZoneId == zone.id) $scope.currentMarkerZoneId = null;
      });*/

    });
  }



  // Filter's search by category (using categories specified in config/categories.js).
  // 'categoryJsonId': category's identifier (1..N) of config/categories.js file
  //             (note that $scope.translatedCategories' array's range is 0..N-1)
  $scope.callDatasetCategoriesFilter = function(categoryJsonId){
    console.log('Applying category filter... ("' + $scope.translatedCategories[categoryJsonId-1].label + '")');
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        + $filter('translate')('menu.filter.category-search.loading-text')
    });

    var response = null;
    $http({
      method: 'POST',
      url: 'https://dev.welive.eu/dev/api/ods/' +
        'restaurantes-sidrerias-y-bodegas-de-euskadi/resource/08560d52-c8ca-484b-9797-13309f056564/query',
      //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      headers: { "Content-Type": "text/plain" },
      data: 'SELECT * FROM rootTable WHERE municipalityCode = 480020;',
      timeout: 10000
    }).then(function successCallback(successCallback) {
          // this callback will be called asynchronously when the successCallback is available
          //console.log(successCallback.data);
          response = successCallback.data;
          //console.log(response);
        }, function errorCallback(errorCallback) {
          $scope.filter.selectedCategories[categoryJsonId] = false; // set category's checkbox to false
          console.log('ERROR ' + errorCallback);
          $ionicPopup.alert({
              title: $filter('translate')('menu.filter.category-search.error-popup-title'),
              template: $filter('translate')('menu.filter.category-search.error-popup-text'),
              okText: $filter('translate')('menu.filter.category-search.error-ok-button-label'),
              okType: 'button-assertive' 
          });
        }

    ).finally(
        function finallyCallback(callback, notifyCallback){
          $ionicLoading.hide(); 
          $scope.loadMarkers(response);
          // initialize the map (with or without data about proposals' count)
          //infoWindowArray = initialize($scope.proposalsCountByZones, $scope);
        }
    );
  }
  // Remove category's filter.
  // 'categoryJsonId': category's identifier (1..N) of config/categories.js file
  //             (note that $scope.translatedCategories' array's range is 0..N-1)
  $scope.disableCategoryFilter = function(categoryJsonId){
    console.log('Removing category filter... ("' + $scope.translatedCategories[categoryJsonId-1].label + '")');
  };



  // Filter's search by location (with the radius specified in config/config.js).
  // 'locationMode': location searching mode ('google-places' | 'device-gps')
  $scope.callLocationFilter = function(locationMode){
    console.log("Applying location filter... (mode: " + locationMode + ")");

  }
  // Remove location's filter.
  // Filter's search by location (with the radius specified in config/config.js).
  // 'locationMode': location searching mode ('google-places' | 'device-gps')
  $scope.disableLocationFilter = function(locationMode){
    console.log('Removing location filter... (mode: ' + locationMode + ')');
  };

  

  // Avoid the necessity to long press the autocomplete option to actually get it selected. 
  // The issue is that Gmap dynamically adds elements that need the data-tap-disabled property, 
  // so you'll have to manually add the property after google has added these elements to the dom.
  // It is called on 'ng-change' of the autocomplete input text (note that this requires ng-model too).
  $scope.disableTap = function() {
      var container = document.getElementsByClassName('pac-container');
      angular.element(container).attr('data-tap-disabled', 'true');
      var backdrop = document.getElementsByClassName('backdrop');
      angular.element(backdrop).attr('data-tap-disabled', 'true');
      angular.element(container).on("click", function() {
          document.getElementById('pac-input').blur();
      });
  };
  // Called by filter's 'gps/My location' item, this function do the same as <label for="device_gps_checkbox">.
  // It is used because the 'label' tag changes the item's height, being different than the previous
  // 'autocomplete' item's height implemented with div's. 
  // To mantain the same height in both sublist's elements, they're implemented with div's with a similar structure.
  $scope.gpsFilterClicked = function(){
    $scope.filter.selectedLocation['device-gps'] = $scope.filter.selectedLocation['device-gps']? false: true;
    $scope.locationSelectionChanged('device-gps', 'google-places');
  }


  // Configure language changing (UI's switch and $translate's language).
  $scope.selectedLang = false; // false: es_ES | true: eu_ES
  $scope.changeLang = function() {
    if ($scope.selectedLang == false) {
        $scope.selectedLang = true;
        $scope.switchLanguage('eu_ES');
        
    } else{
        $scope.selectedLang = false;
        $scope.switchLanguage('es_ES');
    }
  };
  $scope.switchLanguage = function (key) {
      $translate.use(key);
  }; 
  $rootScope.$on('$translateChangeEnd', function() { 
    if ($translate.use() == 'eu_ES')
      $scope.translatedCategories = $scope.basqueCategoriesArray; // change language of menu's items of categories
    else
      $scope.translatedCategories = $scope.spanishCategoriesArray;
  });
  
  $scope.loginData = {}; // initialize form data for the login modal
  //LoginService.removeUserData(); 

  // Create the login modal that we will use later
  /*$ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function(modal) {
      $scope.modal = modal;
  });*/

  // Define function to show menu's login/logout items
  $scope.getCurrentUserId = function (){
      return LoginService.getUserId();
  }

  // Open the login modal
 /*$scope.openLoginModal = function() {
    $scope.modal.show();
  };*/

  // Triggered in doLogin() to close it
  /*$scope.closeLoginModal = function() {
    $scope.modal.hide();
  };*/

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData.userId);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
        var currentUserSession = {
            currentUser: {
              name: "",
              surname: "",
              socialId: "",
              userId: $scope.loginData.userId
            }
        };
        LoginService.setUserData(currentUserSession)
        //$scope.closeLoginModal();
    }, 500)
    .then(function(){
          var myPopup = $ionicPopup.show({
            template: "<center>" + $filter('translate')('info-alert-popup-login-label-left') + "'" 
              + LoginService.getUserId() + "'" + $filter('translate')('info-alert-popup-login-label-right') + "</center>",
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800); //close the popup after 1.8 seconds for some reason
      }//, function(error) { }
    );

  };

  $scope.doLogout = function() {
    // Simulate a login delay
    $timeout(function() {
        console.log('Doing logout');
        LoginService.removeUserData(); 
        $scope.loginData = {};
    }, 200)
    .then(function(){
          $state.go('app.login');
          var myPopup = $ionicPopup.show({
            template: '<center>' + $filter('translate')('info-alert-popup-logout-label') + "</center>",
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);
      }//, function(error) { }
    );
  }

  /*$scope.$on('$destroy', function() {
    $scope.modal.remove();
  });*/
  /*
  // Reload proposal list when clicking 'Proposal list' menu item
  $scope.reloadProposalsList = function(){
    if($state.current.name == 'app.playlists'){
        //$state.go($state.current, {}, {reload:true});
    }else{
        $ionicHistory.clearCache().then(function(){ $state.go('app.playlists')});
    }
  };
  */
  // Reload map when clicking 'Map' menu item
  /*$scope.reloadMap = function(){
    if($state.current.name != 'app.map'){
        $ionicHistory.clearCache().then(function(){ $state.go('app.map')});
    }
  };*/




  /*$scope.exitApp = function(){
    // confirm if user wants to exit the app
    $ionicPopup.confirm({
        title: $filter('translate')('info-confirm-popup-title'),
        template: $filter('translate')('info-confirm-popup-text'),
        cancelText: $filter('translate')('info-confirm-popup-exit-cancel-button-label'),
        cancelType: 'button-default',
        okText: $filter('translate')('info-confirm-popup-exit-accept-button-label'),
        okType: 'button-assertive'
    }).then(function(res) { 
      if(res) {  
        $ionicLoading.show({
          template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
            + $filter('translate')('menu.exit-item-text')
        });
        $timeout(function() { 
          console.log('App closed');
          $ionicLoading.hide(); 
          //ionic.Platform.exitApp(); //('navigator.app.exitApp();')
          navigator.app.exitApp();
        }, 1800);
      } 
    });
  }*/

    
  $scope.searchDeviceLocation = function(){
      ionic.Platform.ready(function(){
        // will execute when device is ready, or immediately if the device is already ready.

        /*var deviceInformation = ionic.Platform.device();
        var isWebView = ionic.Platform.isWebView();
        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();
        var isWindowsPhone = ionic.Platform.isWindowsPhone();
        var currentPlatform = ionic.Platform.platform();
        var currentPlatformVersion = ionic.Platform.version();*/

        //console.log('Inicio de función GPS.');
        var options = {
          enableHighAccuracy: false,
          timeout: 6000,
          maximumAge: 0
        };

        function success(position) {
          console.log('position: ', position);
          var lat  = position.coords.latitude;
          var lng = position.coords.longitude;
           
          var myLatlng = new google.maps.LatLng(lat, lng);

          $ionicLoading.hide();  
          var myPopup = $ionicPopup.show({
            template: '<center>Coordenadas GPS: ' + lat + ', ' + lng + '</center>',
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);
        };

        function error(err) {
          $ionicLoading.hide(); 
          /*switch(error.code) {
              case error.PERMISSION_DENIED:
                  x.innerHTML = "User denied the request for Geolocation."
                  break;
              case error.POSITION_UNAVAILABLE:
                  x.innerHTML = "Location information is unavailable."
                  break;
              case error.TIMEOUT:
                  x.innerHTML = "The request to get user location timed out."
                  break;
              case error.UNKNOWN_ERROR:
                  x.innerHTML = "An unknown error occurred."
                  break;
          }*/
          var myPopup = $ionicPopup.show({
            template: '<center>Error ' +  err.code + ': ' + err.message + '</center>',
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);
          //console.warn('ERROR(' + err.code + '): ' + err.message);
        };

        // Not supported plugin in Ionic View (http://docs.ionic.io/v1.0/docs/view-usage)
        /*cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
          //console.log("Location is " + (enabled ? "enabled" : "disabled"));
          var myPopup = $ionicPopup.show({
            template: "Location is " + (enabled ? "enabled" : "disabled"),
            cssClass: 'custom-class custom-class-popup'
          }); 
          $timeout(function() { myPopup.close(); }, 1800);
        }, function(error){
          console.error("The following error occurred: "+error);
          var myPopup = $ionicPopup.show({
            template: "<center>Error getting location status:</br>"
              + "'" + error + "'</center>",
            cssClass: 'custom-class custom-class-popup'
          }); 
          $timeout(function() { myPopup.close(); }, 1800);
        });*/

        // Try HTML5 geolocation.
        if ("geolocation" in navigator) { // Check if Geolocation is supported (also with 'navigator.geolocation')
          // geolocation is available
          $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Analizando GPS...'
          });
         
          navigator.geolocation.getCurrentPosition(success, error, options);
        }else{
          var myPopup = $ionicPopup.show({
            template: '<center>Geolocalización no disponible</center>',
            cssClass: 'custom-class custom-class-popup'
          }); 
          $timeout(function() { myPopup.close(); }, 1800);
          console.log('geolocaiton IS NOT available');
        }
      });
  }
    
  
});




myApp.controller('RegistryCtrl', function($scope, $state) {
  // Registry is shown from Login modal, so is neccesary to set 'back' button enabled 
  // false because the previous screen of the history is not login. 
  /*$scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
  }); */
});




myApp.controller('MapCtrl', function($scope, $state, $ionicPopup, Map, $window, $filter, $http) {

  // recalculate map's height based on screen's height
  var screenHeight = $window.innerHeight - 105;
  var mapElement = angular.element( document.querySelector( '#mapa' ) );
  mapElement.css('height', screenHeight + 'px');

  // initialize map's variables
  var infoWindowArray = null; // array of initialized markers
  $scope.currentMarkerZoneId = null;
  $scope.currentMarkerTitle = null; // 
  $scope.proposalsCountByZones = [];

  // manage infoWindow's content's language
  //$scope.proposalLabel_sing = $filter('translate')('proposal-map-page.proposals-label-sing');
  //$scope.proposalLabel_plu = $filter('translate')('proposal-map-page.proposals-label-plu');
  // monitorize language changing
  /*$scope.$watchGroup(
      [ function() { return $filter('translate')('proposal-map-page.proposals-label-sing'); },
        function() { return $filter('translate')('proposal-map-page.proposals-label-plu'); }],

      function(newval, oldval, scope) { 
        $scope.proposalLabel_sing = newval[0];
        $scope.proposalLabel_plu = newval[1];

        // if a marker's infoWindow is opened, update its content based on selected language, even if
        // the language changing happens in the same map's page
        if(infoWindowArray != null && $scope.currentMarkerZoneId != null){
          infoWindowArray[$scope.currentMarkerZoneId].setContent(
            // if a marker's infoWindow is opened, change its content because of language changing
            getInfoWindowContent($scope.currentMarkerZoneId, $scope.currentMarkerTitle, 
                                 $scope.proposalsCountByZones, $scope.proposalLabel_sing, $scope.proposalLabel_plu)
          );
        }
      } 
  );*/
  
  // get proposals count of each zone
  /*$http({
    method: 'GET',
    url: BILBOZKATU_BB_URL + '/proposal/zones/count',
    timeout: 10000
  }).then(function successCallback(successCallback) {

        // this callback will be called asynchronously when the successCallback is available
        var response_data = successCallback.data;
        if(!response_data.hasOwnProperty('message')){  
            $scope.proposalsCountByZones = response_data;
        } // else response_data.message is "There are no proposals in the database"

      }, function errorCallback(errorCallback) {
        $ionicPopup.alert({
            title: $filter('translate')('error-alert-popup-title'),
            template: $filter('translate')('proposal-map-page.proposals-count-error-label'),
            okText: $filter('translate')('error-alert-popup-ok-button-label'),
            okType: 'button-assertive' 
        });
      }

  ).finally(
      function finallyCallback(callback, notifyCallback){
        // initialize the map (with or without data about proposals' count)
        infoWindowArray = initialize($scope.proposalsCountByZones, $scope);
      }
  );*/



  var map = initializeMap(document.getElementById('mapa')); 
  Map.setMap(map);

  var autocomplete = loadGooglePlacesAutocompleteFeature(document.getElementById('location-input'));
  Map.setAutocomplete(autocomplete);



  //console.log('despues initializacion, map: ', $scope.map);

});




myApp.controller('CreateCtrl', function($scope, $state, $filter, $ionicPopup, $http, LoginService, BILBOZKATU_BB_URL) {

  $scope.zones = zones; // load 'zones' list from  zones.js for combobox
  $scope.newProposal = {}; // store form data

  /*$scope.submitProposal = function(){

    // verify if current user is logged
      var currentUserId = LoginService.getUserId();
      if(currentUserId == null){
          $ionicPopup.confirm({
              title: $filter('translate')('info-alert-popup-title'),
              template: $filter('translate')('proposal-create-page.proposal.user-not-logged-error-label'),
              cancelText: $filter('translate')('info-confirm-popup-cancel-button-label'),
              cancelType: 'button-default',
              okText: $filter('translate')('info-confirm-popup-login-button-label'),
              okType: 'button-assertive'
          }).then(function(res) { if(res) { $scope.openLoginModal(); } });
          return;
      }
      // send the feedback
      $http({
          method: 'GET',
          url: BILBOZKATU_BB_URL + '/proposal/add?'
                              + 'title='+ $scope.newProposal.title
                              + '&userID=' + currentUserId
                              + '&zone=' + $scope.newProposal.zone
                              + '&category=' + $scope.newProposal.category
                              + '&description=' + $scope.newProposal.description
                              + '&type=' + 'Ciudadano',
          timeout: 10000
        }).then(function successCallback(successCallback) {
              // this callback will be called asynchronously when the successCallback is available
              var response_data = successCallback.data;
              if(response_data.hasOwnProperty('message')){ 
                  if(response_data.message == "The proposal was successfully created"){
                      $scope.newProposal = {};
                      $ionicPopup.alert({
                          title: $filter('translate')('info-alert-popup-title'),
                          template: $filter('translate')('proposal-create-page.proposal.succesfully-submitted-label'),
                          okText: $filter('translate')('info-alert-popup-ok-button-label'),
                          okType: 'button-assertive' 
                      });
                  }else if(response_data.message == "The 'userID' does not exist in the database"){
                      $ionicPopup.alert({
                          title: $filter('translate')('error-alert-popup-title'),
                          template: $filter('translate')('proposal-create-page.proposal.user-unregistered-error-label'),
                          okText: $filter('translate')('error-alert-popup-ok-button-label'),
                          okType: 'button-assertive' 
                      });
                  }
              }

            }, function errorCallback(errorCallback) {
              $ionicPopup.alert({
                  title: $filter('translate')('error-alert-popup-title'),
                  template: $filter('translate')('proposal-create-page.proposal.user-proposal-submit-error-label'),
                  okText: $filter('translate')('error-alert-popup-ok-button-label'),
                  okType: 'button-assertive' 
              });
              //if(errorCallback.status <= 1 || errorCallback.status == 404){
                // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
              //}
            }
        );
  };*/
});




myApp.controller('POICtrl', function($scope, $state, $stateParams, $filter, $http, $ionicHistory,
            $ionicScrollDelegate , $ionicPopup, $interval, LoginService, WELIVE_SERVICE_ID) {

  // configure rating's input element
/*  $scope.ratingsObject = {
        iconOn : 'ion-ios-star',
        iconOff : 'ion-ios-star-outline',
        iconOnColor: '#FFCC33', //'rgb(200, 200, 100)',
        iconOffColor:  '#FFCC33', //'rgb(200, 100, 100)',
        rating:  1, // initial rating
        minRating:1,
        callback: function(rating) {
          $scope.ratingsCallback(rating);
        }
  };
  $scope.ratingsCallback = function(rating) {
      $scope.newFeedback.rating = rating;
  };

  $scope.submitFeedback = function() {
      // this function can only be called if the proposal is not expired, so it's not necessary the validation
      // because of it is done wicth angularJS's ng-if directive

      // verify if current user is logged
      var currentUserId = LoginService.getUserId();
      if(currentUserId == null){
          $ionicPopup.confirm({
              title: $filter('translate')('info-alert-popup-title'),
              template: $filter('translate')('proposal-details-page.feedbacks.user-not-logged-error-label'),
              cancelText: $filter('translate')('info-confirm-popup-cancel-button-label'),
              cancelType: 'button-default',
              okText: $filter('translate')('info-confirm-popup-login-button-label'),
              okType: 'button-assertive'
          }).then(function(res) { if(res) { $scope.openLoginModal(); } });
          return;
      }
      // send the feedback
      $http({
          method: 'GET',
          url: USERS_FEEDBACK_BB_URL + '/feedback/add?'
                              + 'serviceID='+ WELIVE_SERVICE_ID 
                              + '&objectID=' + $scope.getCurrentProposal().objectID 
                              + '&userID=' + currentUserId
                              + '&comment=' + $scope.newFeedback.comment
                              + '&rating=' + $scope.newFeedback.rating,
          timeout: 10000
        }).then(function successCallback(successCallback) {
              // this callback will be called asynchronously when the successCallback is available
              var response_data = successCallback.data;
              if(response_data.hasOwnProperty('message')){ 
                  if(response_data.message == "The feedback was successfully created"){
                      $scope.newFeedback.comment = "";
                      $scope.noMoreItemsAvailable = false;
                      // load new average rating
                      $scope.updateCurrentProposalAverageRating($scope.getCurrentProposal().objectID, 10000);
                      $scope.feedbacksError = false; // initialize variable for get feedbacks' call 
                      $scope.checkNewFeedbacks();
                      $ionicPopup.alert({
                        title: $filter('translate')('info-alert-popup-title'),
                        template: $filter('translate')('proposal-details-page.feedbacks.succesfully-submitted-label'),
                        okText: $filter('translate')('info-alert-popup-ok-button-label'),
                        okType: 'button-assertive' 
                      });
                  }
              }
            }, function errorCallback(errorCallback) {
              $ionicPopup.alert({
                  title: $filter('translate')('error-alert-popup-title'),
                  template: $filter('translate')('proposal-details-page.feedbacks.user-feedback-submit-error-label'),
                  okText: $filter('translate')('error-alert-popup-ok-button-label'),
                  okType: 'button-assertive' 
              });
              //if(errorCallback.status <= 1 || errorCallback.status == 404){
                // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
              //}
            }
        );
  };
  
  // define functions to update data of Proposals' factory
  $scope.getCurrentProposal = function(){
      return Proposals.getCurrentProposal();
  };
  $scope.setCurrentProposal = function(item){
      Proposals.setCurrentProposal(item);
  };
  $scope.setCurrentProposalFeedbacksRating = function(averageRating, feedbackCount){
      Proposals.setCurrentProposalFeedbacksRating(averageRating, feedbackCount);
  };
  $scope.setCurrentProposalFeedbacksError = function(){
      Proposals.setCurrentProposalFeedbacksError();
  };
  $scope.setListProposalFeedbackRating = function(objectID, averageRating, feedbackCount){
      return Proposals.setListProposalFeedbackRating(objectID, averageRating, feedbackCount);
  };
  // define functions to manage vote's functionality
  $scope.setCurrentProposalVoteAndUpdateList = function(isFavorVote){
      Proposals.setCurrentProposalVoteAndUpdateList(isFavorVote);
  };
  $scope.voteProposal = function(objectID, isFavorVote, isExpired){
      if(isExpired){
          $ionicPopup.alert({
              title: $filter('translate')('info-alert-popup-title'),
              template: $filter('translate')('proposal-details-page.vote.expired-proposal-error-label'),
              okText: $filter('translate')('info-alert-popup-ok-button-label'),
              okType: 'button-assertive' 
          });
          return;
      }
      // get current userID (if is logged)
      var currentUserId = LoginService.getUserId();
      if(currentUserId == null){
          $ionicPopup.confirm({
              title: $filter('translate')('info-alert-popup-title'),
              template: $filter('translate')('proposal-details-page.vote.user-not-logged-error-label'),
              cancelText: $filter('translate')('info-confirm-popup-cancel-button-label'),
              cancelType: 'button-default',
              okText: $filter('translate')('info-confirm-popup-login-button-label'),
              okType: 'button-assertive'
          }).then(function(res) { if(res) { $scope.openLoginModal(); } });
          return;
      }
      if(!$scope.votes.userHasVoted){
          // send the vote
          $http({
          method: 'GET',
          url: BILBOZKATU_BB_URL + 'proposal/vote?objectID='+ objectID + '&userID=' + currentUserId + 
               '&isFavorable=' + isFavorVote,
          timeout: 10000
        }).then(function successCallback(successCallback) {
            // this callback will be called asynchronously when the successCallback is available
            var response_data = successCallback.data;
            if(response_data.hasOwnProperty('message')){ 
                if(response_data.message == "The vote was successfully registered"){
                    $scope.votes.userHasVoted = true;
                    $scope.setCurrentProposalVoteAndUpdateList(isFavorVote);
                    if(isFavorVote) $scope.setFavorVote();
                    else $scope.setAgainstVote();   
                }else if(response_data.message == "The user's vote is already registered for the proposal"){
                    $scope.votes.userHasVoted = true;
                    $ionicPopup.alert({
                        title: $filter('translate')('info-alert-popup-title'),
                        template: $filter('translate')('proposal-details-page.vote.user-already-voted-error-label'),
                        okText: $filter('translate')('info-alert-popup-ok-button-label'),
                        okType: 'button-assertive' 
                    });
                }else if(response_data.message == "The 'objectID' or 'userID' does not exist in the database"){
                    $ionicPopup.alert({
                        title: $filter('translate')('info-alert-popup-title'),
                        template: $filter('translate')('proposal-details-page.vote.proposal-user-unregistered-error-label'),
                        okText: $filter('translate')('info-alert-popup-ok-button-label'),
                        okType: 'button-assertive' 
                    });
                }
            }
          }, function errorCallback(errorCallback) {
            $ionicPopup.alert({
                title: $filter('translate')('error-alert-popup-title'),
                template: $filter('translate')('proposal-details-page.vote.user-voting-error-label'),
                okText: $filter('translate')('error-alert-popup-ok-button-label'),
                okType: 'button-assertive' 
            });
            //if(errorCallback.status <= 1 || errorCallback.status == 404){
              // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
            //}
          }
        );
      }else{
          $ionicPopup.alert({
              title: $filter('translate')('info-alert-popup-title'),
              template: $filter('translate')('proposal-details-page.vote.user-already-voted-error-label'),
              okText: $filter('translate')('info-alert-popup-ok-button-label'),
              okType: 'button-assertive' 
          });
      }
  };
  
  // update feedback's rating values (called when 'Proposal details' loads or new feedback is submited)
  $scope.updateCurrentProposalAverageRating = function(objectID, timeout){
      $http({
        method: 'GET',
        url: USERS_FEEDBACK_BB_URL + 'feedback/list/average?serviceID='+ WELIVE_SERVICE_ID + '&objectID=' + objectID,
        timeout: timeout
      }).then(function successCallback(successCallback) {
          // this callback will be called asynchronously when the successCallback is available
          var response_data = successCallback.data;
          if(!response_data.hasOwnProperty('message') && 
            response_data.message != 'There are no feedbacks with the requested parameters'){
              // update current proposal's properties asynchronously if it is timeout error
              $scope.setCurrentProposalFeedbacksRating(response_data.averageRating, response_data.feedbackCount);
              // update loaded values (averageRating and feedbackCount) to the proposal of 'Listado peticiones'
              $scope.setListProposalFeedbackRating(response_data.objectID,
                            response_data.averageRating, response_data.feedbackCount);
          }
        }, function errorCallback(errorCallback) {
          $scope.setCurrentProposalFeedbacksError();
          //if(errorCallback.status <= 1 || errorCallback.status == 404){
            // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
          //}
        }
      );
  };

  // initialize vote's data of current user (manage also votes' icons)
  $scope.votes = {
      userHasVoted: false,
      isFavorVote: false,
      isAgainstVote: false
  };
  $scope.isFavorVote = function(){
      return $scope.votes.isFavorVote; 
  };
  $scope.setFavorVote = function(){
      $scope.votes.isFavorVote = true;
  };
  $scope.isAgainstVote = function(){
      return $scope.votes.isAgainstVote;
  };
  $scope.setAgainstVote = function(){
      $scope.votes.isAgainstVote = true;
  };

  // try to get current user's vote if exists
  var userIDParam = "";
  var currentUserId = LoginService.getUserId();
  if(currentUserId != null){
      userIDParam = '&userID=' + currentUserId;
      console.log("Searching vote of '" + currentUserId + "'...");
  }

  // initialize variables for checking if new proposals have been created
  $scope.newFeedbacks = {};
  $scope.newFeedbacks.showNewFeedbacksButton = false;

  // search proposal's details and votes (if user is logged also search his/her vote to change thumb's images)
  $http({
      method: 'GET',
      url: BILBOZKATU_BB_URL + 'proposal/details?objectID=' + $stateParams.playlistId + userIDParam,
      timeout: 10000
    }).then(function successCallback(successCallback) {

        // this callback will be called asynchronously when the successCallback is available
        if(!successCallback.data.hasOwnProperty('message') && 
          successCallback.data.message != 'There is no proposal in the database with the specified objectID'){
            $scope.setCurrentProposal(successCallback.data[0]);

            // update feedback average rating from usersFeedback's Building Block
            $scope.updateCurrentProposalAverageRating(successCallback.data[0].objectID, 10000);
            
            // analize if logged user has already voted
            if(successCallback.data[0].userVotesInFavor != -1 && 
               successCallback.data[0].userVotesAgainst != -1){
                // logged user, obtain vote data
                if(successCallback.data[0].userVotesInFavor > 0){
                    $scope.votes.userHasVoted = true;
                    $scope.setFavorVote();
                }else if(successCallback.data[0].userVotesAgainst > 0){
                    $scope.votes.userHasVoted = true;
                    $scope.setAgainstVote();
                } 
            }
        }else{
            // There is no proposal in the database with the specified objectID
            $ionicPopup.alert({
                title: $filter('translate')('error-alert-popup-title'),
                template: $filter('translate')('proposal-details-page.details.empty-error-label'),
                okText: $filter('translate')('error-alert-popup-ok-button-label'),
                okType: 'button-assertive' 
            });
            $ionicHistory.goBack();
        }

      }, function errorCallback(errorCallback) {
        console.log("Get proposal's details/Error status code: " + errorCallback.status);
            //if(errorCallback.status <= 1 || errorCallback.status == 404){
              // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
            //}
        $ionicPopup.alert({
            title: $filter('translate')('error-alert-popup-title'),
            template: $filter('translate')('proposal-details-page.details.unreachable-error-label'),
            okText: $filter('translate')('error-alert-popup-ok-button-label'),
            okType: 'button-assertive' 
        });
        $ionicHistory.goBack();
      }
    ).finally(
          function finallyCallback(callback, notifyCallback){
            // details, votes and user's vote (if is logged) are loaded
            $scope.getFeedbacksFirstBlock();
          }
  );

  // initialize  interval for checking periodically if new feedbacks has been created
  // and are not loaded to the list
  $scope.initializeNewFeedbacksCheking = function() {
      // calculate new feedbacks' cheking interval's delay
      var delay = NEW_FEEDBACKS_CHECKING_INTERVAL_VALUE;
      if(NEW_FEEDBACKS_CHECKING_INTERVAL_MODE == 'seconds'){
          delay = delay * 1000;
      }else if(NEW_FEEDBACKS_CHECKING_INTERVAL_MODE == 'minutes'){
          delay = delay * 60 * 1000;
      }

      var promise;
      $scope.newFeedbacks.startNewFeedbacksCheking = function() {
          $scope.newFeedbacks.stopNewFeedbacksCheking();
          promise = $interval(
              $scope.checkNewFeedbacks,
              delay, // delay : Number of milliseconds between each function call.
              0     // count (optional): Number of times to repeat. If not set, or 0, will repeat indefinitely.
          );
      }
      $scope.newFeedbacks.stopNewFeedbacksCheking = function() {
          $interval.cancel(promise);
      }
      // stop new feedbacks' checking when the user goes back to another page
      $scope.$on('$destroy', function() {
          $scope.newFeedbacks.stopNewFeedbacksCheking();
          console.log("New comments' checking stopped");
      });
      $scope.newFeedbacks.startNewFeedbacksCheking();
  };

  $scope.checkNewFeedbacks = function() {
      console.log('Checking if there are new comments...');

      var fromDate = ($scope.feedbacks.length>0)? $scope.feedbacks[0].date : '0000-0-0 00:00:00 +0100';
      $http({
        method: 'GET',
        url: USERS_FEEDBACK_BB_URL + 'feedback/list/count?'
            + 'serviceID='+ WELIVE_SERVICE_ID 
            + '&objectID=' + $scope.getCurrentProposal().objectID 
            + '&resultsFrom=' + fromDate.replace('+','%2B'), // '+' means "space" in URLs. Replace it with '%2B'.
        timeout: 5000
      }).then(function successCallback(successCallback) {
            if(successCallback.data.hasOwnProperty('message') 
              && successCallback.data.message != 'There are no feedbacks with the requested parameters'){
                $scope.newFeedbacks.showNewFeedbacksButton = true;
                $scope.newFeedbacks.stopNewFeedbacksCheking();
                console.log('There are more feedbacks');
            } //else{ console.log('There are no more feedbacks'); }
        }, function errorCallback(errorCallback) {
            console.log("Cheking new feedbacks' count/Error status code: " + errorCallback.status);
        }
      );
  }

  // initialize feedbacks' list and infinite-scroll's variables when details of current proposal are loaded
  $scope.getFeedbacksFirstBlock = function(){
      $scope.noMoreItemsAvailable = false; // initialize variable for infinite-scroll (of old feedbacks)
      $scope.feedbacksError = false; // initialize variable for get feedbacks' call 
      $scope.initialSearchCompleted = false; // avoid loadMore() function on page load
      $scope.feedbacks = [];
      $scope.newFeedback = {};
      $scope.newFeedback.rating = 1;

      // get first block of feedbacks' list ('x' feedbacks from newest one)
      $scope.callFeedbacksList(USERS_FEEDBACK_BB_URL + 'feedback/list?'
                              + 'serviceID='+ WELIVE_SERVICE_ID 
                              + '&objectID=' + $scope.getCurrentProposal().objectID 
                              + '&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK,
                              10000, false)
      .finally(function finallyCallback(callback, notifyCallback){
          $scope.$broadcast('scroll.infiniteScrollComplete');
          // once proposal's details and feedbacks' first block are loaded, configure and start 
          // new feedbacks' checking (if the proposal is expired the user can't send any feedback
          // so is not neccesary to check if there are new ones)
          if(!$scope.getCurrentProposal().isExpired){
              $scope.initializeNewFeedbacksCheking(); 
          }
      });
  };
  // method used in each feedback's ng-repeat for showing rating's stars
  $scope.getRatingCollection = function(num) {
      return new Array(num);   
  };
  
  // function to call usersFeedbackBB to obtain feedbacks (initial loading and loadMore() old or new feedbacks if neccesary)
  $scope.callFeedbacksList = function(url, timeout, areNewFeedbacks){
      var getProposalsCall = $http({
        method: 'GET',
        url: url,
        timeout: timeout
      }).then(
        function successCallback(successCallback){
            $scope.proposalsError = false;
            // there are proposals (not empty)
            var loadedFeedbacks = [];
            if(!successCallback.data.hasOwnProperty('message') 
               && successCallback.data.message != 'There are no feedbacks with the requested parameters'){

                  // iterate proposals. get status from creation date and average feedback's rating 
                  angular.forEach(successCallback.data, function(item){
                      // format date from "yyyy-MM-dd HH:mm:ss Z" into "dd/MM/yyyy | HH:mm"
                      var date = item.date;
                      item.creationDate = date.substr(8,2) + '/' + date.substr(5,2) + '/' + date.substr(0,4) + ' | '
                                          + date.substr(11,2) + ':' + date.substr(14,2); // + ':' + date.substr(17,2);
                      loadedFeedbacks.push(item); 
                  });
                  if(!areNewFeedbacks){
                    // add loaded old feedbacks to the end of the list
                    Array.prototype.push.apply($scope.feedbacks, loadedFeedbacks); 
                    console.log(loadedFeedbacks.length + "/" + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK 
                                + " old items have been added to feedbacks' list.");
                    if(loadedFeedbacks.length < ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK){
                      $scope.noMoreItemsAvailable = true;
                      console.log("There are no more feedbacks to add to the list.");
                    }
                  }else{
                    // add loaded new feedbacks to the beginning of the list
                    Array.prototype.unshift.apply($scope.feedbacks, loadedFeedbacks); 
                    console.log(loadedFeedbacks.length + " new item(s) added to feedbacks' list.");
                  } 
            }else{
                  $scope.noMoreItemsAvailable = true;
                  console.log("There are no more feedbacks to add to the list.");
            }

        }, function errorCallback(errorCallback){
            // called asynchronously if an error occurs or server returns errorCallback with an error status.
            // 'time out' error is not handled by angular (there is no status code to use), but executes this function

            // if has been attempted to obtain new comments it's not neccesary manage the error, 
            // another call will be done with 'interval'
            if(!areNewFeedbacks) $scope.feedbacksError = true;
            console.log("Get feedbacks/Error status code: " + errorCallback.status);
            //if(errorCallback.status <= 1 || errorCallback.status == 404){
              // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
            //}
        }
      );
      getProposalsCall.finally(
          function finallyCallback(callback, notifyCallback){
            $scope.initialSearchCompleted = true;
          }
      );
      return getProposalsCall;
  };
  
  // obtain, if possible, a new block of feedbacks older feedbacks
  $scope.loadMore = function() {
      if($scope.initialSearchCompleted && !$scope.noMoreItemsAvailable){ // <ion-infinite-scroll immediate-check="false"...>
                                                                         // and <ion-infinite-scroll ng-if="proposals.length"...> fails
          
          // get new feedbacks with date before the current oldest comment
          $scope.callFeedbacksList(USERS_FEEDBACK_BB_URL + 'feedback/list?'
                                  + 'serviceID='+ WELIVE_SERVICE_ID 
                                  + '&objectID=' + $scope.getCurrentProposal().objectID 
                                  + '&resultsTo=' + $scope.feedbacks[ $scope.feedbacks.length-1 ].date.replace('+','%2B')
                                  + '&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK,
                                  10000, false)
          .finally(function finallyCallback(callback, notifyCallback){
              $scope.$broadcast('scroll.infiniteScrollComplete');
          });
      }
  };
  // obtain all the new feedbacks to push them on top of the array
  $scope.loadNewFeedbacks = function() {
      var fromDate = ($scope.feedbacks.length>0)? $scope.feedbacks[0].date : '0000-0-0 00:00:00 +0100';
      $scope.callFeedbacksList(USERS_FEEDBACK_BB_URL + 'feedback/list?'
                                  + 'serviceID='+ WELIVE_SERVICE_ID 
                                  + '&objectID=' + $scope.getCurrentProposal().objectID 
                                  + '&resultsFrom=' + fromDate.replace('+','%2B'),
                                  10000, true)
      .finally(function finallyCallback(callback, notifyCallback){
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $scope.newFeedbacks.showNewFeedbacksButton = false;
          $scope.newFeedbacks.startNewFeedbacksCheking();
      });
  }

  // Scroll to top button
  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };
*/
});





myApp.directive('ionToggleText', function () {
  var $ = angular.element;
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      // Try to figure out what text values we're going to use 
      var textOn = $attrs.ngTrueValue || "EU",
          textOff = $attrs.ngFalseValue || 'ES';
      if ($attrs.ionToggleText) {
        var x = $attrs.ionToggleText.split(';');
        if (x.length === 2) {
          textOn = x[0] || textOn;
          textOff = x[1] || textOff;
        }
      }
      textOn = textOn.replace(/'/g, "");
      textOff = textOff.replace(/'/g, "");

      // Create the text elements
      var $handleTrue = $("<div class='handle-text handle-text-true'>" + textOn + "</div>"),
          $handleFalse = $('<div class="handle-text handle-text-false">' + textOff + '</div>');
      var label = $element.find('label');

      if (label.length) {
        label.addClass('toggle-text');
        // Locate both the track and handle elements
        var $divs = label.find('div'), $track, $handle;
        angular.forEach($divs, function (div) {
          var $div = $(div);
          if ($div.hasClass('handle')) {
            $handle = $div;
          } else if ($div.hasClass('track')) {
            $track = $div;
          }
        });

        if ($handle && $track) {
          // Append the text elements
          $handle.append($handleTrue);
          $handle.append($handleFalse);
          // Grab the width of the elements
          var wTrue = $handleTrue[0].offsetWidth,
              wFalse = $handleFalse[0].offsetWidth;
          // Adjust the offset of the left element
          $handleTrue.css('left', '-' + (wTrue + 10) + 'px');
          // Ensure that the track element fits the largest text
          var wTrack = Math.max(wTrue, wFalse);
          $track.css('width', (wTrack + 60) + 'px');
        }
      }

    }
  };
});




/*myApp.controller('ProposalListCtrl', function($scope, $rootScope, $translate, $http, $ionicPopover, $ionicScrollDelegate,
  $stateParams) { 
  //Proposals, WELIVE_SERVICE_ID, BILBOZKATU_BB_URL, USERS_FEEDBACK_BB_URL, ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK,
  //PROPOSAL_EXPIRATION_MEASUREMENT_MODE, PROPOSAL_EXPIRATION_MEASUREMENT_VALUE) {

  $scope.zones = zones; // load 'zones' list from zones.js for combobox
  $scope.noMoreItemsAvailable = false; // initialize variable for infinite-scroll
  $scope.proposalsError = false; // initialize variable for get proposals' call 
  $scope.initialSearchCompleted = false; // avoid loadMore() function on page load
  $scope.proposalsSearchMode = false; // false: get all proposals
                                      // true: proposals are filtered based on different criteria
  $scope.search = {zone:"all", category:0, text:""}; // object to store search form's values
  // initialize search criteria (used when searching proposals (and loadMore function))
  $scope.selectedZoneParam = "";
  $scope.selectedCategoryParam = ""; 
  $scope.selectedTextParam = "";
  
  // Set 'Proposals' factory functions to $scope
  Proposals.resetProposals(); 

  $scope.addProposalToList = function(item){
      Proposals.addProposalToList(item);
  };
  $scope.getProposalsList = function(){
      return Proposals.getProposalsList();
  };
  $scope.setListProposalFeedbackRating = function(objectID, averageRating, feedbackCount){
      return Proposals.setListProposalFeedbackRating(objectID, averageRating, feedbackCount);
  };
  $scope.setFeedbacksError = function(objectID){
      return Proposals.setFeedbacksError(objectID);
  };

  // function to call bilbozkatuBB to obtain proposals
  $scope.callProposalsList = function(url, timeout){

      var getProposalsCall = $http({
        method: 'GET',
        url: url,
        timeout: timeout
      }).then(
        function successCallback(successCallback){
            $scope.proposalsError = false;
            // there are proposals (not empty)
            if(!successCallback.data.hasOwnProperty('message') 
               && successCallback.data.message != 'There are no proposals with the requested parameters'){

                  // iterate proposals. get status from creation date and average feedback's rating 
                  angular.forEach(successCallback.data, function(item){

                      // calculate proposal status with creation date:
                      var date = item.creationDate;
                      // use angular-momentjs component to calculate the difference in months between dates
                      // (months [0-11]). Constructor parameters: [year, month, day, hour, min]
                      var _proposalDate = moment([date.substr(6,4), date.substr(3,2)-1, date.substr(0,2),
                        date.substr(13,2), date.substr(16,4)]);
                      var _now = moment();
                      // add 'isExpired' property to the json item:
                      var monthsDiff = _now.diff(_proposalDate, PROPOSAL_EXPIRATION_MEASUREMENT_MODE);
                      item.isExpired = ( monthsDiff >= PROPOSAL_EXPIRATION_MEASUREMENT_VALUE) ? true : false; 
                      /*console.log("Expired: " + item.isExpired 
                        + " (" + monthsDiff + " " + PROPOSAL_EXPIRATION_MEASUREMENT_MODE 
                        + ", limit " + PROPOSAL_EXPIRATION_MEASUREMENT_VALUE + ")");* /

                      item.averageRating = 0;
                      item.feedbackCount = 0;
                      item.feedbackError = false;
                      // get feedback average rating from usersFeedback's Building Block
                      $http({
                        method: 'GET',
                        url: USERS_FEEDBACK_BB_URL + 'feedback/list/average?serviceID='+ WELIVE_SERVICE_ID + '&objectID=' + item.objectID,
                        timeout: 10000
                      }).then(function successCallback(successCallback) {
                          // this callback will be called asynchronously when the successCallback is available
                          var response_data = successCallback.data;
                          if(!response_data.hasOwnProperty('message') && 
                            response_data.message != 'There are no feedbacks with the requested parameters'){
                              // update proposal's properties asynchronously if it is timeout error
                              $scope.setListProposalFeedbackRating(item.objectID, 
                                  response_data.averageRating, response_data.feedbackCount);
                          }
                        }, function errorCallback(errorCallback) {
                          $scope.setFeedbacksError(item.objectID);
                          //if(errorCallback.status <= 1 || errorCallback.status == 404){
                            // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
                          //}
                        }
                      );
                      $scope.addProposalToList(item); // add loaded new proposal to the list
                  })
                  
                  console.log(successCallback.data.length + "/" + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK 
                              + " new items added to proposals' list.");
                  if(successCallback.data.length < ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK){
                    $scope.noMoreItemsAvailable = true;
                    console.log("There are no more proposals to add to the list.");
                  }
                  
            }else{
                  $scope.noMoreItemsAvailable = true;
                  console.log("There are no more proposals to add to the list.");
            }

        }, function errorCallback(errorCallback){
            // called asynchronously if an error occurs or server returns errorCallback with an error status.
            // 'time out' error is not handled by angular (there is no status code to use), but executes this function
            $scope.proposalsError = true;
            console.log("Get proposals/Error status code: " + errorCallback.status);
            //if(errorCallback.status <= 1 || errorCallback.status == 404){
              // net::ERR_CONNECTION_REFUSED (API is offline) || Not found
            //}
        }
      );
      getProposalsCall.finally(
          function finallyCallback(callback, notifyCallback){
            $scope.initialSearchCompleted = true;
          }
      );
      return getProposalsCall;
  };

  // define functions to use ion-infinite-scroll
  /*$scope.$on('$stateChangeSuccess', function() {
    // $scope.loadMore(); // execute when opens 'New proposal' page and so on (avoid it).
  });* /
  $scope.loadMore = function() {
      if($scope.initialSearchCompleted && !$scope.noMoreItemsAvailable){ // <ion-infinite-scroll immediate-check="false"...>
                                                                         // and <ion-infinite-scroll ng-if="proposals.length"...> fails
          if(!$scope.proposalsSearchMode){
              $scope.callProposalsList(BILBOZKATU_BB_URL + 'proposal/list?resultsFrom=' + $scope.getProposalsList().length 
                                      + '&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK, 10000)
                  .finally(function finallyCallback(callback, notifyCallback){
                      $scope.$broadcast('scroll.infiniteScrollComplete');
                  });
          }else{
              $scope.callProposalsList(BILBOZKATU_BB_URL + 'proposal/list/search?resultsFrom=' + $scope.getProposalsList().length 
                                      + '&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK
                                      + $scope.selectedZoneParam + $scope.selectedCategoryParam + $scope.selectedTextParam, 10000)
                  .finally(function finallyCallback(callback, notifyCallback){
                      $scope.$broadcast('scroll.infiniteScrollComplete');
                  });
          }
          //$scope.$broadcast('scroll.infiniteScrollComplete');
      }
  };

  // Scroll to top button
  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };

  // Search button
  $scope.searchProposals = function() {
    var selectedAuxZoneParam = ($scope.search.zone == null || $scope.search.zone == "all")? "" : "&zone=" + $scope.search.zone.trim();
    var selectedAuxCategoryParam = ($scope.search.category == null || $scope.search.category == 0)? "" : "&category=" + $scope.search.category;
    var selectedAuxTextParam = ($scope.search.text.trim() == "")? "" : "&text=" + $scope.search.text.trim(); 

    if(selectedAuxZoneParam == "" && selectedAuxCategoryParam == "" && selectedAuxTextParam == ""){
        // criteria don't specified
        if($scope.proposalsSearchMode == false){
            $scope.noMoreItemsAvailable = false; // load more proposals without search's criteria if exists
        }else{
            // search all proposals again
            Proposals.resetProposals();
            $scope.noMoreItemsAvailable = false;
            $scope.proposalsSearchMode = false;
            $scope.callProposalsList(
                BILBOZKATU_BB_URL + 'proposal/list?resultsFrom=0&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK,
                10000);
        }
    }else{
        // criteria specified
        if(selectedAuxZoneParam == $scope.selectedZoneParam && selectedAuxCategoryParam == $scope.selectedCategoryParam
          && selectedAuxTextParam == $scope.selectedTextParam){
            // same search criteria already used
            $scope.noMoreItemsAvailable = false;
        }else{
            //search proposals
            $scope.selectedZoneParam = selectedAuxZoneParam;
            $scope.selectedCategoryParam = selectedAuxCategoryParam; 
            $scope.selectedTextParam = selectedAuxTextParam;
            Proposals.resetProposals();
            $scope.noMoreItemsAvailable = false;
            $scope.proposalsSearchMode = true;
            $scope.callProposalsList(BILBOZKATU_BB_URL + 'proposal/list/search?resultsFrom=0'
                                          + '&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK
                                          + $scope.selectedZoneParam + $scope.selectedCategoryParam + $scope.selectedTextParam, 10000);
        }
    }
  };

  // Load first block of proposals' list on page load
  if($stateParams.zone != null){
      // load proposals of the zone specified on the map
      $scope.search.zone = $stateParams.zone;
      $scope.searchProposals();
  }
  else{
      // load proposals without criteria
      $scope.callProposalsList(
          BILBOZKATU_BB_URL + 'proposal/list?resultsFrom=0&resultsCount=' + ITEMS_DISPLAYED_IN_LIST_IN_EVERY_BLOCK,
          10000);
  }

  // Reload categories' combobox if language changes
  $rootScope.$on('$translateChangeSuccess', function () {
      if($translate.use() == "es_ES"){    
          $scope.translatedCategories = $scope.spanishCategoriesArray;
      }else{
          $scope.translatedCategories = $scope.basqueCategoriesArray;
      }
  });

  // orderBy navbar button
  $ionicPopover.fromTemplateUrl('popover.html', {
    scope: $scope
  }).then(function(popover) {
      $scope.popover = popover;
  });
  $scope.openPopover = function($event) {
      $scope.popover.show($event);
  };
  $scope.closePopover = function() {
      $scope.popover.hide();
  };
  $scope.setOrder = function (order) {
      $scope.order = order;
      $scope.popover.hide();
  };
});*/



/*
myApp.factory('Proposals', function(){
    var proposals = {
        list: [],
        currentProposal: {}
    };

    return {
        resetProposals: function() {
          proposals.list = [];
          proposals.currentProposal = {};
        },
        addProposalToList: function(item) {
            proposals.list.push(item);
        },
        getProposalsList: function() {
            return proposals.list;
        },
        setListProposalFeedbackRating: function(objectID, averageRating, feedbackCount) {
            var i = 0, len = proposals.list.length;
            for (; i < len; i++) {
              if (proposals.list[i].objectID === parseInt(objectID)) {
                proposals.list[i].averageRating = averageRating;
                proposals.list[i].feedbackCount = feedbackCount;
                return true;
              }
            }
            return false;
        },
        setFeedbacksError: function(objectID) {
            var i = 0, len = proposals.list.length;
            for (; i < len; i++) {
              if (proposals.list[i].objectID === parseInt(objectID)) {
                proposals.list[i].feedbackCount = "";
                proposals.list[i].feedbackError = true;
                return true;
              }
            }
            return false;
        },
        getCurrentProposal: function() {
            return proposals.currentProposal;
        },
        setCurrentProposal: function(item) {
            proposals.currentProposal = item;
            proposals.currentProposal.votesCount = item.votesInFavor + item.votesAgainst;

            // get category's image
            var category = categories.filter( function(item){ return item.id == proposals.currentProposal.categoryID; } );
            if(category.length > 0) proposals.currentProposal.categoryImageSrc = category[0]['img_src'];

            // initialize status and feedback's average rating values
            proposals.currentProposal.isExpired = false;
            proposals.currentProposal.averageRating = 0;
            proposals.currentProposal.feedbackCount = 0;
            proposals.currentProposal.feedbackError = false;
            // obtain 'isExpired' that is calculated when ProposalListCtrl is loaded
            var i = 0, len = proposals.list.length;
            for (; i < len; i++) {
              if (proposals.list[i].objectID == proposals.currentProposal.objectID) {
                proposals.currentProposal.isExpired = proposals.list[i].isExpired;
                // update votes in proposal's list
                proposals.list[i].votesInFavor = proposals.currentProposal.votesInFavor;
                proposals.list[i].votesAgainst = proposals.currentProposal.votesAgainst;
                break;
              }
            }
        },
        setCurrentProposalFeedbacksRating: function(averageRating, feedbackCount) {
            proposals.currentProposal.averageRating = averageRating;
            proposals.currentProposal.feedbackCount = feedbackCount;
        },
        setCurrentProposalFeedbacksError: function() {
            proposals.currentProposal.feedbackCount = "";
            proposals.currentProposal.feedbackError = true;
        },
        setCurrentProposalVoteAndUpdateList: function(isFavorVote) {
            // update vote's in current proposal
            if(isFavorVote) proposals.currentProposal.votesInFavor++;
            else proposals.currentProposal.votesAgainst++;
            proposals.currentProposal.votesCount = proposals.currentProposal.votesInFavor 
                                                 + proposals.currentProposal.votesAgainst;
            // update vote's in list
            var i = 0, len = proposals.list.length;
            for (; i < len; i++) {
              if (proposals.list[i].objectID == proposals.currentProposal.objectID) {
                proposals.list[i].votesInFavor = proposals.currentProposal.votesInFavor;
                proposals.list[i].votesAgainst = proposals.currentProposal.votesAgainst;
                break;
              }
            }
        }
    };
});
*/




/*myApp.controller('StatisticsCtrl', function($scope, $filter, $translate, Proposals) {

  $scope.currentProposal = Proposals.getCurrentProposal();

  // The 1.0 version of the app only has 'citizen' type proposals
  $scope.currentProposal.typeTranslation = $filter('translate')('proposal-statistics-page.others.type-citizen-label');
  // Obtain category name in the current language
  var categoryTranslation = categories.filter(
      function(item){ return item.id == $scope.currentProposal.categoryID; }
  );
  $scope.currentProposal.categoryTranslation = categoryTranslation[0][$translate.use()];

  // chart's configuration
  if($scope.currentProposal.votesCount > 0){

      Chart.defaults.global.colours = [
        { // green
            fillColor: "#12C53Crgba(18,197,60,0.2)",
            strokeColor: "rgba(18,197,60,1)",
            pointColor: "rgba(18,197,60,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(18,197,60,0.8)"
        },
        { // red
            fillColor: "rgba(240,18,18,0.2)",
            strokeColor: "rgba(240,18,18,1)",
            pointColor: "rgba(240,18,18,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(240,18,18,0.8)"
        }
      ];
      // Configure chart's parameters
      $scope.data = [$scope.currentProposal.votesInFavor, $scope.currentProposal.votesAgainst];
      $scope.labels = [$filter('translate')('proposal-statistics-page.chart.favor-votes-legend'), 
                      $filter('translate')('proposal-statistics-page.chart.against-votes-legend')];
      
      // monitor chart's legend's values to implement correct translation
      $scope.$watchGroup(
          // array of expressions that will be individually watched.
          // the items in the array are observed via standard $watch operation and are examined on 
          // every call to $digest() to see if any items changes.
          [
            function() { return $filter('translate')('proposal-statistics-page.chart.favor-votes-legend'); },
            function() { return $filter('translate')('proposal-statistics-page.chart.against-votes-legend'); }
          ],
          // (callback) this listener is called whenever the return value of any expression changes
          function(newval, oldval, scope) { 
            $scope.labels[0] = newval[0]; // legend's label of votes in favor
            $scope.labels[1] = newval[1]; // legend's label of against votes
          } 
      );

  }else{

      // there are no votes
      Chart.defaults.global.colours = [
        { // grey
            fillColor: "rgba(183,173,173,0.2)",
            strokeColor: "rgba(183,173,173,1)",
            pointColor: "rgba(183,173,173,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(183,173,173,0.8)"
        }
      ];

      $scope.data = [1];
      $scope.labels = [$filter('translate')('proposal-statistics-page.chart.no-votes-legend')];
      $scope.$watchGroup(
          [ function() { return $filter('translate')('proposal-statistics-page.chart.no-votes-legend'); } ],
          function(newval, oldval, scope) { 
            $scope.labels[0] = newval[0]; // legend's label of 'no votes'
          } 
      );

  }

});*/
