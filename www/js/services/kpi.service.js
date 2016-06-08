
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

    var appId = WELIVE_SERVICE_ID;      // 'bilbon'
    var appName = WELIVE_SERVICE_NAME;  // the name of the app (don't use 'es.eurohelp.welive.bilbon', only 'bilbon')

    var enabled = true; //enable or disable KPI service

    var kpi = {
        appStarted: appStarted,
        appUserRegistered: appUserRegistered,
        POIAdded: POIAdded,
        POIsSearched: POIsSearched,
        POIsSelected: POIsSelected
    };
    return kpi;

    // KPI id: KPI.BIO.12
    function appStarted(){
        if (enabled) {
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            return $http({
                method: "post",
                url: "https://dev.welive.eu/dev/api/log/" + appId,
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
        if (enabled) {
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            return $http({
                method:"post",
                url:"https://dev.welive.eu/dev/api/log/" + appId,
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
        if (enabled) {
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            return $http({
                method:"post",
                url:"https://dev.welive.eu/dev/api/log/" + appId,
                data:{
                    "msg": "POI added",
                    "appId": appId,
                    "type": "POIAdded",
                    "custom_attr": {
                        "POI_ID": POI_ID,
                        "POIName": POIName,
                        "appname": appName,
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
        if (enabled) {
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            return $http({
                method:"post",
                url:"https://dev.welive.eu/dev/api/log/" + appId,
                data:{
                    "msg": "POI searched",
                    "appId": appId,
                    "type": "POIsSearched",
                    "custom_attr": {
                        "QueryStr": QueryStr,
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

    // KPI id: KPI.BIO.16
    function POIsSelected(POI_ID, POIName, POICoords) {
       if (enabled) {
            $http.defaults.headers.post['Content-Type'] = 'application/json';
            return $http({
                method:"post",
                url:"https://dev.welive.eu/dev/api/log/" + appId,
                data:{
                    "msg": "POI selected",
                    "appId": appId,
                    "type": "POIsSelected",
                    "custom_attr": {
                        "POI_ID": POI_ID,
                        "appname": appName,
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
