Ext.define('Hackathon.HCB.PortfolioHierarchy', {
    alias: 'widget.hackathonportfoliohierarchy',
    extend: 'Ext.Container',
    requires: ['Rally.ui.tooltip.PercentDoneToolTip',
            'Rally.data.util.PortfolioItemHelper'],

    layout: 'auto',

    items:[
        {
            xtype:'container',
            itemId:'header',
            cls:'header'
        },
        {
            xtype:'container',
            itemId:'bodyContainer'
        }
    ],

    cls: 'portfolio-hierarchy-app',

    initComponent: function() {
        this.callParent(arguments);
        this.addEvents('treeitemselected');

        this.on('afterrender', function(){
            this._attachPercentDoneToolTip();
        }, this);

        Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
            typeRef: 'PortfolioItem/Strategy', //this.getSetting('type'),
            defaultToLowest: false,
            success: this.addTreeForType,
            scope: this
        });
    },

    _drawHeader: function(){
        var header = this.down('#header');

        // if(Rally.alm){
        //     header.add(this._buildHelpComponent());
        // }

        // header.add(this._buildFilterInfo());
    },

    addTreeForType: function(record){

        this.typeName = record.get('Name');
        this._drawHeader();

        var tree = this.buildTreeForType(record);
        this.down('#bodyContainer').add(tree);
    },

    buildTreeForType: function(typeRecord){
        var config = {
            topLevelModel: typeRecord.get('TypePath'),
            childModelTypeForRecordFn: this.getChildModelTypeForRecordFn,
            parentAttributeForChildRecordFn: this.getParentAttributeForChildRecordFn,
            canExpandFn: this.canExpandItem,
            enableDragAndDrop: true,
            dragDropGroupFn: this.dragDropGroup,
            dragThisGroupOnMeFn: this.dragThisGroupOnMe,
            shouldRemoveTreeItemWhenDraggedFromTopOfTree: false,
            scope: this,
            treeItemConfigForRecordFn: this.treeItemConfigForRecord,
            topLevelStoreConfig: {
                filters: [],

                context: {
                    project: undefined,
                    workspace: this.context.getWorkspace()._ref
                }
            },
            listeners: {
                beforerecordsaved: this.beforeRecordSaved,
                itemselected: this._onTreeItemSelected,
                scope: this
            }
        };

        return Ext.create('Rally.ui.tree.Tree', config);
    },

    _onTreeItemSelected: function(treeItem){
        this.fireEvent('treeitemselected', treeItem.record);
    },

    treeItemConfigForRecord: function(record){
        return { selectable: true };
    },

    beforeRecordSaved: function(record, newParentRecord){
        if(record.get('_type') == 'hierarchicalrequirement'){
            if(newParentRecord.get('_type') === 'hierarchicalrequirement'){
                record.set('PortfolioItem', '');
            } else {
                record.set('Parent', '');
            }
        }
    },

    _isRecordBottomPortfolioLevel: function(record){
        return record.self.ordinal === 0;
    },

    _isUserStory: function(record) {
        return record.get('_type') == 'hierarchicalrequirement';
    },

    getChildModelTypeForRecordFn: function(record){

        return (this._isRecordBottomPortfolioLevel(record) || this._isUserStory(record))
            ? 'UserStory'
            : 'PortfolioItem/' + record.getField('Children').allowedValueType._refObjectName;
    },

    getParentAttributeForChildRecordFn: function(record){
        return this._isRecordBottomPortfolioLevel(record)? 'PortfolioItem': 'Parent';
    },

    canExpandItem: function(record){
        return record.get('DirectChildrenCount') > 0
            || (record.get('UserStories') && record.get('UserStories').length > 0)
            || (record.get('Children') && record.get('Children').length > 0);
    },

    dragDropGroup: function(record){
        return record.get('_type').toLowerCase();
    },

    dragThisGroupOnMe: function(record){
        if(this._isUserStory(record) || this._isRecordBottomPortfolioLevel(record)){
            return 'hierarchicalrequirement';
        }

        return 'portfolioitem/' + record.getField('Children').allowedValueType._refObjectName.toLowerCase();
    },

    _attachPercentDoneToolTip: function() {
        Ext.create('Rally.ui.tooltip.PercentDoneToolTip', {
            target: this.getEl(),
            delegate: '.percentDoneContainer',
            percentDoneName: 'PercentDoneByStoryCount',
            listeners: {
                beforeshow: function(tip) {

                    var treeItemEl = Ext.get(tip.triggerElement).up('.treeItem');
                    var treeItem = Ext.getCmp(treeItemEl.id);

                    tip.updateContent(treeItem.getRecord().data);
                },
                scope: this
            }
        });
    },

    _buildHelpComponent:function (config) {
        return Ext.create('Ext.Component', Ext.apply({
            cls:Rally.util.Test.toBrowserTestCssClass('portfolio-hierarchy-help-container') + ' rally-help-icon',
            renderTpl:'<a href="#" title="Launch Help"></a>',
            listeners:{
                click:{
                    element:'el',
                    fn: function(){
                        Rally.alm.util.Help.launchHelp({
                            id:268
                        });
                    },
                    stopEvent:true
                },
                scope:this
            }
        }, config));
    },

    _buildFilterInfo: function(){
        return Ext.create('Rally.ui.tooltip.FilterInfo', {
            projectName: this.getSetting('project') && this.getContext().get('project').Name,
            typeName: this.typeName,
            scopeUp: this.getSetting('projectScopeUp') == 'true' ,
            scopeDown: this.getSetting('projectScopeDown') == 'true'
        });
    }

});

