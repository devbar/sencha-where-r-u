/**
 * Dieser Controller bedient die Registrierungsansicht.
 */

Ext.define('GS.controller.RegisterController', {
    extend: 'Ext.app.Controller',
    
    config: {
        refs: {
            fullname: '#fullname',
            password: '#password',
            passwordrepeat: '#passwordrepeat',
            username: '#username',
            adresse: '#adresse',
            ort: '#ort',
            plz: '#plz',
            geburtstag: '#geburtstag',
            freigabe: '#freigabe',
            longitude: '#longitude',
            latitude: '#latitude',
            mainTab: '#main',
            mapform: '#mapform',
            loginform: '#loginform',
            registerform: '#registerform'
        },
        
        views: [
            'Register'  
        ],
        
        /**
         * Events anmelden
         */
        
        control: {
            'textfield#username':{
               change: 'onUsernameChange'
            },
            'button#submit-register':{
                tap: 'onRegisterClicked'
            },
            'panel#registerform':{
                activate: 'onPanelActivated'
            }
        }
    },
      
    /**
     * Wird ausgelöst, wenn der Anwender auf die Ansicht wechselt.
     * @param t Das Element, für das der Event ausgelöst wurde
     * @param newActiveItem Aktiviertes Element
     * @param oldActiveItem Deaktiviertes Element
     * @param eOpts Algemeien Optionen
     */
    onPanelActivated: function( t, newActiveItem, oldActiveItem, eOpts ){
        var _this = this;
        
        if (navigator.geolocation)
        {
            /* Geo-Position ermitteln und in die Form eintragen */
            navigator.geolocation.getCurrentPosition(function(position){
                _this.getLatitude().setValue(position.coords.latitude);
                _this.getLongitude().setValue(position.coords.longitude); 
            });
        }else{
            Ext.Msg.alert("Fehler", "Schade, der Browser scheint das Abfragen der aktuellen Position nicht zu unterstützen.",Ext.emptyFn);            
        }
    },
    
    /**
     * Wird ausgelöst, wenn der Anwender auf "registrieren" klickt
     * @param button Button um den es geht
     */
    onRegisterClicked: function(button){
        var _this = this;        
        var xml = this.getRegisterRequest();
        
        if(!xml) return;
        
        /**
         * Den Request an den Server senden
         */
        Ext.Ajax.request({
            url: GS.app.ffhost + '/addUserXML',
            method: 'POST',
            defaultHeaders: {
                'Content-Type': 'text/xml; charset=UTF-8'
            },
            xmlData: xml,
            noCache: false,
            callback: function(options, success, response) {
                /**
                 * Die Antwort enthält den Status mit dem geprüft werden kann
                 * ob die Registrierung erfolgreich war.
                 */
                
                var responseXml = response.responseXML;
                var statusNodes; 
                var flag = false;
                
                if(responseXml){
                    statusNodes = response.responseXML.getElementsByTagName('Status');
                
                    if(statusNodes.length > 0){
                        flag = statusNodes[0].firstChild.nodeValue === "true";
                    }
                }
                
                /***
                 * Meldung ausgeben, ob die Registrierung abgeschlossen werden 
                 * konnte oder nicht.
                 */
                
                if(flag){
                    Ext.Msg.alert(
                        "Registrierung", 
                        "Die Registrierung war erfolgreich. Sie können sich jetzt mit ihrem Benutzernamen und Passwort einloggen.", 
                        Ext.emptyFn
                    );
                    
                    // Zum Login wechseln
                    _this.getMainTab().setActiveItem(_this.getLoginform());
                }else{
                    Ext.Msg.alert(
                            "Registrierung",
                            "Die Registrierung ist fehlgeschlagen.",
                            Ext.emptyFn
                        );
                }
            }
        });
    },
    
    
    /**
     * Gibt eine Meldung aus, dass die Eingabe erforderlich ist
     * @param field Feld, das erforderlich ist
     */
    requiredMessage: function(field){
        Ext.Msg.alert(
            "Erforderlich", 
            "Es muss ein" + field + " eingegeben werden.", 
            Ext.emptyFn
        );
    },
    
    /**
     * Baut das XML zusammen
     */
    getRegisterRequest: function(){
        
        /**
         * Validierungen
         */
        
        var username = this.getUsername().getValue();
        var password = this.getPassword().getValue();
        var passwordrepeat = this.getPasswordrepeat().getValue();
        var fullname = this.getFullname().getValue();
        var strasse = this.getAdresse().getValue();
        var plz = this.getPlz().getValue();
        var ort = this.getOrt().getValue();
        var geburtstag = this.getGeburtstag().getFormattedValue("Y-m-d");
        
        /**
         * Passwort
         */
        if(!password){           
            this.requiredMessage(" Passwort");
            return null;
        }
        
        if(!username){
            this.requiredMessage(" Benutzername");            
            return null;
        }
        
        if(!fullname){
            this.requiredMessage(" Name");
            return null;
        }
        
        if(!strasse){
            this.requiredMessage("e  Adresse");
            return null;
        }
        
        if(!plz){
            this.requiredMessage("e Postleitzahl");
            return null;
        }
        
        if(!ort){
            this.requiredMessage(" Ort");
            return null;
        }
        
        if(!geburtstag){
            this.requiredMessage(" Geburtstag");
            return null;
        }
        
        /**
         * Passwortkontrolle passt nicht
         */
        if(password !== passwordrepeat){
            Ext.Msg.alert(
                "Passwortwiederholung", 
                "Die Wiederholung des Passworts stimmt nicht mit dem Passwort überein.", 
                Ext.emptyFn
            );
                
            return null;
        }
        
        return "<tns:benutzer xmlns:tns=\"http://www.whereru.de/Namespace\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.whereru.de/Namespace Benutzerdaten.xsd \">" +
                    "<tns:Id>" + username + "</tns:Id>"+
                    "<tns:Passwort>" + password + "</tns:Passwort>"+
                    "<tns:Name>" + fullname + "</tns:Name>"+
                    "<tns:Adresse>"+
                        "<tns:Strasse>" + strasse + "</tns:Strasse>"+
                        "<tns:Plz>" + plz + "</tns:Plz>"+
                        "<tns:Ort>" + ort + "</tns:Ort>"+
                        this.getLokationRequest() +
                        /**
                         * Die Freigabe für bestimmte Benutzer war bereits eingebaut, wurde 
                         * aber im Laufe des Semesters (Vorlesung: 13.05.2013) aus der Aufgaben-
                         * stellung genommen.                         
                        
                        "<tns:Freigabe>"+
                            this.getFreigabeRequest() +
                        "</tns:Freigabe>"+
                        */
                    "</tns:Adresse>"+
                    "<tns:Geburtsdatum>" + geburtstag + "</tns:Geburtsdatum>"+
                "</tns:benutzer>";
    },
    
    /**
     * Zerlegt die Eingabe für die Frigabe in einzelne Zeilen.
     */
    getFreigabeRequest: function(){
        var freigabe = this.getFreigabe().getValue();
        var results = "";
        
        if(!freigabe)
            return;
        
        var items = freigabe.split(",");
        
        for(var i = 0; i < items.length; i++){
            results += "<tns:Id>" + items[i] + "</tns:Id>";
        }
        
        return results;
    },
    
    /**
     * Gibt die ermittelte Position zurück
     */
    getLokationRequest: function(){
        var results = "";
        var longitude = this.getLongitude().getValue();
        var latitude = this.getLatitude().getValue();
        
        if(latitude && longitude){
            results =   "<tns:Lokation>"+
                            "<tns:Breite>" + latitude  + "</tns:Breite>"+
                            "<tns:Laenge>" + longitude + "</tns:Laenge>"+
                        "</tns:Lokation>";
        }
        
        return results;
    },
    
    /**
     * Wird ausgelöst, wenn der Benutzername geändert wird
     * @param field Das Feld, um das es geht
     * @param newValue Neuer Wert
     * @param oldValue Alter Wert
     */
    onUsernameChange: function(field, newValue, oldValue){
        var _this = this;
        
        Ext.Ajax.request({
            url: GS.app.ffhost + '/checkID/' + newValue,
            method: 'GET',
            
            callback: function(options, success, response) {
                var flag = response.responseXML.getElementsByTagName('Status')[0].firstChild.nodeValue;
                _this.toggleUserAvailable.apply(_this, [flag==="false"]);                
            }
        });
    },     
    
    /**
     * Gibt aus, ob es den Benutzer schon gibt, oder nicht
     * @param flag Benutzer verfügbar oder nicht
     */
    toggleUserAvailable: function(flag){
        if(flag===true){
            Ext.getCmp('user-available').setHidden(false);
            Ext.getCmp('user-not-available').setHidden(true);
        }else{
            Ext.getCmp('user-available').setHidden(true);
            Ext.getCmp('user-not-available').setHidden(false);
        }
    }
});