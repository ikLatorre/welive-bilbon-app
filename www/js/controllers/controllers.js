
var bilbonAppControllers = angular.module('starter.controllers', []);

bilbonAppControllers
    .controller('AppCtrl', AppCtrl);

AppCtrl.$inject = ['$scope', '$rootScope', '$state', '$timeout', '$translate', '$ionicHistory', '$ionicPopup', 
                  '$filter', '$http', '$q', '$ionicPlatform', '$ionicLoading', '$ionicModal', 
                  'UserLocalStorage', 'FilteredPOIs', 'Map', 'WELIVE_DATASET_API_URL'];

/**
 * Controller - Main (menu's filter and language selection)
 */
function AppCtrl(
  $scope, 
  $rootScope, 
  $state, 
  $timeout, 
  $translate, 
  $ionicHistory, 
  $ionicPopup, 
  $filter,   
  $http, 
  $q,
  $ionicPlatform, 
  $ionicLoading, 
  $ionicModal,
  UserLocalStorage, 
  FilteredPOIs,
  Map,
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




  // ** Configure user's login **

  // Uncomment below to force 'Log out' when the app is started
  // UserLocalStorage.removeUserData(); 
  // UserLocalStorage.removeOAuthData(); 

  // Define function to show or hide menu's login item or to know if user has logged in
  $scope.getCurrentUserId = function (){
      return UserLocalStorage.getUserId();
  }




  // ** Configure language changing (menu's modal panel and $translate's language) **

  // define available languages (translations stored in messages/ directory)
  $scope.selectableLanguages = [
    { id: "es_ES", label : "Español" },
    { id: "eu_ES", label : "Euskara" },
    { id: "en_EN", label : "English" }
  ];
  $scope.selectedLang = 'es_ES'; // enable by default Ionic's .active class to 'Español' of the language selection list
  $scope.changeLang = function(newValue, oldValue){
    console.log('Language changed: newValue ', newValue, ' / oldValue ', oldValue);
    // avoid change when the selected language is the previously selected one
    if(newValue != oldValue){
      $translate.use(newValue); // es_ES | eu_ES | en_EN 
    }
  }; 
  // change $scope.translatedCategories to the selected language (to change combobox's results for example)
  // this is neccesary because the language is changed with the menu opened, and some combobox'es could be seen there at the same time
  $rootScope.$on('$translateChangeEnd', function() { 
    if($translate.use() == "es_ES")
      $scope.translatedCategories = $scope.spanishCategoriesArray; // change language of menu's items categories' items
    else if($translate.use() == "eu_ES"){
      $scope.translatedCategories = $scope.basqueCategoriesArray;
    }else if($translate.use() == "en_EN"){
      $scope.translatedCategories = $scope.englishCategoriesArray;
    }
  });




  // ** Configure categories for the filter **
 
  // Configure language of categories' array to use in the corresponding combobox/lists (see config/categories.js)
  $scope.translatedCategories = []; // this variable will contain categories' list in the current language (used in ng-repeat)
  $scope.spanishCategoriesArray = [];
  $scope.basqueCategoriesArray = [];
  $scope.englishCategoriesArray = [];

  // Build spanish categories' array and initialize $scope.filter.selectedCategories array
  // (this array's items represents the categories, with the category name as 'label' in the corresponding
  // language and other data)
  angular.forEach(categories, function(item){
    if(item.isOfficial){ // avoid dataset of citizens (it includes all categories)
      $scope.spanishCategoriesArray.push({id:item.id, categoryCustomNumericId:item.categoryCustomNumericId,
        datasetId:item.datasetId, jsonId:item.jsonId, label:item.es_ES, img_src:item.img_src}); 
      $scope.filter.selectedCategories[item.id] = false; // initialize model's categories to false (checkbox selection)
    } 
  });
  $scope.translatedCategories = $scope.spanishCategoriesArray; // initialize categories' language to spanish
  // Build basque categories' array
  angular.forEach(categories, function(item){
    if(item.isOfficial){
      $scope.basqueCategoriesArray.push({id:item.id, categoryCustomNumericId:item.categoryCustomNumericId,
        datasetId:item.datasetId, jsonId:item.jsonId, label:item.eu_ES, img_src:item.img_src});  
    }
  });
  // Build english categories' array
  angular.forEach(categories, function(item){
    if(item.isOfficial){
      $scope.englishCategoriesArray.push({id:item.id, categoryCustomNumericId:item.categoryCustomNumericId,
        datasetId:item.datasetId, jsonId:item.jsonId, label:item.en_EN, img_src:item.img_src});  
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
      console.log('aqui');
      if(Map.getGPlacesLocationToSearch() == ''){
        // (the user has not selected a location from the suggestin list or there was an error in
        // 'place_changed' event getting it)
        $ionicPopup.alert({
            title: $filter('translate')('menu.filter.location-search.unselected-autocomplete.info-popup-title'),
            template: $filter('translate')('menu.filter.location-search.unselected-autocomplete.info-popup-text'),
            okText: $filter('translate')('menu.filter.location-search.info-ok-button-label'),
            okType: 'button-assertive' 
        });
        console.log("Select a location from the suggestion list before activate the Google Places' filter");
        $scope.filter.selectedLocation[locationMode] = false; // don't activate the checkbox
        return;  
      }
    }

    var isLocationSwitched = false; // used in '$scope.callLocationFilter(...)' to manage location filter
    // switch between location modes if neccesary ('google-places' | 'device-gps')
    if($scope.filter.selectedLocation[locationMode]){
      // activate location mode, check if the other mode is already activated to disable it if is neccesary
      if($scope.filter.selectedLocation[otherLocationMode]){ 
        isLocationSwitched = true;
        $scope.filter.selectedLocation[otherLocationMode] = false;
        $scope.disableLocationFilter(otherLocationMode, isLocationSwitched); // disable filter
      }
      $scope.callLocationFilter(locationMode, isLocationSwitched); // do the search because of the activation of this filter
    }else{
      $scope.disableLocationFilter(locationMode, isLocationSwitched); // disable filter
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
      console.log('Introduce a text to search, please.');
      $ionicPopup.alert({
          title: $filter('translate')('menu.filter.location-search.text-empty.info-popup-title'),
          template: $filter('translate')('menu.filter.location-search.text-empty.info-popup-text'),
          okText: $filter('translate')('menu.filter.location-search.text-empty.info-ok-button-label'),
          okType: 'button-assertive' 
      });
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








  // ** Manage the filters' enabling and disabling (auxiliary functions) **

  
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

  // hide $ionicLoading panel after reloading the filter, and show the new POIs in the map
  function finishFilterAndReloadMarkers(){
    $ionicLoading.hide();
    // with the filter's errors if all the categories' checkboxes are programatically disabled, disable too other filters
    // (in this case the errors cause alert panels, so is not neccesary to check if checkboxes are disabled or not)

    Map.reloadMarkers()
    .then(function(){
      console.log('All markers have been reloaded.');
      console.log();
    });
  }

  // show category empty alert based on category and type (official or citizen)
  // if 'categoryName' parameter is null, get it from 'categoryCustomNumericId' parameter
  function showCategoryEmptyAlert(isOfficial, categoryName, categoryCustomNumericId){
    var templateTextlanguageId;
    if(isOfficial) templateTextlanguageId = 'menu.filter.category-search.empty-official-popup-text';
    else templateTextlanguageId = 'menu.filter.category-search.empty-citizen-popup-text';
    
    // get the name of the category
    var categoryNameText = categoryName; 
    if(categoryName == null) categoryNameText = getCategoryTranslatedName(categoryCustomNumericId);

    $ionicPopup.alert({
        title: $filter('translate')('menu.filter.category-search.info-popup-title'),
        template: '(' + categoryNameText + ') ' + $filter('translate')(templateTextlanguageId),
        okText: $filter('translate')('menu.filter.category-search.alert-ok-button-label'),
        okType: 'button-assertive' 
    });
  }

  // show category error alert based on category and type (official or citizen)
  // if 'categoryName' parameter is null, get it from 'categoryCustomNumericId' parameter
  function showCategoryErrorAlert(isOfficial, categoryName, categoryCustomNumericId){
    var templateTextlanguageId;
    if(isOfficial) templateTextlanguageId = 'menu.filter.category-search.error-official-popup-text';
    else templateTextlanguageId = 'menu.filter.category-search.error-citizen-popup-text';

    // get the name of the category
    var categoryNameText = categoryName; 
    if(categoryName == null) categoryNameText = getCategoryTranslatedName(categoryCustomNumericId);

    $ionicPopup.alert({
        title: $filter('translate')('menu.filter.category-search.error-popup-title'),
        template: '(' + categoryNameText + ') ' + $filter('translate')(templateTextlanguageId),
        okText: $filter('translate')('menu.filter.category-search.alert-ok-button-label'),
        okType: 'button-assertive' 
    });
  }

  // get category's translated name based on 'categoryCustomNumericId' (see config/categories.js)
  // his function is used in 'showCategoryEmptyAlert(...)' and 'showCategoryErrorAlert(...)'
  function getCategoryTranslatedName(categoryCustomNumericId){ 
    var categoryInfo = categories.filter( function(item){
      return (item.categoryCustomNumericId == categoryCustomNumericId && item.isOfficial == true); 
    });
    if(categoryInfo != null) return $scope.translatedCategories[categoryInfo[0]['id']].label;
  }

  // show array of POIs empty alert because of location based on category and type (official or citizen)
  // if 'categoryName' parameter is null, get it from 'categoryCustomNumericId' parameter
  function showLocationEmptyAlert(isOfficial, categoryName, categoryCustomNumericId){
    var templateTextlanguageId;
    if(isOfficial) templateTextlanguageId = 'menu.filter.location-search.empty-official-popup-text';
    else templateTextlanguageId = 'menu.filter.location-search.empty-citizen-popup-text';
    
    // get the name of the category
    var categoryNameText = categoryName; 
    if(categoryName == null) categoryNameText = getCategoryTranslatedName(categoryCustomNumericId);

    $ionicPopup.alert({
        title: $filter('translate')('menu.filter.location-search.info-popup-title'),
        template: '(' + categoryNameText + ') ' + $filter('translate')(templateTextlanguageId),
        okText: $filter('translate')('menu.filter.location-search.alert-ok-button-label'),
        okType: 'button-assertive' 
    });
  }

  function showGpsLocationErrorAlert(){
    // disable gps location filter to avoid this error to repeat with each selected category (both official and citizen)
    $scope.filter.selectedLocation['device-gps'] = false;

    $ionicPopup.alert({
        title: $filter('translate')('menu.filter.location-search.error-popup-title'),
        template: $filter('translate')('menu.filter.location-search.error-popup-text'),
        okText: $filter('translate')('menu.filter.location-search.alert-ok-button-label'),
        okType: 'button-assertive' 
    });
  }

  // get POIs of specific category and, if neccesary, searched by text (official or citizen POIs). 
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
          resolve(response); 
        }, 
        function(){ // FilteredPOIs.callCategoryAndTextFilter's promise rejected
          // reject this function's promise
          reject();
        });
    });

    return promise; 
  }

  // apply location filter (override stored POIs' array) to specific category and type (official or not)
  // Returns a promise: resolved with 'filteredArray' parameter (null if it isn't neccesary to apply this filter) 
  // or rejected with 'errorType': 'gps-error' (couldn't get device's location) or 'bounds-error' (apply to null POIs array)
  function applyLocationFilter(categoryCustomNumericId, isOfficial){
    var promise;
    promise = $q(function (resolve, reject) {
      // if location filter is disabled, don't apply it
      if($scope.filter.selectedLocation['google-places'] == false 
        && $scope.filter.selectedLocation['device-gps'] == false){
        resolve(null);
      }else{
        var lat = null;
        var lng = null;
        if($scope.filter.selectedLocation['google-places'] == true){
          // get Google Autocomplete's location if selected
          lat = Map.getAutocomplete().getPlace().geometry.location.lat();
          lng = Map.getAutocomplete().getPlace().geometry.location.lng();
        }
        // apply location filter to stored POIs of specific category (if lat and lng are null, get gps's location)
        FilteredPOIs.callSelectedLocationFilter(categoryCustomNumericId, isOfficial, lat, lng)
        .then(
          function(filteredArray){ // FilteredPOIs.callSelectedLocationFilter's promise resolved
            // resolve this function's promise
            resolve(filteredArray);
          }, 
          function(errorType){ // FilteredPOIs.callSelectedLocationFilter's promise rejected
            // reject this function's promise (errorType: 'gps-error' or 'bounds-error')
            // 'bounds-error': could not get specific category array to apply the location filter
            // 'gps-error': could not get device location to try to apply the location filter
            reject(errorType);
          });
      } 
      
    });

    return promise; 
  }


  // get POIs of the corresponding category (applying text and location filters if neccesary)
  // 'categoryCustomNumericId' parameter to specify the category (see config/categories.js)
  // 'categoryTranslatedName' parameter is used for category custom alert messages (in some 'getPOIsWithAllFilters(...)'
  //    function calls 'categoryTranslatedName' parameter is null, so use 'categoryCustomNumericId' for those custom alerts)
  // 'isOfficial' parameter to specify if is neccesary to get official or citizen POIs
  function getPOIsWithAllFilters(categoryCustomNumericId, categoryTranslatedName, isOfficial){
    var promise;
    promise = $q(function (resolve, reject) {

        if(!isOfficial && !$scope.filter.selectedCitizensPOIs){ 
          resolve(); // citizen POIs' filter is disabled, don't check them
          return;
        }

        // get POIs filtered by category (and, maybe, by text)
        applyCategoryAndTextFilter(categoryCustomNumericId, isOfficial)
        .then( 
        function(response){ // promise resolved, check location filter
            if(response.rows.length > 0){ // if there are POIs of the corresponding category (and text)
              applyLocationFilter(categoryCustomNumericId, isOfficial) // apply location filter if it is enabled
              .then( function(filteredArray){ // promise resolved, check location filter's result
                  // 'filteredArray' is 'null' if location filter is disabled, otherwise it is the filtered array 
                  if(filteredArray != null && filteredArray.length == 0){
                    // there are no POIs with the requested location filter
                    if(categoryTranslatedName == null) showLocationEmptyAlert(isOfficial, null, categoryCustomNumericId);
                    else showLocationEmptyAlert(isOfficial, categoryTranslatedName, null);
                  }
                  resolve(); 
              }, function(errorType){ // promise rejected ('errorType': 'gps-error' or 'bounds-error')
                  // 'bounds-error': could not get specific category array to apply the location filter
                  // 'gps-error': could not get device location to try to apply the location filter
                  if(errorType == 'gps-error'){ showGpsLocationErrorAlert(); }
                  //else if(errorType == 'bounds-error'){} 
                  resolve();
              });
            }else{
              // there are no POIs with the requested category and, maybe, text
              if(categoryTranslatedName == null) showCategoryEmptyAlert(isOfficial, null, categoryCustomNumericId);
              else showCategoryEmptyAlert(isOfficial, categoryTranslatedName, null);
              resolve();
            }

        }, function(){ // promise rejected, couldn't get POIs 
            if(categoryTranslatedName == null) showCategoryErrorAlert(isOfficial, null, categoryCustomNumericId);
            else showCategoryErrorAlert(isOfficial, categoryTranslatedName, null);
            resolve();
        });

    });

    return promise;
  }

  // function to run in every loop of the async cycle to apply enabled filters for all selected categories
  // see 'asyncLoopForCategoriesFilter(...)', used for asynchronous for cycle
  function filterCategoryLoopFunction(categoryCustomNumericId, categoryTranslatedName, iterationIndex, callback) {
      console.log('Starting iteration ', iterationIndex); 
      // get category official POIs and filter by text and location if neccesary; repeat for citizens' POIs
      // ensure that the functions have been finished before calling the callback function for reload the markers
      getPOIsWithAllFilters(categoryCustomNumericId, categoryTranslatedName, true)
      .then(function(){ 
          getPOIsWithAllFilters(categoryCustomNumericId, categoryTranslatedName, false)
          .then(function(){
              callback();
          });
        });
  };

  // function to run in every loop of the async cycle to apply enabled filters for all selected categories
  // see 'asyncLoopForCategoriesFilter(...)', used for asynchronous for cycle
  function filterCategoryCitizenLoopFunction(categoryCustomNumericId, iterationIndex, callback) {
      console.log('Starting iteration ', iterationIndex); 
      // get category citizens' POIs and filter by text and location if neccesary
      getPOIsWithAllFilters(categoryCustomNumericId, null, false)
      .then(function(){
          callback();
      });
  };



  // apply location filter to stored POIs
  function getPOIsWithLocationFilter(categoryCustomNumericId, isOfficial){
    var promise;
    promise = $q(function (resolve, reject) {

      if(!isOfficial && !$scope.filter.selectedCitizensPOIs){ 
        resolve(); // citizen POIs' filter is disabled, don't check them
        return;
      }

      applyLocationFilter(categoryCustomNumericId, isOfficial) // apply location filter if it is enabled
      .then( function(filteredArray){ 
          // 'filteredArray' is 'null' if location filter is disabled, otherwise it is the filtered array 
          if(filteredArray != null && filteredArray.length == 0){
            showLocationEmptyAlert(isOfficial, null, categoryCustomNumericId);
          }
          resolve(); 
      }, function(errorType){ // promise rejected ('errorType': 'gps-error' or 'bounds-error')
          // 'bounds-error': could not get specific category array to apply the location filter
          // 'gps-error': could not get device location to try to apply the location filter
          if(errorType == 'gps-error'){ showGpsLocationErrorAlert(); }
          //else if(errorType == 'bounds-error'){} 
          resolve();
      });

    });

    return promise;
  }

  // function to run in every loop of the async cycle to apply location filter for all stored POIs
  // see '$scope.callLocationFilter(...)', used for asynchronous for cycle
  function filterLocationLoopFunction(categoryCustomNumericId, iterationIndex, callback) {
      console.log('Starting iteration ', iterationIndex); 
      // filter stored POIs by location if neccesary; repeat for citizens' POIs
      getPOIsWithLocationFilter(categoryCustomNumericId, true)
      .then(function(){ 
          getPOIsWithLocationFilter(categoryCustomNumericId, false)
          .then(function(){
              callback(); // go to the next loop
          });
      });
  };

  // iterate over 'categoryCustomNumericIdArrayItem' array, applying for each 'categoryCustomNumericId' 
  // category+text+location's (if neccesary) filters both for official and citizens' POIs
  // (e.g. used in '$scope.callDatasetCategoriesFilter(...)')
  function asyncLoopForCategoriesFilter(iterations, func, callback) {
      var index = 0;
      var done = false;
      var loop = {
          next: function() {
              if (done) return;

              if(index < iterations){
                 index++;
                 func(loop);
              }else{
                done = true;
                callback();
              }
          },

          iteration: function() {
              return index - 1;
          },

          break: function() {
              done = true;
              callback();
          }
      };
      loop.next();
      return loop;
  };

  





  // ** Configure adding and removing filters **

  // Add a category's filter 
  // 'categoryId' parameter: 'id' property (0..Number of official categories-1) of 'config/categories.js' file
  // (note that $scope.translatedCategories' array's range must be the same as official category's ID 
  // identified from '0' to 'Number of official categories-1')
  // After official POIs have been loaded, repeat the process with the citizens'
  $scope.callDatasetCategoriesFilter = function(categoryId){

    console.log('');
    console.log('Applying category filter... ("' + $scope.translatedCategories[categoryId].label + '")');
    // open loading panel
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                                    + $filter('translate')('menu.filter.search.loading-text')
    });

    var categoryCustomNumericIdArrayItem = [];
    categoryCustomNumericIdArrayItem.push($scope.translatedCategories[categoryId].categoryCustomNumericId);

    // iterate one time the async cycle for getting filtered POIS of 'categoryId'
    // apply category[+text][+location] filter for official [+and citizens'] POIs 
    asyncLoopForCategoriesFilter(
      // number of iterations (categoryCustomNumericIdArrayItem.length == 1 in this case)
      1, 

      // apply enabled filters for this category (for official and, if neccesary, citizens' POIs) 
      function(loop) { 
        filterCategoryLoopFunction(
            categoryCustomNumericIdArrayItem[loop.iteration()], 
            $scope.translatedCategories[categoryId].label, loop.iteration(),
            function(result) { // callback for 'filterCategoryLoopFunction(...)' function 
              console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
              loop.next(); // for cycle could continue
            }
        );
      },

      // callback function to be executed when cycle is ended
      function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); }
    );

  };
  // Remove category's filter.
  // 'categoryId': official category's identifier (0..Number of official categories-1) of config/categories.js file
  //             (note that $scope.translatedCategories' array's range is the same as categoryId's range)
  $scope.disableCategoryFilter = function(categoryId){
    console.log(''); 
    console.log('Removing category filter... ("' + $scope.translatedCategories[categoryId].label + '")');
    // open loading panel
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                      + $filter('translate')('menu.filter.category-search.remove-text')
    });

    // remove all POIs from the selected category (official and citizens')
    FilteredPOIs.removeCategoryPOIs($scope.translatedCategories[categoryId].categoryCustomNumericId, true);
    FilteredPOIs.removeCategoryPOIs($scope.translatedCategories[categoryId].categoryCustomNumericId, false);

    // hide loading panel and reload the map's markers
    finishFilterAndReloadMarkers();
  };

  // Add location's filter.
  // 'locationMode': location searching mode ('google-places' | 'device-gps')
  // 'isLocationSwitched': true if the other 'locationMode' filter is already applied; false otherwise.
  $scope.callLocationFilter = function(locationMode, isLocationSwitched){
    var activatedCategoriesArray = getSelectedCategories();
    // if there is no selected any category, don't activate this filter
    if(activatedCategoriesArray.length == 0){
      $ionicPopup.alert({
          title: $filter('translate')('menu.filter.category-search.error-popup-title'),
          template: $filter('translate')('menu.filter.category-search.no-category-selected-error-popup-text'),
          okText: $filter('translate')('menu.filter.category-search.alert-ok-button-label'),
          okType: 'button-assertive' 
      });
      $scope.filter.selectedLocation[locationMode] = false; // disable filter's checkbox
      return;
    }
    console.log('');
    console.log("Applying location filter... (mode: " + locationMode + ")");
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                        + $filter('translate')('menu.filter.search.loading-text')
    });

    if(isLocationSwitched){
      // this 'locationMode' filter is enabled after switching between location filters (so reload all the filters
      // because they are already filtered by previously selected location):
      // iterate over activated categories: apply category[+text][+location] filter for official [+and citizens'] POIs 
      asyncLoopForCategoriesFilter(
        // number of iterations 
        activatedCategoriesArray.length, 

        // apply enabled filters for this category (for official and, if neccesary, citizens' POIs) 
        function(loop) { 
          filterCategoryLoopFunction(
              activatedCategoriesArray[loop.iteration()], null, loop.iteration(),
              function(result) { // callback for 'filterCategoryLoopFunction(...)' function 
                console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
                loop.next(); // for cycle could continue
              }
          );
        },

        // callback function to be executed when cycle is ended
        function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); }
      );

    }else{
      // apply location filter to existing POIs (previously the location filter hasn't been selected)
      asyncLoopForCategoriesFilter(
        // number of iterations 
        activatedCategoriesArray.length, 

        // apply location filter if enabled (official and, if selected, citizns' POIs)
        function(loop) { 
          filterLocationLoopFunction(
              activatedCategoriesArray[loop.iteration()], loop.iteration(),
              function(result) { // callback for 'filterLocationLoopFunction(...)' function 
                console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
                loop.next(); // for cycle could continue
              }
          );
        },

        // callback function to be executed when cycle is ended
        function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); }
      );
    }

  };
  // Remove location's filter.
  // Filter's search by location.
  // 'locationMode': location searching mode ('google-places' | 'device-gps')
  // 'isLocationSwitched': true if the other 'locationMode' filter is already applied; false otherwise.
  $scope.disableLocationFilter = function(locationMode, isLocationSwitched){
    var activatedCategoriesArray = getSelectedCategories();
    console.log('');
    console.log('Removing location filter... (mode: ' + locationMode + ')');
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                        + $filter('translate')('menu.filter.search.loading-text')
    });

    if(!isLocationSwitched){
      // remove filter not to be switched by another one, so reload all POIs again
      // iterate over activated categories: apply category[+text] filter for official [+and citizens'] POIs 
      asyncLoopForCategoriesFilter(
        // number of iterations 
        activatedCategoriesArray.length, 

        // apply enabled filters for this category (for official and, if neccesary, citizens' POIs) 
        function(loop) { 
          filterCategoryLoopFunction(
              activatedCategoriesArray[loop.iteration()], null, loop.iteration(),
              function(result) { // callback for 'filterCategoryLoopFunction(...)' function 
                console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
                loop.next(); // for cycle could continue
              }
          );
        },

        function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); } // callback for cycle ending
      );
    }
    
  };

  // Add text's filter
  $scope.callTextFilter = function(textToSearch){
    var activatedCategoriesArray = getSelectedCategories();
    // if there is no selected any category, don't activate this filter
    if(activatedCategoriesArray.length == 0){
      $ionicPopup.alert({
          title: $filter('translate')('menu.filter.category-search.error-popup-title'),
          template: $filter('translate')('menu.filter.category-search.no-category-selected-error-popup-text'),
          okText: $filter('translate')('menu.filter.category-search.alert-ok-button-label'),
          okType: 'button-assertive' 
      });
      $scope.filter.selectedText = false; // disable filter's checkbox
      return;
    }
    console.log('');
    console.log('Applying text filter... (searching "' + textToSearch + '")');
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                        + $filter('translate')('menu.filter.search.loading-text')
    });

    // iterate over activated categories: apply category+text[+location] filter for official [+and citizens'] POIs 
    asyncLoopForCategoriesFilter(
      // number of iterations 
      activatedCategoriesArray.length, 

      // apply enabled filters for this category (for official and, if neccesary, citizens' POIs) 
      function(loop) { 
        filterCategoryLoopFunction(
            activatedCategoriesArray[loop.iteration()], null, loop.iteration(),
            function(result) { // callback for 'filterCategoryLoopFunction(...)' function 
              console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
              loop.next(); // for cycle could continue
            }
        );
      },

      function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); } // callback for cycle ending
    );

  };
  // Remove text's filter.
  $scope.disableTextFilter = function(){
    var activatedCategoriesArray = getSelectedCategories();
    console.log('');
    console.log('Removing text filter...');
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                        + $filter('translate')('menu.filter.search.loading-text')
    });
    
    // iterate over activated categories: apply category[+location] filter for official [+and citizens'] POIs 
    asyncLoopForCategoriesFilter(
      // number of iterations 
      activatedCategoriesArray.length, 

      // apply enabled filters for this category (for official and, if neccesary, citizens' POIs) 
      function(loop) { 
        filterCategoryLoopFunction(
            activatedCategoriesArray[loop.iteration()], null, loop.iteration(),
            function(result) { // callback for 'filterCategoryLoopFunction(...)' function 
              console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
              loop.next(); // for cycle could continue
            }
        );
      },

      function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); } // callback for cycle ending
    );
  };

  // Add 'also citizen's POIs' filter
  $scope.callAlsoCitizensFilter = function(){
    var activatedCategoriesArray = getSelectedCategories();
    // if there is no selected any category, don't activate this filter
    if(activatedCategoriesArray.length == 0){
      $ionicPopup.alert({
          title: $filter('translate')('menu.filter.category-search.error-popup-title'),
          template: $filter('translate')('menu.filter.category-search.no-category-selected-error-popup-text'),
          okText: $filter('translate')('menu.filter.category-search.alert-ok-button-label'),
          okType: 'button-assertive' 
      });
      $scope.filter.selectedCitizensPOIs = false; // disable filter's checkbox
      return;
    }
    console.log('');
    console.log("Applying citizens' filter... (showing also citizens' POIs)");
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                        + $filter('translate')('menu.filter.search.loading-text')
    });

    // this 'locationMode' filter is enabled after switching between location filters (so reload all the filters
    // because they are already filtered by previously selected location):
    // iterate over activated categories: apply category[+text][+location] filter for official [+and citizens'] POIs 
    asyncLoopForCategoriesFilter(
      // number of iterations 
      activatedCategoriesArray.length, 

      // apply enabled filters for this category (for official and, if neccesary, citizens' POIs) 
      function(loop) { 
        filterCategoryCitizenLoopFunction(
            activatedCategoriesArray[loop.iteration()], loop.iteration(),
            function(result) { // callback for 'filterCategoryCitizenLoopFunction(...)' function 
              console.log('Iteration ', loop.iteration(), ' finished.'); // log the iteration
              loop.next(); // for cycle could continue
            }
        );
      },

      // callback function to be executed when cycle is ended
      function(){ console.log('Cycle ended.'); finishFilterAndReloadMarkers(); }
    );
  
  };
  // Remove 'also citizen's POIs's filter
  $scope.showOnlyOfficialPOIs = function(){
    var activatedCategoriesArray = getSelectedCategories();
    console.log(''); 
    console.log("Removing citizens' filter... (showing only official POIs)");
    // open loading panel
    $ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                      + $filter('translate')('menu.filter.category-search.remove-text')
    });

    // remove all citizens' POIs from the selected categories
    for(var i = 0; i < activatedCategoriesArray.length; i++){
      console.log(activatedCategoriesArray[i]);
      FilteredPOIs.removeCategoryPOIs(activatedCategoriesArray[i], false);
    }

    // hide loading panel and reload the map's markers
    finishFilterAndReloadMarkers();
  };






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


}
