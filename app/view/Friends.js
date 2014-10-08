Ext.define('GS.view.Friends', {
    extend: 'Ext.List',
    xtype: 'friendsform',
    id: 'friendsform',
    
    config:{
        
        title: 'Freunde',
        iconCls: 'team',        
        fullscreen: true,
        mode: 'multi',
        store: {
            fields: ['Name', 'Id'],
            data: []
        },
        itemTpl: '{Name}'
    }    
    
});