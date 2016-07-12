
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
    * Return current user's id if it is logged. null otherwise.
    */
    function getUserId(){
      var userData = localStorageService.get('userData');
      if(userData != null) return JSON.parse(userData).userId;
      else return null;
    };

    /**
    * Return current user's name if it is logged. null otherwise.
    */
    function getUserName(){
      var userData = localStorageService.get('userData');
      if(userData != null) return JSON.parse(userData).name;
      else return null;
    };

    /**
    * Set current user's data as json (name, surname, socialId, userId) .
    */
    function setUserData(userData){
      return localStorageService.set('userData', JSON.stringify(userData));
    };

    /**
    * Remove current user's data (log out).
    */
    function removeUserData(){
      return localStorageService.remove('userData');
    };



    /**
    * Return OAuth's access token if it has been obtained. null otherwise.
    */
    function getAccessToken(){
      var oauthData = localStorageService.get('oauthData');
      if(oauthData != null) return JSON.parse(oauthData).accessToken;
      else return null;
    }

    /**
    * Return OAuth's access token if it has been obtained. null otherwise.
    */
    function getRefreshToken(){
      var oauthData = localStorageService.get('oauthData');
      if(oauthData != null) return JSON.parse(oauthData).refreshToken;
      else return null;
    }

    /**
    * Set OAuth's token generation response data as json (accessToken, refreshToken, expiresIn, tokenType, scope).
    */
    function setOAuthData(oauthData){
      return localStorageService.set('oauthData', JSON.stringify(oauthData));
    }

    /**
    * Remove OAuth's token generation response data.
    */
    function removeOAuthData(){
      return localStorageService.remove('oauthData');
    }



    /**
    * Return true if the user has accepted the privacy policy (terms). False otherwise.
    */
    function getPrivacyAccepted(){
      var isPrivacyAccepted = localStorageService.get('isPrivacyAccepted');
      if(isPrivacyAccepted != null) return isPrivacyAccepted;
      else return false; 
      //window.localStorage.getItem("isPrivacyAccepted");
    };

    /**
    * Set if the user has accepted or not the privacy policy (terms)
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
      if(count != null) return count;
      else return 0;
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