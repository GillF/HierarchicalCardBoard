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
            width: 600,
            collapsible: true
        },
        {
            xtype: 'container',
            cls: 'rightSide',
            itemId: 'rightSide',
            region: 'center',
            items: [
                // {
                //     xtype: 'rallycardboard',
                //     cardConfig: {
                //         componentCls: 'iterationtrackingboard-card',
                //         //fields: ['Tasks'],
                //         editable: true,
                //         showHeaderMenu: true
                //     }
                // }
            ]
        }
    ],

    launch: function() {
        this.buildStoryTree();
    },

    buildStoryTree: function(){

//        var storyTree = Ext.create('Hackathon.HCB.StoryTree');
        var portfolioHierarchyConfig = {
            xtype: 'hackathonportfoliohierarchy',
            context: this.getContext(),
            listeners: {
                scope: this,
                treeitemselected: this.onTreeItemSelected
            }
        };
        this.down('#leftSide').add(portfolioHierarchyConfig);
    },

    onTreeItemSelected: function(record){
        alert(record.get('ObjectID'));
    }

});
