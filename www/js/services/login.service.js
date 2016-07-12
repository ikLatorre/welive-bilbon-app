
var bilbonAppServices = angular.module('starter.services', []);

bilbonAppServices
    .factory('Login', LoginService);

LoginService.$inject = ['$http', '$state', '$q', '$ionicLoading', 'UserLocalStorage']; 

/**
 * @desc Manage WeLive's login system
 */
function LoginService(
    $http, 
    $state, 
    $q, 
    $ionicLoading,
    UserLocalStorage) { 

    var login = {
        requestWeliveClientAppOauthToken: requestWeliveClientAppOauthToken,
        refreshOauthToken: refreshOauthToken,
        requestAuthorize: requestAuthorize,
        requestOauthToken: requestOauthToken,
        requestOauthTokenSuccessCallback: requestOauthTokenSuccessCallback,
        requestBasicProfile: requestBasicProfile,

        params : {
            clientId:'e6ad6e82-075d-4800-85a0-95731c412c25',
            responseType:'code',
            redirectUri:'http://localhost/callback',
            scope:'profile.basicprofile.me',
            state:'code-login',
            clientSecret:'2e80af33-eb3b-48d0-b16b-0face8aaee23',
            clientSecretMobile:'6e33b66a-28e8-4255-acc5-392c84677b89'
        },

        clientAppAccessToken: undefined,
        clientAppExpiresIn: undefined,
        clientAppTokenType: undefined,
        clientAppScope: undefined,

        code: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        expiresIn: undefined,
        tokenType: undefined,
        scope: undefined
    };

    return login;


    /**
    * @desc WeLive's OAUTH2.0 NON USER-RELATED PROTOCOL FLOW (client (app) credentials flow)
    * Obtain the access token associated to the WeLive's client app, not to a single user.
    */
    function requestWeliveClientAppOauthToken(){
        var promise;
        promise = $q(function (resolve, reject) {

            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http({
                method: 'POST',
                url: 'https://dev.welive.eu/aac/oauth/token',
                data: 'client_id=' + login.params.clientId
                    + '&'
                    + 'client_secret=' + login.params.clientSecret
                    + '&'
                    + 'grant_type=client_credentials'
            
            }).then(function(clientCredentialsResponse){

                if(!clientCredentialsResponse.data.exception) {
                    login.clientAppAccessToken = clientCredentialsResponse.data.access_token;
                    login.clientAppExpiresIn = clientCredentialsResponse.data.expires_in;
                    login.clientAppTokenType = clientCredentialsResponse.data.token_type;
                    login.clientAppScope = clientCredentialsResponse.data.scope;
                    
                    resolve(clientCredentialsResponse.data.access_token);
                }else{
                    reject();
                }

            }, function(errorCallback){
                reject(errorCallback);
            });
        });
        
        return promise;
    }

    /**
    * @desc Used when app starts if the user has logged in (see app.js). Refresh the user's access token because there is no 'Log out' and
    * if it expires is not possible to create new POIs.
    */
    function refreshOauthToken(){
        var promise;
        promise = $q(function (resolve, reject) {

            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http({
                method: 'POST',
                url: 'https://dev.welive.eu/aac/oauth/token',
                data: 'client_id=' + login.params.clientId
                    + '&'
                    + 'client_secret=' + login.params.clientSecret
                    + '&'
                    + 'refresh_token=' + UserLocalStorage.getRefreshToken()
                    + '&'
                    + 'grant_type=refresh_token'
                    // '&client_secret_mobile=' + login.params.clientSecretMobile // '401: Unauthorized' error (Bad client credentials)
            
            }).then(function(response){

                if(!response.data.exception) {
                    login.accessToken = response.data.access_token;
                    login.refreshToken = response.data.refresh_token;
                    login.expiresIn = response.data.expires_in;
                    login.tokenType = response.data.token_type;
                    login.scope = response.data.scope;

                    storeTokenData(); // store new token data in local storage
                    
                    resolve(response.data.access_token);
                }else{
                    reject();
                }

            }, function(errorCallback){
                reject(errorCallback);
            });
        });
        
        return promise;
    }

    /**
     * @desc Start WeLive's AUTHORIZATION CODE FLOW (specific WeLive's user authorization flow)
     * Open WeLive's login page in an inAppBrowser (Web View)
     * Flow: authorization request + user login and consent --> obtain code --> token request + code --> obtain token
     * (and then resource request + token). The protected resource could be the user's basic profile, or the citizen's dataset.
     */
    function requestAuthorize() {
        var promise;
        promise = $q(function (resolve, reject) {
            // generate the request URL
            var requestUrl = 'https://dev.welive.eu/aac/eauth/authorize'
                + '?'
                + 'client_id=' + login.params.clientId
                + '&'
                + 'response_type=' + login.params.responseType
                + '&'
                + 'redirect_uri=' + login.params.redirectUri
                + '&'
                + 'scope=' + login.params.scope
                + '&'
                + 'state=' + login.params.state;

            // open a new window with the request URL
            var ref = window.open(requestUrl, '_blank', 'location=no,clearcache=yes');
            // var ref = window.open(requestUrl, '_blank', 'location=no,clearsessioncache=yes');
            console.log('Start URL:' + requestUrl + ' END URL');

            // set a listener in order to manage the loadstart event
            ref.addEventListener('loadstart', loadStartListener);

            function loadStartListener(event) {
                console.log('URL:' + event.url + ' END URL');

                // check if the url is the same of the redirection
                //if ((event.url).startsWith('http://localhost/callback')) { // String.prototype.startsWith() not supported by Android
                if ((event.url).indexOf("http://localhost/callback") > -1){
                    // take the requestToken from the url
                    login.code = (event.url).split('code=')[1].split('&')[0];
                    // close the opened window
                    ref.close();
                    // unsuscribe event
                    ref.removeEventListener('loadstart', loadStartListener);
                    // resolve promise
                    resolve();
                }
            }
        });
        
        return promise;
    }

    /**
     * @desc (token generation) Request the OAuth token to get permission to other requests of WeLive's APIs
     */
    function requestOauthToken() {
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        return $http({
            method: 'POST',
            url: 'https://dev.welive.eu/aac/oauth/token',
            data: 'client_id=' + login.params.clientId
                + '&'
                + 'client_secret=' + login.params.clientSecret
                + '&'
                + 'code=' + login.code
                + '&'
                + 'redirect_uri=' + login.params.redirectUri
                + '&'
                + 'grant_type=authorization_code'
        })
    }

    /**
     * @desc Manage the success of the request oauth
     * @param response: the response from the request
     */
    function requestOauthTokenSuccessCallback(response) {
        var promise;
        promise = $q(function(resolve, reject) {
            if(!response.data.exception) {
                login.accessToken = response.data.access_token;
                login.refreshToken = response.data.refresh_token;
                login.expiresIn = response.data.expires_in;
                login.tokenType = response.data.token_type;
                login.scope = response.data.scope;

                storeTokenData();

                resolve(login.accessToken);
            }
            else {
                // Exception
                console.log('Exception', response.url);

                var exceptionText = '';
                for (var exceptionKey in response.data.exception) {
                    exceptionText += exceptionKey + ': ';
                    exceptionText += response.exception[exceptionKey] + '    -';
                }
                alert(exceptionText);

                reject();
            }
        });

        return promise;
    }

    /**
     * @desc Get current user's basic profile (name, surname, socialId and userId)
     * @param token: previously generated token (resolved by 'requestOauthTokenSuccessCallback()')
     */
    function requestBasicProfile(token){
        return $http.get('https://dev.welive.eu/aac/basicprofile/me', {
            headers:{
                'Authorization': 'Bearer ' + token
            }
        });
    }

    /**
    * @desc Store in localStorage the OAuth's token request response (in order to refresh the token the next time)
    */
    function storeTokenData(){
        var oauthData = {
            accessToken:  login.accessToken,
            refreshToken: login.refreshToken,
            expiresIn: login.expiresIn,
            tokenType: login.tokenType,
            scope: login.scope
        };
        UserLocalStorage.setOAuthData(oauthData);
    }

}
