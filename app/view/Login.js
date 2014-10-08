Ext.define('GS.view.Login', {
    extend: 'Ext.form.Panel',
    xtype: 'loginform',
    id: 'loginform',
    
    requires: [
      'Ext.form.FieldSet'  ,
      'Ext.field.Password',
      'Ext.Img'
    ],
    
    config:{
        
        title: 'Login',
        iconCls: 'user',
        displayField: 'title',
        items:[{
                xtype: 'fieldset',
                title: 'Login',
                items:[
                    {
                        xtype: 'textfield',
                        name: 'lusername',
                        id: 'lusername',
                        label: 'Benutzername'
                    },
                    {
                        xtype: 'passwordfield',
                        name: 'lpassword',
                        id: 'lpassword',
                        label: 'Passwort'
                    }
                ]
                
        },
        {
            xtype: 'button',
            text: 'Login',
            itemId: 'login',
            ui: 'confirm'
        }]
    }
    
});

