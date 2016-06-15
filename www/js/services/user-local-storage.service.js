
bilbonAppServices
    .factory('UserLocalStorage', UserLocalStorage);

UserLocalStorage.$inject = ['localStorageService'];

/**
* @desc Get and set user's data using local storage
*/
function UserLocalStorage(localStorageService){

    var localStorage = {
        getUserId: getUserId,
        getUserName: getUserName,
        setUserData: setUserData,
        removeUserData: removeUserData,
        getPrivacyAccepted: getPrivacyAccepted,
        setPrivacyAccepted: setPrivacyAccepted,
        getCompletedQuestionnaireCount: getCompletedQuestionnaireCount,
        addCompletedQuestionnaireCount: addCompletedQuestionnaireCount,
        removeCompletedQuestionnaireCount: removeCompletedQuestionnaireCount
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

    /**
    * Return the number of times the questionnaire has been successfully completed.
    */
    function getCompletedQuestionnaireCount(){
      var count = localStorageService.get("completedQuestionnaireCount"); 
      if(count == null) return 0;
      else return count;
    };

    /**
    * Add 1 to the completed questionnaire count.
    */
    function addCompletedQuestionnaireCount(){
      var count = localStorageService.get("completedQuestionnaireCount"); 
      if(count == null){
        localStorageService.set("completedQuestionnaireCount", 1);
        console.log('Questionnaire completed 1 time.');
      }else{
        count++;
        localStorageService.set("completedQuestionnaireCount", count);
        console.log('Questionnaire completed ' + count + ' times.');
      }
    };

    /**
    * Remove stored completed questionnaire count.
    */
    function removeCompletedQuestionnaireCount(){
      localStorageService.remove('completedQuestionnaireCount');
    };

};