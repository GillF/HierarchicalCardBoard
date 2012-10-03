Ext.define('Hackathon.HierarchicalCardBoard', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    layout: 'border',

    style: {
        backgroundColor: '#FFF'
    },

    defaults: {
        padding: 5
    },

    items: [
        {
            xtype: 'container',
            cls: 'leftSide',
            itemId: 'leftSide',
            region: 'west',
            width: 350,
            collapsible: true
        },
        {
            xtype: 'container',
            cls: 'rightSide',
            itemId: 'rightSide',
            region: 'center',
            items: [
                {
                    xtype: 'rallycardboard',
                    cardConfig: {
                        componentCls: 'iterationtrackingboard-card',
                        //fields: ['Tasks'],
                        editable: true,
                        showHeaderMenu: true
                    }
                }
            ]
        }
    ],

    launch: function() {
        this.buildStoryTree();
    },

    buildStoryTree: function(){
        var storyTree = Ext.create('Hackathon.HCB.StoryTree');
        this.down('#leftSide').add(storyTree);
    }

});
