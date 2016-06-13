
var bilbonAppServices = angular.module('starter.services', []);

bilbonAppServices
    .factory('Login', LoginService);

LoginService.$inject = ['$http', '$state', '$q', '$ionicLoading']; 

/**
 * @desc Manage WeLive's login system
 */
function LoginService(
    $http, 
    $state, 
    $q, 
    $ionicLoading) { 

    var login = {
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
        code: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        expiresIn: undefined,
        tokenType: undefined,
        scope: undefined
    };

    return login;

    /**
     * open WeLive's login page in an inAppBrowser
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
                if ((event.url).startsWith('http://localhost/callback')) {
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
     * (token generation) request the oauth token to get permission to other requests of WeLive's APIs
     */
    function requestOauthToken() {
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        return $http({
            method: "post",
            url: "https://dev.welive.eu/aac/oauth/token",
            data: "grant_type=authorization_code"
                + "&client_id=" + login.params.clientId
                + '&client_secret=' + login.params.clientSecret
                + "&redirect_uri=" + login.params.redirectUri
                + "&code=" + login.code
        })
    }

    /**
     * manage the success of the request oauth
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

                resolve(login.accessToken);
            }
            else {
                // Exception
                alert('Exception');
                alert(response.url);
                var exceptionText = '';
                for (var exceptionKey in response.exception) {
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
     * get current user's basic profile (name, surname, socialId and userId)
     * @param token: previously generated token (resolved by 'requestOauthTokenSuccessCallback()')
     */
    function requestBasicProfile(token){
        return $http.get('https://dev.welive.eu/aac/basicprofile/me', {
            headers:{
                'Authorization':'Bearer ' + token
            }
        });
    }

}
