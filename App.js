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
            collapsible: true,
            items: [
                {
                    xtype: 'rallytree',
                    topLevelModel: 'PortfolioItem',
                    enableDragAndDrop: true,
                    childItemsStoreConfigForParentRecordFn: function(record){

                        if(record.get('UserStories') && record.get('UserStories').length > 0){
                            return {
                                filters: [
                                    {
                                        property: 'PortfolioItem',
                                        value: record.get('_ref'),
                                        operator: '='
                                    },
                                    {
                                        property: 'Iteration',
                                        value: 'null',
                                        operator: '='
                                    }
                                ]
                            };
                        }
                        if(record.get('_type') === 'hierarchicalrequirement'){
                            return {
                                filters: [
                                    {
                                        property: 'Parent',
                                        value: record.get('_ref'),
                                        operator: '='
                                    },
                                    {
                                        property: 'Iteration',
                                        value: 'null',
                                        operator: '='
                                    }
                                ]
                            };
                        }

                    },
                    childModelTypeForRecordFn: function(record){
                        console.log("record type ="+record.get('_type'));
                        if(record.get('_type') === 'portfolioitem'){
                            if(record.get('Children') && record.get('Children').length > 0){
                                return 'PortfolioItem';
                            } else if(record.get('UserStories') && record.get('UserStories').length > 0){
                                return 'UserStory';
                            }
                        }
                        if(record.get('_type') === 'hierarchicalrequirement'){
                            return 'UserStory';
                        }


                    },
                    parentAttributeForChildRecordFn: function(record){
                        if(record.get('Children') && record.get('Children').length > 0){
                            return 'Parent';
                        } else if(record.get('UserStories') && record.get('UserStories').length > 0){
                           return 'PortfolioItem';
                        }
                    },
                    canExpandFn: function(record){
                        debugger;
                        return (record.get("DirectChildrenCount") || get('Children') && record.get('Children').length > 0) ||
                        (record.get('UserStories') && record.get('UserStories').length > 0);
                    },
                    dragThisGroupOnMeFn: function(record){
                        return false;
                    },
                    treeItemConfigForRecordFn: function(record){
                        var canDrag = record.get('_type') === 'hierarchicalrequirement' && record.get('Children').length === 0;

                        var config = {
                            canDrag: canDrag
                        };
                        if(record.get('_type') === 'hierarchicalrequirement'){
                            config.xtype = 'rallystorytreeitem';
                        }
                        return config;
                    }
                }
            ]
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
//        var storyTree = Ext.create('Hackathon.HCB.StoryTree');
//        this.down('#leftSide').add(storyTree);
    }

});
