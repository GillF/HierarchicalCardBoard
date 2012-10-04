(function(){
    //var leftSideWidth = 350;
    Ext.define('Hackathon.HierarchicalCardBoard', {
        extend: 'Rally.app.App',
        componentCls: 'app',

        layout: 'auto',

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
                // region: 'west',
                //width: leftSideWidth,
                collapsible: true
            },
            {
                xtype: 'container',
                cls: 'rightSide',
                itemId: 'rightSide'
                // region: 'center'
            }
            // {
            //     xtype: 'panel',
            //     cls: 'southSide',
            //     itemId: 'southSide',
            //     // region: 'south',
            //     items:[
            //         // {
            //         //     xtype: 'hackathonartifactholder',
            //         //     cls: 'artifactHolder',
            //         //     itemId: 'artifactHolder',
            //         //     //width: leftSideWidth,
            //         // },
            //         {
            //             xtype: 'container',
            //             itemId: 'chartHolder',
            //             width: '75%'
            //         }
            //     ]
            // }
        ],

        launch: function() {
            this.buildStoryTree();
            this.buildCardBoard();
        },

        buildStoryTree: function(){
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

        onTreeItemSelected: function(record) {
            this.down("#rightSide").addCls('flipDown');
            Ext.defer(this.onTreeItemSelected2, 1200, this, [record, this.cardBoard]);
        },

        onTreeItemSelected2: function(record, boardToRemove){
            var rightSide = this.down('#rightSide');
            rightSide.removeAll();
            Ext.defer(rightSide.removeCls, 3800, rightSide, ['flipDown']);
            // this.down('#chartHolder').removeAll();

            if( !this._hasChildren(record) ){
                this.cardBoardConfig.storeConfig.filters = [
                    { property: "ObjectID", value: 0}
                ];
                this.cardBoardConfig.types = [ "User Story" ];
                this.cardBoardConfig.columns = undefined;
                this.cardBoardConfig.attribute = "ScheduleState";

                this.cardBoard = rightSide.add(this.cardBoardConfig);
            }
            else{
                var selectedRef = record.get('_ref');
                var parentType = record.get('_type');

                var child = this._getFirstChild(record);
                var typePath = child._type;
                this.cardBoardConfig.types = [ typePath ];
                this.cardBoardConfig.storeConfig.filters = [
                    {
                        property: "Parent",
                        value: selectedRef
                    }
                ];

                if(typePath.indexOf("PortfolioItem") === 0) {
                    this.cardBoardConfig.attribute = "State";
                    var me = this;
                    this._buildColumns(typePath, function(columns) {
                        me.cardBoardConfig.columns = columns;
                        me.cardBoard = me.down('#rightSide').add(me.cardBoardConfig);
                    });
                }
                else {
                    this.cardBoardConfig.columns = undefined;
                    this.cardBoardConfig.attribute = "ScheduleState";
                    this.cardBoardConfig.storeConfig.filters = [
                        {
                            property: "PortfolioItem",
                            value: selectedRef
                        }
                    ];
                    this.cardBoard = this.down('#rightSide').add(this.cardBoardConfig);
                }

            }
        },

        _hasChildren: function(record){
            var children = record.get('Children')||[];
            var userStories = record.get('UserStories')||[];
            return (children.length + userStories.length) > 0;
        },

        _getFirstChild: function(record){
            var children = record.get('Children')||[];
            children = children.concat( record.get('UserStories')||[] );
            return children[0];
        },

        _buildColumns: function(typePath, callback) {
            var me = this;
            this._getTypeDefRefFor(typePath, function(typeRef) {
                me._getStates(typeRef, function(states) {
                    var columns = [
                            {
                                displayValue:'No Entry',
                                value:null
                            }
                        ];

                    Ext.Array.each(states, function (state) {
                        columns.push({
                            value:state.get('_ref'),
                            displayValue:state.get('Name'),
                            stateRecord:state
                        });
                    });

                    callback(columns);
                });
            });
        },

        _getTypeDefRefFor: function(typePath, callback) {
            Ext.create('Rally.data.WsapiDataStore', {
                model:'TypeDefinition',
                context: this.getNotStupidContext(),
                autoLoad:true,
                filters:[
                    {
                        property: 'TypePath',
                        value: typePath
                    }
                ],
                listeners: {
                    load: function(store, records) {
                        callback(records[0].get('_ref'));
                    }
                }
            });
        },

        _getStates: function(typeRef, callback) {
            Ext.create('Rally.data.WsapiDataStore', {
                model:'State',
                context: this.getNotStupidContext(),
                autoLoad:true,
                fetch:['Name', 'WIPLimit', 'Description'],
                filters:[
                    {
                        property: 'TypeDef',
                        value: typeRef
                    },
                    {
                        property:'Enabled',
                        value:true
                    }
                ],
                sorters:[
                    {
                        property:'OrderIndex',
                        direction:'ASC'
                    }
                ],
                listeners:{
                    load:function (store, records) {
                        callback(records);
                    }
                }
            });
        },

        buildCardBoard: function(){
            this.cardBoardConfig = {
                xtype: 'rallycardboard',
                types: ['User Story'],
                attribute: 'ScheduleState',
                storeConfig: {
                    filters: [
                        { property: "ObjectID", value: 0}
                    ],
                    autoLoad: true,
                    context: this.getNotStupidContext()
                },
                //enableRanking: this.getContext().getWorkspace().WorkspaceConfiguration.DragDropRankingEnabled,

                cardConfig: {
                    componentCls: 'iterationtrackingboard-card',
                    editable: true,
                    showHeaderMenu: true
                }

            };
            this.cardBoard = this.down('#rightSide').add(this.cardBoardConfig);
        },

        getNotStupidContext: function() {
            return {
                workspace: this.getContext().getWorkspace()._ref,
                project: null
           };
        }
    });
}());
