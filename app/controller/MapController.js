/**
 * Controller bedient die Kartenansicht.
 */

Ext.define('GS.controller.MapController', {
    extend: 'Ext.app.Controller',
    
    /**
     * Instanzvariablen für die Marker und die Karte
     */
    map: null,
    markers: [],
    
    config:{
        refs: {
            friendsform: '#friendsform'
        },
        views: [
            'Map'
        ],
        control: {
            'map': {
                maprender: 'onMapRender'
            },
            'panel#mapform':{
                activate: 'onPanelActivated'
            }
        }
    },
    
    /**
     * Wird ausgelöst, wenn die Karte gerendert wurde
     * @param comp Component
     * @param map Map-Objekt
     */
    onMapRender: function (comp, map){
        this.map = map;  
        
        /**
         * Nach dem Rendern die Geo-Positionen ermitteln. Nach einmaligem
         * Rendern wird dies durch den avtivate gemacht.
         */
        this.updateGeoPositions();
    },
    
    /**
     * Wird ausgelöst, wenn der Anwender auf die Ansicht wechselt.
     * @param t Das Element, für das der Event ausgelöst wurde
     * @param newActiveItem Aktiviertes Element
     * @param oldActiveItem Deaktiviertes Element
     * @param eOpts Algemeien Optionen
     */
    onPanelActivated: function(t, newActiveItem, oldActiveItem, eOpts){
        /**
         * Kein Update, wenn Karte noch nicht gerendert
         */
        if(!this.map) return;
        
        this.updateGeoPositions();
    },
    
    /**
     * Aktualisiert die Positionen in der Karte.
     */
    updateGeoPositions: function(){
        /**
        * Daten für den Request sammeln
        */
        var options = {
            session: GS.app.ffsession,
            username: GS.app.ffusername,
            longitude: null,
            latitude: null,
            friends: this.getFriendsform().getSelection()
        };
        
        var _this = this;
        
        /**
         * Geo-Positione rmtteln. Wenn der Anwender seine Position nicht
         * preisgeben will oder das Endgerät keine Ortung unterstützt, wird
         * die eigene Position nicht übertragen.
         */
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(function(position){
                options.latitude = position.coords.latitude;
                options.longitude = position.coords.longitude;
                
                _this.sendUpdateRequest.apply(_this,[options]);
            },function(error){
                switch (error.code) {
                    case 1:
                        alert("Error. PERMISSION_DENIED");
                        break;
                    case 2:
                        alert("Error. POSITION_UNAVAILABLE");
                        break;
                    case 3:
                        alert("Error. TIMEOUT");
                        break;
                    default:
                        alert("unknow error code");
                }
                options.latitude = 51.851354;
                options.longitude = 6.640955;
                
                _this.sendUpdateRequest.apply(_this,[options]);
            },{timeout: 5000});
        }else{
            this.sendUpdateRequest(options);
        }        
    },
    
    /**
     * Namen des Freundes anhand der ID (Benutzernamen) ermitteln.
     * @param friends Freundeliste
     * @param Id ID bzw. Benutzername
     */
    getFriendsNameForId: function(friends,Id){
        for(var i = 0; i < friends.length; i++){
            if(friends[i].data.Id == Id) 
                return friends[i].data.Name;
        }
        
        return "";
    },
    
    /**
     * Überprüft ob der Freund zu Ansicht ausgewählt wurde.
     * @param friends Freundeliste
     * @param Id ID bzw. Benutzername
     */
    isFriendSelected: function(friends,Id){
        for(var i = 0; i < friends.length; i++){
            if(friends[i].data.Id == Id) return true;
        }
        
        return false;
    },
    
    /**
     * Marker von der Karte löschen.
     */
    clearMarkers: function(){
        for(var i = 0; i < this.markers.length; i++){
            this.markers[i].setMap(null);
        }
        
        this.markers = Array();
    },
    
    /**
     * Marker auf die Karte setzen
     * @param options Optionen für das Rendern der Karte
     * @param response Antwortobjekt
     */
    addMarkers: function(options, response){
        
        /* Positionliste finden */
        var listNode = response.getElementsByTagName("Positionsliste");
        
        /* Das Boundsobjekt gibt praktisch einen "Rahmen" vor, auf den wir später zoomen können */
        var bounds = new google.maps.LatLngBounds ();
        
        /* Positionen ermitteln */
        if(listNode && listNode.length > 0){
            var positionNodes = listNode[0].getElementsByTagName("Position");
        
            for(var i = 0; i < positionNodes.length; i++){
                var idNode = positionNodes[i].getElementsByTagName("Id");
                
                /* Ist der Feund auch ausgewählt? */
                if(this.isFriendSelected(options.friends, idNode[0].textContent)){
                    var koordinatenNodes = positionNodes[i].getElementsByTagName("Koordinaten");
                    
                    /* Hat der Freund seine Koordinaten schon gesendet? */
                    if(koordinatenNodes.length > 0){
                        
                        var name = this.getFriendsNameForId(options.friends, idNode[0].textContent);
                        var _map = this.map;
                        
                        /**
                         * Marker erstellen
                         */
                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(
                                    koordinatenNodes[0].getElementsByTagName("Breite")[0].textContent,
                                    koordinatenNodes[0].getElementsByTagName("Laenge")[0].textContent
                            ),
                            title: name,
                            info: new google.maps.InfoWindow({
                                    content: '<b>' + name + '</b>'
                            })
                        });

                        /**
                         * Info-Fenster beim Klick
                         */
                        google.maps.event.addListener(marker, 'click', function() {
                            this.info.open(_map, this);
                        });
                        
                        /**
                         * Auf die Karte setzen
                         */
                        marker.setMap(this.map);
                        
                        this.markers.push(marker);
                        
                        /**
                         * Den Rahmen für das spätere Zoomen erweitern
                         */
                        bounds.extend(marker.position);                        
                    }                    
                }
            }
        }
        
        /**
         * Meinen Marker erstellen. Zur besseren Unterschiedung
         * wird der Marker blau gemacht.
         */
        var image = this.getMarkerImage("1646EC");        
        var myMarker = new google.maps.Marker({
            position: new google.maps.LatLng(
                    options.latitude,
                    options.longitude
            ),
            icon: image.image,
            shadow: image.shadow
        });
        
        myMarker.setMap(this.map);
        this.markers.push(myMarker);
        bounds.extend(myMarker.position);        
        
        /**
         * Auf die Pins zoomen.
         */
        this.map.fitBounds(bounds);
    },
    
    /**
     * Erstellt ein neues Marker-Image.
     * @param color Farbcode des Markers
     */
    getMarkerImage: function(color){
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
            new google.maps.Size(21, 34),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 34));
        var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 35));
            
        return {image: pinImage, shadow: pinShadow};
    },
    
    /**
     * Update-Request absenden
     * @param options Optionen zum Senden
     */
    sendUpdateRequest: function(options){
        var _this = this;
        var _options = options;
        
        this.clearMarkers();

        Ext.Ajax.request({
            url: GS.app.ffhost + '/update',
            method: 'PUT',
            defaultHeaders: {
                'Content-Type': 'text/xml; charset=UTF-8'
            },
            xmlData: this.getUpdateRequest(options),
            noCache: false,
            callback: function(options, success, response) {
                _this.addMarkers.apply(_this,[_options,response.responseXML]);
            }
        });
    },
    
    /**
     * Setzt einen Update-Request zusammen.
     * @param options Optionen zum Senden
     */
    getUpdateRequest: function(options){
        return  "<tns:AbfragePositionen xmlns:tns=\"http://www.whereru.de/Namespace\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.whereru.de/Namespace AbfragePositionen.xsd\" >" +
                "<tns:SessionID>" + options.session + "</tns:SessionID>" +
                "<tns:MeineID>" + options.username + "</tns:MeineID>" + 
                this.getMeinePositionUpdateRequest(options.longitude, options.latitude) +
                this.getFriendsUpdateRequest(options.friends) +                
        "</tns:AbfragePositionen>";
    },
    
    /**
     * Setzt den Freunde-Teil des Update-Request zusammen.
     * @param friends Freunde
     */
    getFriendsUpdateRequest: function(friends){
        var result = "<tns:MeineFreunde>";
        
        for(var i = 0; i < friends.length; i++){
            result += "<tns:Id>" + friends[i].data.Id + "</tns:Id>";
        }
        
        return result + "</tns:MeineFreunde>";
    },
   
    /**
     * Setzt den Meine-Position-Teil des Requests zusammen.
     * @param longitude Längengrad
     * @param latitude Breitengrad
     */
    getMeinePositionUpdateRequest: function(longitude, latitude){
        if(longitude && latitude){
            return  "<tns:MeinePosition>" +
                        "<tns:Breite>" + latitude + "</tns:Breite>" +
                        "<tns:Laenge>" + longitude + "</tns:Laenge>" +
                    "</tns:MeinePosition>";
        }else{
            return  "";           
        }
    }
});
