Ext.define('GS.view.Map', {
    extend: 'Ext.form.Panel',
    xtype: 'mapform',
    id: 'mapform',
    
    requires: [
        'Ext.Map'
    ],
    
    config:{
        title: 'Karte',
        iconCls: 'search',
        fullscreen: true,
        layout: 'fit',
        items: [
            {
                xtype: 'map',
                //useCurrentLocation: true,
                
                mapOptions : {
                    //center : new google.maps.LatLng(37.381592, -122.135672),  //nearby San Fran
                    zoom : 12,
                    mapTypeId : google.maps.MapTypeId.ROADMAP,
                    navigationControl: true,
                    navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.DEFAULT
                    }
                }
            }
        ]
    }    
});

