
bilbonAppServices
    .factory('KPI', KPIService);

KPIService.$inject = ['$http', 'WELIVE_SERVICE_ID', 'WELIVE_SERVICE_NAME'];

/**
 * @desc Register KPIs for the logging system of WeLive project
 */
function KPIService(
    $http,
    WELIVE_SERVICE_ID,
    WELIVE_SERVICE_NAME) {

    var enabled = true;        // enable or disable KPI service
    var isTokenRequest = false; // control if WeLive's client app token has been obtained (if not, avoid KPI calls)

    var appId = WELIVE_SERVICE_ID;      // 'bilbon'
    var appName = WELIVE_SERVICE_NAME;  // the name of the app (don't use 'es.eurohelp.welive.bilbon', only 'bilbon')
    var requestParams = {
        method: "POST",
        url: "https://dev.welive.eu/dev/api/log/" + appId,
        headers: {  
            'Content-Type': 'application/json',
            'Authorization': undefined  
        }
    };

    var kpi = {
        setClientAppToken: setClientAppToken,
        appStarted: appStarted,
        appUserRegistered: appUserRegistered,
        POIAdded: POIAdded,
        POIsSearched: POIsSearched,
        POIsSelected: POIsSelected
    };
    return kpi;


    // set 'Authorization' header's content with the obtained token in 'Login' service (called in app.js)
    function setClientAppToken(token){
        if(token != null){
            requestParams.headers['Authorization'] = 'Bearer ' + token;
            isTokenRequest = true;
        }
    };

    // KPI id: KPI.BIO.12
    function appStarted(){
        if (enabled && isTokenRequest) {
            return $http({
                method: requestParams.method,
                url: requestParams.url,
                headers: requestParams.headers,
                data: {
                    "msg": "BilbOn app started",
                    "appId": appId,
                    "type": "AppStarted",
                    "custom_attr": {
                        "appname": appName
                    }
                }
            });
        }
        else
        {
            return $http({ method: "get", url: "http://localhost"});
        }
    };

    // KPI id: KPI.BIO.13
    function appUserRegistered(userId){
        if (enabled && isTokenRequest) {
            return $http({
                method: requestParams.method,
                url: requestParams.url,
                headers: requestParams.headers,
                data:{
                    "msg": "User registered in BilbOn",
                    "appId": appId,
                    "type": "AppUserRegistered",
                    "custom_attr": {
                        "appname": appName,
                        "UserID": userId
                    }
                }
            });
        }
        else
        {
            return $http({ method: "get", url: "http://localhost"});
        }
    };

    // KPI id: KPI.BIO.14
    function POIAdded(POI_ID, POIName, POICoords) {
        if (enabled && isTokenRequest) {
            return $http({
                method: requestParams.method,
                url: requestParams.url,
                headers: requestParams.headers,
                data:{
                    "msg": "POI added",
                    "appId": appId,
                    "type": "POIAdded",
                    "custom_attr": {
                        "appname": appName,
                        "POI_ID": POI_ID,
                        "POIName": POIName,
                        "POICoords": POICoords
                    }
                }
            });
        }
        else
        {
            return $http({ method: "get", url: "http://localhost"});
        }
    };

    // KPI id: KPI.BIO.15
    function POIsSearched(QueryStr) {
        if (enabled && isTokenRequest) {
            return $http({
                method: requestParams.method,
                url: requestParams.url,
                headers: requestParams.headers,
                data:{
                    "msg": "POI searched",
                    "appId": appId,
                    "type": "POIsSearched",
                    "custom_attr": {
                        "appname": appName,
                        "QueryStr": QueryStr
                    }
                }
            });
        }
        else
        {
            return $http({ method: "get", url: "http://localhost"});
        }
    };

    // KPI id: KPI.BIO.16
    function POIsSelected(POI_ID, POIName, POICoords) {
       if (enabled && isTokenRequest) {
            return $http({
                method: requestParams.method,
                url: requestParams.url,
                headers: requestParams.headers,
                data:{
                    "msg": "POI selected",
                    "appId": appId,
                    "type": "POIsSelected",
                    "custom_attr": {
                        "appname": appName,
                        "POI_ID": POI_ID,
                        "POIName": POIName,
                        "POICoords": POICoords
                    }
                }
            });
        }
        else
        {
            return $http({ method: "get", url: "http://localhost"});
        }
    };

}
