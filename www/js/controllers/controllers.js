
var bilbonAppControllers = angular.module('starter.controllers', []);

bilbonAppControllers
    .controller('AppCtrl', appCtrl);


/**
 * Controller - Main (menu's filter)
 */
function appCtrl(
  $scope, 
  $rootScope, 
  $state, 
  $timeout, 
  $translate, 
  $ionicHistory, 
  $ionicPopup, 
  $filter, 
  UserLocalStorage, 
  Map, 
  $http, 
  $q,
  $ionicPopup, 
  $ionicPlatform, 
  $ionicLoading, 
  $ionicModal,
  FilteredPOIs,
  WELIVE_DATASET_API_URL) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  // ** define filter's model **

  $scope.filter = {}; 
  // store selection's values of categories (true|false), identified by 'id' attribute of categories.js:
  $scope.filter.selectedCategories = []; 
  $scope.filter.areCategoriesShown = false; // control whether the sublist of categories is displayed or not
  // store selection's values of location modes (true|false), identified by google-places' and 'device-gps':
  $scope.filter.selectedLocation = []; 
  $scope.filter.isLocationShown = false; // control whether the sublist of location modes is displayed or not
  $scope.filter.autocompleteLocationFilterInput = null; // Google Places' autocomplete object's input 
  // store selection's values of text's filter (true|false):
  $scope.filter.selectedText = false;
  $scope.filter.isTextShown = false;
  $scope.filter.textFilterInput = null;
  // store selection's values of 'only no official (only citizen's POIs) POIs's checkbox (true|false):
  $scope.filter.selectedCitizensPOIs = false;

  // define POIs' arrays
  $scope.gastronomyOfficialArray = [];
  $scope.tourismOfficialArray = [];
  $scope.accommodationOfficialArray = [];
  $scope.gastronomyCitizenArray = [];
  $scope.tourismCitizenArray = [];
  $scope.accommodationCitizenArray = [];


  // ** Configure categories for the filter **
 
  // Configure language of categories' array to use in the corresponding combobox/lists
  $scope.translatedCategories = []; // this variable will contain categories' list in the current language (used in ng-repeat)
  $scope.spanishCategoriesArray = [];
  $scope.basqueCategoriesArray = [];

  // Build spanish categories' array and initialize $scope.filter.selectedCategories array
  // (this array's items represents the categories, with the category name as 'label' in the corresponding
  // language and other data)
  angular.forEach(categories, function(item){
    if(item.datasetId != "bilbon-user-pois"){ // avoid dataset of citizens (it includes all categories)
      $scope.spanishCategoriesArray.push({id:item.id, categoryCustomNumericId:item.categoryCustomNumericId,
        datasetId:item.datasetId, jsonId:item.jsonId, label:item.es_ES, img_src:item.img_src}); 
      $scope.filter.selectedCategories[item.id] = false; // initialize model's categories to false (checkbox selection)
    } 
  });
  $scope.translatedCategories = $scope.spanishCategoriesArray; // initialize categories' language to spanish
  // Build basque categories' array
  angular.forEach(categories, function(item){
    if(item.datasetId != "bilbon-user-pois"){
      $scope.basqueCategoriesArray.push({id:item.id, categoryCustomNumericId:item.categoryCustomNumericId,
        datasetId:item.datasetId, jsonId:item.jsonId, label:item.eu_ES, img_src:item.img_src});  
    }
  });

  // Define functionality for menu's categories' item (toggle element)
  $scope.toggleCategories = function() {
    if ($scope.areCategoriesShown()){
     $scope.filter.areCategoriesShown = false;
    }
    else{ 
      $scope.filter.isLocationShown = false;    // hide location's filter
      $scope.filter.isTextShown = false;        // hide text's filter
      $scope.filter.areCategoriesShown = true;  // display categories' filter
    }
  };
  $scope.areCategoriesShown = function() {
    return $scope.filter.areCategoriesShown;
  };
  // watch category selection to add or remove a concrete category's POIs
  $scope.$watchCollection('filter.selectedCategories', 
    function(newValues, oldValues) { 
      angular.forEach(oldValues, function(item, key){
        // 'key' is the category identifier (int) of categories.js
        if(newValues[key] != null && oldValues[key] !== newValues[key]){
          if(newValues[key]) $scope.callDatasetCategoriesFilter(key); // do the search because of the activation of this filter
          else $scope.disableCategoryFilter(key); // disable filter
        }
            
      });
    }, 
    true
  );
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
 


  // ** Configure location for the filter **

  // initialize $scope.filter.selectedLocation array
  $scope.filter.selectedLocation['google-places'] = false;
  $scope.filter.selectedLocation['device-gps'] = false;

  // Define functionality for menu's location item (toggle element)
  $scope.toggleLocation = function() {
    if ($scope.isLocationShown()) {
      $scope.filter.isLocationShown = false;
    }
    else {
      $scope.filter.areCategoriesShown = false; // hide categories' filter
      $scope.filter.isTextShown = false;        // hide text's filter 
      $scope.filter.isLocationShown = true;     // display location's filter
    }
  };
  $scope.isLocationShown = function() {
    return $scope.filter.isLocationShown;
  };
  // detect location selection changing ($watchCollection does not work in this case)
  // used in 'ng-change' attribute. Only one location filter can be activated at the same time.
  $scope.locationSelectionChanged = function(locationMode, otherLocationMode) {
    if(locationMode == 'google-places' && $scope.filter.selectedLocation['google-places']){
      // the Google Places' checkbox has been activated, check if a location has been previously selected
      if(Map.getGPlacesLocationToSearch() == ''){
        // (the user has not selected a location from the suggestin list or there was an error in
        // 'place_changed' event getting it)
        console.log("Select a location from the suggestion list before activate the Google Places' filter");
        $scope.filter.selectedLocation[locationMode] = false; // don't activate the checkbox
        return;  
      }
    }

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
  // if the user empty the input, remove previously selected location and force the user to select another one 
  // if the Google Places' filter is not checked (otherwise the place will be stored and displayed when
  // the input's focus is lost)
  $scope.$watch('filter.autocompleteLocation', 
    function(newValue, oldValue) { 
      if(newValue == ''){ if(!$scope.filter.selectedLocation['google-places']) Map.setGPlacesLocationToSearch(''); }
    }
  );
  // update the Google Places' input field's value with the previously selected location text 
  // (useful if the user has changed the input but without selecting a location from the suggestions list, 
  //  and the input focus is lost (called in 'ng-blur' event of the input element))
  $scope.updateGPlacesInput = function(){
    $scope.filter.autocompleteLocationFilterInput = Map.getGPlacesLocationToSearch();
  };
  // Called by filter's 'gps/My location' item, this function do the same as <label for="device_gps_checkbox">.
  // It is used because the 'label' tag changes the item's height, being different than the previous
  // 'autocomplete' item's height implemented with div's. 
  // To mantain the same height in both sublist's elements, they're implemented with div's with a similar structure.
  $scope.gpsFilterClicked = function(){
    $scope.filter.selectedLocation['device-gps'] = $scope.filter.selectedLocation['device-gps']? false: true;
    $scope.locationSelectionChanged('device-gps', 'google-places');
  };



  // ** Configure 'text' for the filter **

  // Define functionality for menu's location item (toggle element)
  $scope.toggleText = function() {
    if ($scope.isTextShown()) {
      $scope.filter.isTextShown = false;
    }
    else {
      $scope.filter.areCategoriesShown = false; // hide categories' filter
      $scope.filter.isLocationShown = false;    // hide location's filter
      $scope.filter.isTextShown = true;         // display text filter 
    }
  };
  $scope.isTextShown = function() {
    return $scope.filter.isTextShown;
  };
  // detect text's filter selection changing ($watchCollection does not work in this case)
  // used in 'ng-change' attribute and also when the search icon is clicked.
  $scope.textSelectionChanged = function() {
    if($scope.filter.selectedText){
      $scope.searchByText();
    }else{
      $scope.disableTextFilter(); // disable filter
    }
  };
  // if the user has introduced text, execute the text's filter.
  // called when text's filter is activated or texts search button is clicked.
  $scope.searchByText = function() {
    if($scope.filter.textFilterInput == null || $scope.filter.textFilterInput == ''){
      $scope.filter.selectedText = false;
      console.log('Introduce a text to search, please.');
    }else{
      $scope.filter.selectedText = true;
      Map.setTextToSearch($scope.filter.textFilterInput);
      $scope.callTextFilter($scope.filter.textFilterInput);
    }
  };
  // remove searched text if the checkbox is not activated and the user removes the input value
  $scope.$watch('filter.textFilterInput', 
    function(newValue, oldValue) { 
      if(newValue == ''){ if(!$scope.filter.selectedText) Map.setTextToSearch(''); }
    }
  );
  // update the text's input field's value with the previously searched text 
  // (useful if the user has changed the input but without executing another search, 
  //  and the input focus is lost (called in 'ng-blur' event of the input element))
  $scope.updateTextInput = function(){
    $scope.filter.textFilterInput = Map.getTextToSearch();
  };



  // ** Configure 'citizen's POIs' for the filter **

  // Enable filter value changing by clicking in the text, not only in the checkbox.
  $scope.citizenFilterClicked = function(){
    $scope.filter.selectedCitizensPOIs = !$scope.filter.selectedCitizensPOIs;
    $scope.citizenPOIsSelectionChanged();
  };
  // detect 'only citizen's's filter selection changing ($watchCollection does not work in this case)
  // used in 'ng-change' attribute and also when the search icon is clicked.
  $scope.citizenPOIsSelectionChanged = function() {
    if($scope.filter.selectedCitizensPOIs){
      $scope.callAlsoCitizensFilter();
    }else{
      $scope.showOnlyOfficialPOIs(); // disable filter
    }
  };
















  
  // returns an array of integers of selected 'categoryCustomNumericId', or an empty array otherwise
  // (e.g. [1,3]: selected 1 and 3 categories (see 'config/categories.js'))
  function getSelectedCategories(){
    var selectedCategories = [];
    angular.forEach($scope.translatedCategories, function(item, key){ //iterate over existing categories
      if($scope.filter.selectedCategories[item.id] == true){ // check form's (model's) value
        selectedCategories.push(item.categoryCustomNumericId);
      }
    });
    return selectedCategories;
  };

  function checkFilterAndReloadMarkers(){
    // comprobar lo dicho
    // Map.reloadMarkers();
  }

  // get POIs of specific category and, if neccesary, searched by text (official or citinzen POIs). 
  // Returns a promise: if success, the api's response; otherwise error.
  function applyCategoryAndTextFilter(categoryCustomNumericId, isOfficial){
    var promise;
    promise = $q(function (resolve, reject) {
      // remove this category's official and no official POIs
      FilteredPOIs.removeCategoryPOIs(categoryCustomNumericId, isOfficial);
      
      // check if text filter is enabled or not, and add if neccesary
      var textInput = null;
      if($scope.filter.selectedText) textInput = $scope.filter.textFilterInput;
      // call official or citizen dataset to get POIs of specific category (and, maybe, filtered by text)
      FilteredPOIs.callCategoryAndTextFilter(categoryCustomNumericId, isOfficial, textInput)
      .then(
        function(response){ // FilteredPOIs.callCategoryAndTextFilter's promise resolved
          // resolve this function's promise
          resolve(response); // FilteredPOIs.callCategoryAndTextFilter's promise rejected
        }, 
        function(){
          // reject this function's promise
          reject();
        });
    });

    return promise; 
  }

  function applyLocationFilter(categoryCustomNumericId, isOfficial){
    var promise;
    promise = $q(function (resolve, reject) {
      // if location filter is disabled, don't apply it
      if($scope.filter.selectedLocation['google-places'] == false 
        && $scope.filter.selectedLocation['device-gps'] == false){
        resolve();
      }else{
        var lat = null;
        var lng = null;
        if($scope.filter.selectedLocation['google-places'] == true){
          lat = Map.getAutocomplete().getPlace().geometry.location.lat();
          lng = Map.getAutocomplete().getPlace().geometry.location.lng();
        }
        // apply location filter to stored POIs of specific category (if lat and lng are null, see gps's location)
        FilteredPOIs.callLocationFilter(categoryCustomNumericId, isOfficial, lat, lng)
        .then(
          function(){ // FilteredPOIs.callLocationFilter's promise resolved
            // resolve this function's promise
            resolve(); // FilteredPOIs.callLocationFilter's promise rejected
          }, 
          function(){
            // reject this function's promise
            reject();
          });
      } 
      
    });

    return promise; 
  }



  // ** Configure adding and removing filters **

  // Add a category's filter 
  // 'categoryId' parameter: 'id' property (0..Number of official categories-1) of 'config/categories.js' file
  // (note that $scope.translatedCategories' array's range must be the same as official category's ID 
  // identified from '0' to 'Number of official categories-1')
  $scope.callDatasetCategoriesFilter = function(categoryId){

    console.log('');
    console.log('Applying category filter... ("' + $scope.translatedCategories[categoryId].label + '")');
    // open loading panel
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        + $filter('translate')('menu.filter.category-search.loading-text')
    });

    // get official POIs based filtered by category (and, maybe, by text)
    applyCategoryAndTextFilter($scope.translatedCategories[categoryId].categoryCustomNumericId, true)
    .then(
      function(response){ // promise resolved, check location filter
        if(response.rows.length > 0){ // if there are POIs of the corresponding category (and text)
          applyLocationFilter().then( // apply location filter if it is enabled
            function(){ // promise resolved

            }function(){ // promise rejected

            }
          );
        } 
        //    then --> if ciudadano? applyCategoryAndTextFilter(.., false) + location
        //    then checkAndFinsihFilter

      }, function(){ // promise rejected, couldn't get POIs 

      });

    
    
      //return;
// ************************** VIEJO **************************

    /*var response = null;
    var url = null;

    // get dataset/json/marker's info of the selected category (stored in 'categories.js')
    var categoryInfo = categories.filter( function(item){ return item.id == categoryId; } );
    if(categoryInfo != null){
      var url = WELIVE_DATASET_API_URL + categoryInfo[0]['datasetId'] + '/resource/' + categoryInfo[0]['jsonId'] + '/query';
      console.log('Getting items from "' + url + '"...');
    }//else console.log('no encontrado con ', categoryId);

    // apply 'text' filter if neccesary
    var queryText = "";
    if($scope.filter.selectedText){
      var searchTextSQL = " LIKE '%" + $scope.filter.textFilterInput + "%' ";
      queryText = " AND (documentName " + searchTextSQL + " OR documentDescription " + searchTextSQL
                        + " OR web " + searchTextSQL + " OR email " + searchTextSQL + " OR country " + searchTextSQL
                        + " OR territory " + searchTextSQL + " OR municipality " + searchTextSQL
                        + " OR historicTerritory " + searchTextSQL + ") "; 
    }


    var queryText2 = " AND documentName LIKE '%La Granja%' "
    var sqlQuery = "SELECT _id AS id, documentName, documentDescription, latitudelongitude, web, phoneNumber, email, country, "
                + " territory, municipality, municipalityCode, historicTerritory, historicTerritoryCode "
                + " FROM rootTable WHERE municipalityCode = 480020 " + queryText2 + ";";
    console.log(sqlQuery);
    $http({
      method: 'POST',
      url: url,
      headers: { "Content-Type": "text/plain",
                 "Accept": "application/json" },
      data: sqlQuery, // select from Bilbao
      timeout: 10000
    }).then(function successCallback(successCallback) {
          // this callback will be called asynchronously when the successCallback is available
          response = successCallback.data;
        }, function errorCallback(errorCallback) {
          $scope.filter.selectedCategories[categoryId] = false; // set category's checkbox to false
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
          if(response != null){
            //FilteredPOIs.callDataset(true, categoryInfo[0]['datasetId'], response);
            //console.log(FilteredPOIs.getPOI(true, categoryInfo[0]['datasetId'], 2));
            FilteredPOIs.emptyPOIs();

            // $scope.filter.selectedLocation['device-gps'] = false; --> checkox OK, but not 'Removing...'

            // check location and citizen filters, and load markers
            //saveOfficialPOIs(response, categoryId);
            
            loadMarkers(response, categoryInfo, true);
          }
          else{
            $ionicPopup.alert({
                title: $filter('translate')('menu.filter.category-search.empty-popup-title'),
                template: $filter('translate')('menu.filter.category-search.empty-popup-text'),
                okText: $filter('translate')('menu.filter.category-search.empty-ok-button-label'),
                okType: 'button-assertive' 
            });
          } 
          // initialize the map (with or without data about proposals' count)
          //infoWindowArray = initialize($scope.proposalsCountByZones, $scope);
        }
    );*/

  };
  // save official pois' array (filtered by category and, maybe, by text and/or location)
  function saveOfficialPOIs(response, categoryJsonId){
    // save the obtained POIs (filtered by category and text)
    if(categoryId == 1){
      $scope.gastronomyOfficialArray = response;
    }else if(categoryId == 2){
      $scope.tourismOfficialArray = response;
    }else if(categoryId == 3){
      $scope.accommodationOfficialArray = response;
    }

    var positionPrueba;
    function success(position) {
      var selectedLatLng = {lat: position.coords.latitude, lng: position.coords.longitude };
      console.log('position: ', selectedLatLng);
      positionPrueba = selectedLatLng;
      console.log('positionPrueba1', positionPrueba);
      return selectedLatLng;
    };

    // check location's filter
    getCoordinates().then(function(){

    });

    function getCoordinates(){
       var promise;
        promise = $q(function (resolve, reject) {
            var lat = null;
            var lng = null;
            if($scope.filter.selectedLocation['google-places']){
              // get google places' coordinates
              lat = Map.getAutocomplete().getPlace().geometry.location.lat();
              lng = Map.getAutocomplete().getPlace().geometry.location.lng();
              var selectedLatLng = {lat: lat, lng: lng };
              filterLocation(categoryId, selectedLatLng); // update the corresponding official POIs array

            }else if($scope.filter.selectedLocation['device-gps']){
              //ar selectedLatLng = searchDeviceLocation();
              var selectedLatLng = searchDeviceLocation(success);
              if(selectedLatLng == null){
                $scope.filter.selectedLocation['device-gps'] = false; // disable filter because is not possible to get gps location
                $ionicPopup.alert({
                    title: $filter('translate')('menu.filter.category-search.error-popup-title'),
                    template: 'gps no se ha logrado',//$filter('translate')('menu.filter.category-search.empty-popup-text'),
                    okText: $filter('translate')('menu.filter.category-search.empty-ok-button-label'),
                    okType: 'button-assertive' 
                });

              }else{
                filterLocation(categoryId, selectedLatLng); // update the corresponding official POIs array
              }
            }
            resolve();
        });
        return promise;
    }
    console.log('aqui', selectedLatLng);
    console.log('positionPrueba2', positionPrueba);
    // check if citizens' POIs have to be loaded (of the corresponding category)

    
    // load filtered category markers


    /*// define POIs' arrays
    $scope.gastronomyOfficialArray = [];
    $scope.tourismOfficialArray = [];
    $scope.accommodationOfficialArray = [];
    $scope.gastronomyCitizenArray = [];
    $scope.tourismCitizenArray = [];
    $scope.accommodationCitizenArray = [];*/
  };

  /*function myCallback(result) {
      // Code that depends on 'result'
  }
  foo(myCallback);

  function foo(callback) {
      $.ajax({
          // ...
          success: callback
      });
  }*/
  

  function searchDeviceLocation(success){
      ionic.Platform.ready(function(){
        // will execute when device is ready, or immediately if the device is already ready.
        var options = {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 0
        };

        function error(err) {
          return null;
        };
        // Try HTML5 geolocation.
        if ("geolocation" in navigator) { // Check if Geolocation is supported (also with 'navigator.geolocation')
          navigator.geolocation.getCurrentPosition(success, error, options);
        }else{
          console.log('geolocaiton IS NOT available');
        }
      });
  }
  // remove from POIs' array the POIs that aren't near de selected location
  function filterLocation(categoryId, selectedLatLng){
    if(categoryId == 1){
      $scope.gastronomyOfficialArray.rows = $scope.gastronomyOfficialArray.rows.filter(coordinateFilter, selectedLatLng);
    }else if(categoryId == 2){
      $scope.tourismOfficialArray.rows = $scope.tourismOfficialArray.rows.filter(coordinateFilter, selectedLatLng);
    }else if(categoryId == 3){
      $scope.accommodationOfficialArray.rows = $scope.accommodationOfficialArray.rows.filter(coordinateFilter, selectedLatLng);
    }
  }
  // filter an array based on two coordinates
  function coordinateFilter(item, index, array) {
    var coordinatesLatLng =  item.latitudelongitude.split(",");
    var poiLatLng = {lat: Number(coordinatesLatLng[0]), lng: Number(coordinatesLatLng[1]) };
    return (arePointsNear(poiLatLng, this));
  }
  // check if a coordinate is near another one
  function arePointsNear(poiLatLng, selectedLatLng) {
    var sw = new google.maps.LatLng(selectedLatLng.lat() - 0.010, selectedLatLng.lng() - 0.010);
    var ne = new google.maps.LatLng(selectedLatLng.lat() + 0.010, selectedLatLng.lng() + 0.010);
    var bounds = new google.maps.LatLngBounds(sw, ne);
    return bounds.contains(poiLatLng);
  }


  // Remove category's filter.
  // 'categoryId': official category's identifier (0..Number of official categories-1) of config/categories.js file
  //             (note that $scope.translatedCategories' array's range is the same as categoryId's range)
  $scope.disableCategoryFilter = function(categoryId){
    console.log('Removing category filter... ("' + $scope.translatedCategories[categoryId].label + '")');

  };

  // Add location's filter.
  // 'locationMode': location searching mode ('google-places' | 'device-gps')
  $scope.callLocationFilter = function(locationMode){
    // if there is no selected any category, don't activate this filter
    if(getSelectedCategories().length == 0){
      $ionicPopup.alert({
          title: $filter('translate')('menu.filter.category-search.error-popup-title'),
          template: $filter('translate')('menu.filter.category-search.no-category-selected-error-popup-text'),
          okText: $filter('translate')('menu.filter.category-search.error-ok-button-label'),
          okType: 'button-assertive' 
      });
      $scope.filter.selectedLocation[locationMode] = false; // disable filter's checkbox
      return;
    }
    console.log('');
    console.log("Applying location filter... (mode: " + locationMode + ")");
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
        + $filter('translate')('menu.filter.category-search.loading-text')
    });



    if(locationMode == 'google-places'){
      var geometry  = Map.getAutocomplete().getPlace().geometry;
      if (!geometry) return;
      // If the place has a geometry, then present it on a map.
      //if (geometry.viewport) {
        //map.fitBounds(geometry.viewport);
      //} else {
        console.log('searched place: ', geometry.location.lat(), geometry.location.lng());
        //map.setCenter(geometry.location);
      //}
    }

  };
  // Remove location's filter.
  // Filter's search by location (with the radius specified in config/config.js).
  // 'locationMode': location searching mode ('google-places' | 'device-gps')
  $scope.disableLocationFilter = function(locationMode){
    console.log('Removing location filter... (mode: ' + locationMode + ')');

  };
  // Add text's filter
  $scope.callTextFilter = function(textToSearch){
    console.log('Applying text filter... (searching "' + textToSearch + '")');

  };
  // Remove text's filter.
  $scope.disableTextFilter = function(){
    console.log('Removing text filter...');

  };

  // Add 'also citizen's POIs' filter
  $scope.callAlsoCitizensFilter = function(){
    console.log("Applying citizens' filter... (showing also citizens' POIs)");
  };
  // Remove 'also citizen's POIs's filter
  $scope.showOnlyOfficialPOIs = function(){
    console.log("Removing citizens' filter... (showing only official POIs)");
  };





  // Show on the map the markers of the obtained items with the corresponding icons.
  // 'itemsFromDataset': the response of the /query method
  // 'categoryInfo': all the information related to the requested dataset stored in 'categories.js' 
  // 'isOfficialDataset': boolean parameter to know if the requested dataset is an official one or
  //                      the citizen's dataset (which includes all categories)
  function loadMarkers(itemsFromDataset, categoryInfo, isOfficialDataset){ 
    console.log('markers to display', itemsFromDataset.count, itemsFromDataset);

    var iconPath = null;
    if(isOfficialDataset) iconPath = categoryInfo[0]['marker'];

    var infoWindow = new google.maps.InfoWindow(); // define one infoWindow to close it when another is opened
    angular.forEach(itemsFromDataset.rows, function(item, key){

      // if the there are citizen's markers, they could be from any of the
      // categories, so is neccesary to assign the correct marker icon depending of each one
      if(!isOfficialDataset){
        if(item.category == categoryInfo[0]['gastronomy_categoryId']){
          iconPath = categoryInfo[0]['citizen_gastronomy_marker'];
        }else if(item.category == categoryInfo[0]['tourism_categoryId']){
          iconPath = categoryInfo[0]['citizen_tourism_marker'];
        }else if(item.category == categoryInfo[0]['accommodation_categoryId']){
          iconPath = categoryInfo[0]['citizen_accommodation_marker'];
        }
      }

      // get the marker coordinates
      var coordinatesLatLng =  item.latitudelongitude.split(",");
      var latitude = Number(coordinatesLatLng[0]);
      var longitude = Number(coordinatesLatLng[1]);

      var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),// place[i],
            map: Map.getMap(),
            title: item.documentName,
            icon: iconPath,
            animation : google.maps.Animation.DROP
      });
      
      google.maps.event.addListener(marker, 'click', function(){
          // load marker's infoWindow's content
          //var infoWindowContent = getInfoWindowContent(zone.id, this.title, proposalsCountByZones, 
          //    $scope.proposalLabel_sing, $scope.proposalLabel_plu);
          infoWindow.setOptions({
            content: item.documentName,
            maxWidth: 200
          });
          /*var infowindow = new google.maps.InfoWindow({
            content: item.documentName,
            maxWidth: 200
          });*/

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





  // ** Configure language changing (UI's switch and $translate's language) **

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
      $scope.translatedCategories = $scope.basqueCategoriesArray; // change language of menu's items categories' items
    else
      $scope.translatedCategories = $scope.spanishCategoriesArray;
  });
  


  // ** Configure user login **

  //$scope.loginData = {}; // initialize form data for the login modal
  UserLocalStorage.removeUserData(); 

  // Define function to show menu's login/logout items
  $scope.getCurrentUserId = function (){
      return UserLocalStorage.getUserId();
  }

  // Create the login modal that we will use later
  /*$ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function(modal) {
      $scope.modal = modal;
  });*/


  // Perform the login action when the user submits the login form
  /*$scope.doLogin = function() {
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
        UserLocalStorage.setUserData(currentUserSession)
        $scope.closeLoginModal();
    }, 500)
    .then(function(){
          var myPopup = $ionicPopup.show({
            template: "<center>" + $filter('translate')('info-alert-popup-login-label-left') + "'" 
              + UserLocalStorage.getUserId() + "'" + $filter('translate')('info-alert-popup-login-label-right') + "</center>",
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800); //close the popup after 1.8 seconds for some reason
      }//, function(error) { }
    );

  };*/

  /*$scope.doLogout = function() {
    // Simulate a login delay
    $timeout(function() {
        console.log('Doing logout');
        UserLocalStorage.removeUserData(); 
        $scope.loginData = {};
    }, 200)
    .then(function(){
          var myPopup = $ionicPopup.show({
            template: '<center>' + $filter('translate')('info-alert-popup-logout-label') + "</center>",
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);
      }//, function(error) { }
    );
  }*/

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });









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



    
  function searchDeviceLocation2(){
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
          timeout: 4000,
          maximumAge: 0
        };

        function success(position) {
          //console.log('position: ', position);
          //var lat = position.coords.latitude;
          //var lng = position.coords.longitude; 
          //var myLatlng = new google.maps.LatLng(lat, lng);
          var selectedLatLng = {lat: position.coords.latitude, lng: position.coords.longitude };
          console.log('position: ', selectedLatLng);
          return selectedLatLng;

          //$ionicLoading.hide();  
          /*var myPopup = $ionicPopup.show({
            template: '<center>Coordenadas GPS: ' + lat + ', ' + lng + '</center>',
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);*/
        };

        function error(err) {
          return null;
          //$ionicLoading.hide(); 
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
          /*var myPopup = $ionicPopup.show({
            template: '<center>Error ' +  err.code + ': ' + err.message + '</center>',
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);*/
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
          /*$ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Analizando GPS...'
          });*/
         
          navigator.geolocation.getCurrentPosition(success, error, options);
        }else{
          /*var myPopup = $ionicPopup.show({
            template: '<center>Geolocalización no disponible</center>',
            cssClass: 'custom-class custom-class-popup'
          });
          $timeout(function() { myPopup.close(); }, 1800);*/
          console.log('geolocaiton IS NOT available');
        }
      });
  }

}
