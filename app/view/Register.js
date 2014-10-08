Ext.define('GS.view.Register',{
    extend: 'Ext.form.Panel',
    xtype: 'registerform',
    
    requires: [
      'Ext.form.FieldSet'  ,
      'Ext.field.Password',
      'Ext.Img',
      'Ext.Button',
      'Ext.field.DatePicker'
    ],
    
    config: {
        title: 'Registrierung',
        iconCls: 'user',
        displayField: 'title',
        id: 'registerform',
        items: [{
                xtype: 'fieldset',
                title: 'Registrierung',
                items: [{
                        xtype: 'textfield',
                        name: 'fullname',
                        id: 'fullname',
                        label: 'Name'
                    },{
                        xtype: 'textfield',
                        name: 'adresse',
                        id: 'adresse',
                        label: 'Adresse'
                    },{
                        xtype: 'textfield',
                        name: 'ort',
                        id: 'ort',
                        label: 'Ort'
                    },{
                        xtype: 'textfield',
                        name: 'plz',
                        id: 'plz',
                        label: 'PLZ'
                    },{
                        xtype: 'datepickerfield',
                        name: 'geburtstag',
                        id: 'geburtstag',
                        label: 'Geburtstag',
                        dateFormat: 'd.m.Y',
                        picker: {
                            yearFrom: 1900,
                            yearTo: new Date().getFullYear()
                        }
                    },{
                        /**
                         * Die Freigabe für bestimmte Benutzer war bereits eingebaut, wurde 
                         * aber im Laufe des Semesters (Vorlesung: 13.05.2013) aus der Aufgaben-
                         * stellung genommen.
                         * */
                         
                        xtype: 'textfield',
                        name: 'freigabe',
                        id: 'freigabe',
                        label: 'Freigabe',
                        hidden: true
                    }]
                },{
                xtype: 'fieldset',
                items: [{
                        xtype: 'textfield',
                        id: 'username',
                        label: 'Benutzername'
                    },{
                        xtype: 'field',
                        cls: 'infotext',
                        id: 'user-available',
                        html: 'Benutzername ist verfügbar!',
                        hidden: true,
                        component: {
                            xtype: 'image',
                            src: 'resources/icons/check.png',
                            width: 24,
                            height: 24                            
                        }
                    },{
                        xtype: 'field',
                        cls: 'infotext',
                        id: 'user-not-available',
                        html: 'Benutzername ist nicht mehr verfügbar!',
                        hidden: true,
                        component: {
                            xtype: 'image',
                            src: 'resources/icons/cancel.png',
                            width: 24,
                            height: 24                            
                        }
                    },
                    {
                        xtype: 'passwordfield',
                        name: 'password',
                        id: 'password',
                        label: 'Passwort'                    
                    },
                    {
                        xtype: 'passwordfield',
                        name: 'passwordrepeat',
                        id: 'passwordrepeat',
                        label: 'Passwort (Repeat)'                    
                }]
                },{
                    xtype: 'fieldset',
                    title: 'Homeposition',
                    items: [{
                        xtype: 'textfield',
                        name: 'longitude',
                        id: 'longitude',
                        label: 'Längengrad:',
                        disabled: true
                    },{
                        xtype: 'textfield',
                        name: 'latitude',
                        id: 'latitude',
                        label: 'Breitengrad',
                        disabled: true
                    }]
                },{
                    xtype: 'fieldset',
                    items: [{
                        xtype: 'button',
                        text: 'Registrieren',
                        id: 'submit-register',
                        toggleEnable: true,
                        ui: 'confirm'
                    }]
                
        }]
    }
});
