
bilbonAppServices
    .factory('UserLocalStorage', userLocalStorage);

userLocalStorage.$inject = ['localStorageService'];

/**
* @desc Get and set user's data using local storage
*/
function userLocalStorage(localStorageService){

    var localStorage = {
        getUserId: getUserId,
        getUserName: getUserName,
        setUserData: setUserData,
        removeUserData: removeUserData,
        getPrivacyAccepted: getPrivacyAccepted,
        setPrivacyAccepted: setPrivacyAccepted
    };
    return localStorage;


    /**
    * get current user id if it is logged. null otherwise.
    */
    function getUserId(){
      var userData = localStorageService.get('userData');
      if(userData != null) return JSON.parse(userData).currentUser.userId;
      else return null;
    };

    /**
    * get current user's name if it is logged. null otherwise.
    */
    function getUserName(){
      var userData = localStorageService.get('userData');
      if(userData != null) return JSON.parse(userData).currentUser.name;
      else return null;
    };

    /**
    * set current user id.
    */
    function setUserData(userData){
      return localStorageService.set('userData', JSON.stringify(userData));
    };

    /**
    * set current user name.
    */
    function removeUserData(){
      return localStorageService.remove('userData');
    };


    /**
    * return true if the user has accepted the privacy policy (terms)
    */
    function getPrivacyAccepted(){
      localStorageService.get("isPrivacyAccepted"); 
      //window.localStorage.getItem("isPrivacyAccepted");
    };

    /**
    * set if the user has accepted or not the privacy policy (terms)
    */
    function setPrivacyAccepted(isAccepted){
      localStorageService.set("isPrivacyAccepted", isAccepted); 
      //window.localStorage.setItem("isPrivacyAccepted", isAccepted);
    };

};