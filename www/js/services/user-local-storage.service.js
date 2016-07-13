

angular
      .module('bilbonApp.services')
      .factory('UserLocalStorage', UserLocalStorageService);

UserLocalStorageService.$inject = ['localStorageService'];

/**
* @desc Manage user's data (login, acceptance of the terms of use and the number of times the questionnaire
* have been filled in) using local storage.
*/
function UserLocalStorageService(localStorageService){

    var localStorage = {
        getUserId: getUserId,
        getUserName: getUserName,
        setUserData: setUserData,
        removeUserData: removeUserData,

        getAccessToken: getAccessToken,
        getRefreshToken: getRefreshToken,
        setOAuthData: setOAuthData,
        removeOAuthData: removeOAuthData,

        getPrivacyAccepted: getPrivacyAccepted,
        setPrivacyAccepted: setPrivacyAccepted,

        getCompletedQuestionnaireCount: getCompletedQuestionnaireCount,
        addCompletedQuestionnaireCount: addCompletedQuestionnaireCount,
        removeCompletedQuestionnaireCount: removeCompletedQuestionnaireCount
    };
    return localStorage;


    /**
    * Returns current user's id if it is logged. null otherwise.
    */
    function getUserId(){
      var userData = localStorageService.get('userData');
      if(userData != null) return JSON.parse(userData).userId;
      else return null;
    };

    /**
    * Returns current user's name if it is logged. null otherwise.
    */
    function getUserName(){
      var userData = localStorageService.get('userData');
      if(userData != null) return JSON.parse(userData).name;
      else return null;
    };

    /**
    * Sets current user's data as json (name, surname, socialId, userId) .
    */
    function setUserData(userData){
      return localStorageService.set('userData', JSON.stringify(userData));
    };

    /**
    * Removes current user's data (log out).
    */
    function removeUserData(){
      return localStorageService.remove('userData');
    };



    /**
    * Returns OAuth's access token if it has been obtained. null otherwise.
    */
    function getAccessToken(){
      var oauthData = localStorageService.get('oauthData');
      if(oauthData != null) return JSON.parse(oauthData).accessToken;
      else return null;
    }

    /**
    * Returns OAuth's access token if it has been obtained. null otherwise.
    */
    function getRefreshToken(){
      var oauthData = localStorageService.get('oauthData');
      if(oauthData != null) return JSON.parse(oauthData).refreshToken;
      else return null;
    }

    /**
    * Sets OAuth's token generation response data as json (accessToken, refreshToken, expiresIn, tokenType, scope).
    */
    function setOAuthData(oauthData){
      return localStorageService.set('oauthData', JSON.stringify(oauthData));
    }

    /**
    * Removes OAuth's token generation response data.
    */
    function removeOAuthData(){
      return localStorageService.remove('oauthData');
    }



    /**
    * Returns true if the user has accepted the privacy policy (terms). False otherwise.
    */
    function getPrivacyAccepted(){
      var isPrivacyAccepted = localStorageService.get('isPrivacyAccepted');
      if(isPrivacyAccepted != null) return isPrivacyAccepted;
      else return false; 
      //window.localStorage.getItem("isPrivacyAccepted");
    };

    /**
    * Sets if the user has accepted or not the privacy policy (terms).
    */
    function setPrivacyAccepted(isAccepted){
      localStorageService.set("isPrivacyAccepted", isAccepted); 
      //window.localStorage.setItem("isPrivacyAccepted", isAccepted);
    };
    


    /**
    * Returns the number of times the questionnaire has been successfully completed.
    */
    function getCompletedQuestionnaireCount(){
      var count = localStorageService.get("completedQuestionnaireCount"); 
      if(count != null) return count;
      else return 0;
    };

    /**
    * Adds 1 to the completed questionnaire count.
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
    * Removes stored completed questionnaire count.
    */
    function removeCompletedQuestionnaireCount(){
      localStorageService.remove('completedQuestionnaireCount');
    };

};