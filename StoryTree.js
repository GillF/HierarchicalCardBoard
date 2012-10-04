Ext.define('Hackathon.HCB.StoryTree', {
    extend: 'Ext.Container',

    initComponent: function(){
        this.callParent(arguments);
        this.add({
            xtype: 'component',
            autoEl: 'h1',
            html: 'Unscheduled Story Hierarchy'
        });
        this.add({
            xtype: 'component',
            cls: 'grayLabel',
            html: 'Drill down to see unscheduled leaf user stories. Drag and drop into an iteration on the right.'
        });
        this.buildTree();
    },

    buildTree: function(){
        var tree = Ext.widget('rallytree', {
            topLevelModel: 'PortfolioItem',
            enableDragAndDrop: true,
            childItemsStoreConfigForParentRecordFn: function(record){

                if( this.hasDirectChildren(record) ){
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
                if( this.isPortfolioItem(record) ){
                    if( this.hasChildren(record) ){
                        return 'PortfolioItem';
                    } else if( this.hasUserStories(record) ){
                        return 'UserStory';
                    }
                }
                if( this.isUserStory(record) ){
                    //TODO maybe support Tasks
                    return 'UserStory';
                }

            },

            isUserStory: function(record){
                return record.get('_type') === 'hierarchicalrequirement';
            },

            isPortfolioItem: function(record){
                var recordType = record.get('_type');
                return (/^portfolioitem\/?.*/.test(recordType));
            },

            hasChildren: function(record){
                var children = record.get('Children');
                return children && children.length > 0;
            },

            hasUserStories: function(record){
                var userStories = record.get('UserStories');
                return userStories && userStories.length > 0;
            },

            hasChildNodes: function(record){
                //TODO support Tasks?
                return this.hasChildren(record) || this.hasUserStories(record);
            },

            parentAttributeForChildRecordFn: function(record){
                if( this.hasChildren(record) ){
                    return 'Parent';
                } else if(record.get('UserStories') && record.get('UserStories').length > 0){
                   return 'PortfolioItem';
                }
            },
            canExpandFn: function(record){
                return (record.get('Children') && record.get('Children').length > 0) ||
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

        });

        this.add(tree);
    }
});
