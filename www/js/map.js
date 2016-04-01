
/*
    Returns an array of markers identified by zone (id) 
*/
//function initialize(proposalsCountByZones, $scope){
function initialize($scope){
    
    var infoWindow = new google.maps.InfoWindow();
    var options = {
        zoom: 5, 
        center: new google.maps.LatLng(43.263606, -2.935214), // Plaza de Don Federico Moyúa, Bilbao
        mapTypeId: google.maps.MapTypeId.MAP
    };
 
    var map = new google.maps.Map(document.getElementById('mapa'), options);
    var limits = new google.maps.LatLngBounds();

    var infoWindowArray = new Array();
    /*
    angular.forEach(zones, function (zone) {         
        zone.position = new google.maps.LatLng(zone.latitude, zone.longitude);
        var marker = new google.maps.Marker({
            position: zone.position, //new google.maps.LatLng(zone.latitude, zone.longitude),// place[i],
            map: map,
            title: zone.label,
            icon: 'img/pin.png',
            animation : google.maps.Animation.DROP
        });
        google.maps.event.addListener(marker, 'click', function(){

            // load marker's infoWindow's content
            var infoWindowContent = getInfoWindowContent(zone.id, this.title, proposalsCountByZones, 
                $scope.proposalLabel_sing, $scope.proposalLabel_plu);
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, this);

            infoWindowArray[zone.id] = infoWindow; // add marker's infoWindow to the array
            // set current marker's infoWindow's data to use in MapCtrl if language changes
            $scope.currentMarkerZoneId = zone.id; 
            $scope.currentMarkerTitle = this.title;

        });
        google.maps.event.addListener(infoWindow, 'closeclick', function(){
            // 'closeclick' listener runs for every infoWindow created, so initialize 
            // $scope.currentMarkerZoneId only once
            if($scope.currentMarkerZoneId == zone.id) $scope.currentMarkerZoneId = null;
        });
        limits.extend(zone.position);
    });*/

    map.fitBounds(limits);
    
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter(); 
        google.maps.event.trigger(map, "resize"); 
        map.setCenter(center);
    });
    
    return infoWindowArray;
};


// returns the content of currentInfo windo based on selected language
/*function getInfoWindowContent(currentMarkerZoneId, currentMarkerTitle, proposalsCountByZones, 
    proposalLabelSing, proposalLabelPlu){
    // get proposals' count of zone (and link to proposals' list if neccesary)
    var proposalsCountOfZoneArray = [];
    if(proposalsCountByZones.length > 0){ // there are results from web service about proposals' count
        proposalsCountOfZoneArray = proposalsCountByZones.filter(
            function(item){ return item.zone == currentMarkerZoneId; }
        );
    }
    var proposalsCountOfZone = 0;
    if(proposalsCountOfZoneArray.length > 0){
        proposalsCountOfZone = proposalsCountOfZoneArray[0]['proposalsCount'];
    }
    
    // complete link based on proposal's count and language
    var proposalCountInfo;
    if(proposalsCountOfZone > 0){
        proposalCountInfo = "<a href='#/app/playlists?zone=" + currentMarkerZoneId + "'>";
        if(proposalsCountOfZone == 1){
            if(proposalLabelSing == "petición") proposalCountInfo += proposalsCountOfZone + " " + proposalLabelSing;
            else proposalCountInfo += proposalLabelSing + " " + proposalsCountOfZone;
        }else{
            proposalCountInfo += proposalsCountOfZone + " " + proposalLabelPlu;
        }
        proposalCountInfo += "</a>";
    }else{
        proposalCountInfo = proposalsCountOfZone + " " + proposalLabelPlu;
    }
    return "<p style='text-align:center'>" + currentMarkerTitle + "<br />(" + proposalCountInfo + ")</p>";
};*/

//google.maps.event.addDomListener(window, 'load', initialize);