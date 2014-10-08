Ext.define('GS.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    id: 'main',
    requires: [
        'Ext.TitleBar'
    ],
    config: {
        tabBarPosition: 'bottom',
        items: [
            {
                xtype: 'loginform'
            },
            {
                xtype: 'registerform'
            },
            {
                xtype: 'friendsform',
                hidden: true
            },
            {
                xtype: 'mapform',
                hidden: true
            }
            
        ]
    }
});
