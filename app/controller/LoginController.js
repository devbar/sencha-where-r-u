/**
 * Dieser Controller bedient die Loginansicht.
 */

Ext.define('GS.controller.LoginController', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            lusername: '#lusername',
            lpassword: '#lpassword',
            mainTab: '#main',
            mapform: '#mapform',
            loginform: '#loginform',
            registerform: '#registerform',
            friendsform: '#friendsform'
        },
        views: [
            'Login'
        ],
        control:{
            'button#login': {
                tap: 'onButtonToggle'
            },
            'panel#loginform': {
                activate: 'onPanelActivated'
            }
        }
    },
    
    longitude: null,
    latitude: null,
    
    /**
     * Wird ausgelöst, wenn der Anwender auf die Ansicht wechselt.
     * @param t Das Element, für das der Event ausgelöst wurde
     * @param newActiveItem Aktiviertes Element
     * @param oldActiveItem Deaktiviertes Element
     * @param eOpts Algemeien Optionen
     */
    onPanelActivated: function(t, newActiveItem, oldActiveItem, eOpts){
        var _this = this;
        
        if (navigator.geolocation)
        {
            /* Geo-Position ermitteln */
            navigator.geolocation.getCurrentPosition(function(position){
                _this.longitude = position.coords.longitude;
                _this.latitude = position.coords.latitude;
            });
        }else{
            Ext.Msg.alert("Fehler", "Schade, der Browser scheint das Abfragen der aktuellen Position nicht zu unterstützen.",Ext.emptyFn);            
        }
    },    
    
    /**
     * Event wird ausgelöst, wenn der User den Button klickt
     * @param {Control} button Der geklickte Button
     */
    onButtonToggle: function(button){
        var _this = this;        
        var xml = this.getLoginRequest();
        
        if(!xml){
            Ext.Msg.alert("Eingabe", "Es muss ein Benutzername und ein Passwort eingegeben werden.",Ext.emptyFn);
            return;
        }
        
        Ext.Ajax.request({
            url: GS.app.ffhost + '/login',
            method: 'PUT',
            defaultHeaders: {
                'Content-Type': 'text/xml; charset=UTF-8'
            },
            xmlData: xml,
            callback: function(options, success, response) {
               
                /**
                 * Prüfen ob Login durchgeführt werden kann
                 */
                GS.app.ffsession = _this.checkLoginFromResponse.apply(_this, [response.responseXML]);  
                GS.app.ffusername = _this.getLusername().getValue();
                
                if(GS.app.ffsession){
                    
                    /**
                     * Freundeliste ermitteln, wenn das Login durchgeführt werden konnte
                     */
                    var friends = _this.getFriendsFromResponse.apply(_this,[response.responseXML]);
                    
                    if(friends){
                        _this.getFriendsform().getStore().setData(friends);
                    }                    
                    
                    /**
                     * Ansicht auf Logged-In umschalten
                     */
                    _this.changeToLoggedInView.apply(_this);                    
                }else{
                    Ext.Msg.alert(
                            "Login",
                            "Das Login ist fehlgeschlagen. Bitte Benutzername und Passwort überprüfen.",
                            Ext.emptyFn
                        );
                }

            }
        });
    },
    
    /**
     * Prüft ob sich der Benutzer einloggen kann
     * @param {XMLResponse} response XML-Response
     * @returns {string} Session-ID (leer, wenn login fehlgeschlagen)
     */
    checkLoginFromResponse: function(response){
        var sessionNodes; 
        var sessionID = "";

        if(response){
            sessionNodes = response.getElementsByTagName('SessionID');

            if(sessionNodes.length > 0){

                if(sessionNodes[0].firstChild){
                    sessionID = sessionNodes[0].firstChild.nodeValue;
                }
            }
        }
        
        return sessionID;
    },
    
    /**
     * Gibt die Liste von Freunden als Array zurück
     * @param {XMLResponse} response XML-Response
     * @returns {Array} Array aus Freunde-Elementen
     */
    getFriendsFromResponse: function(response){
        var listNode = response.getElementsByTagName("Teilnehmerliste");
        var result = Array();
        
        if(listNode.length > 0 ){
            var friendNodes = listNode[0].getElementsByTagName("Teilnehmer");
            
            for(var i = 0; i < friendNodes.length; i++){
                var name = friendNodes[i].getAttribute("Name");
                var id = friendNodes[i].getAttribute("Id");
                
                result[i] = { Name: name, Id: id };
            }
        }
        
        return result;
    },
    
    /**
     * Wechselt in die Logged-In-Ansicht
     */
    changeToLoggedInView: function(){
        // Zur Freundeliste wechseln
        this.getMainTab().setActiveItem(this.getFriendsform());

        // Buttons für Registrierung und Login ausblenden
        with(this.getMainTab().getTabBar().items){

            // Login und Registrierung raus
            get(0).setHidden(true);
            get(1).setHidden(true);

            // Karte und Freunde rein
            get(2).setHidden(false);
            get(3).setHidden(false);                        
        };    
    },
    
    /**
     * Baut das XML für das Login zusammen
     * @returns XML-Request als String (null wenn Benutzername oder Passwort nicht gefüllt)
     */
    getLoginRequest: function(){
        
        // Benutzername/Passwort aus der Maske
        var username = this.getLusername().getValue();
        var password = this.getLpassword().getValue();
        
        var result = null;
        
        // Request zusammenbauen 
        if(username && password){
            result = "<tns:MobileAnmeldungRequest xmlns:tns=\"http://www.whereru.de/Namespace\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.whereru.de/Namespace MobileAnmeldungRequest.xsd \">" +
                        "<tns:Id>" + username + "</tns:Id>"+
                        "<tns:Pw>" +  password + "</tns:Pw>"+
                        "<tns:Ort><tns:Breite>" + this.latitude + "</tns:Breite><tns:Laenge>" + this.longitude + "</tns:Laenge></tns:Ort>" + //Muss noch angepasst werden
                     "</tns:MobileAnmeldungRequest>";
        }
        
        return result;
    }
    
});