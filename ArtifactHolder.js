Ext.define('Hackathon.HCB.CardDropTarget', {
    extend: 'Ext.dd.DropTarget',
    requires: [],

    ddGroup: "cardboard",
    dropAllowed: "cardboard",
    dropNotAllowed: "cardboard",

    constructor: function(dropEl, config) {
        this.mergeConfig(config);
        this.callParent([dropEl, this.config]);

        this.dropIndicator = Ext.get('column_drop_indicator') || Ext.getBody().createChild({
            id: 'column_drop_indicator',
            cls: 'rally-drop-indicator',
            style: { height: '2px', display: 'none' }  // start out hidden
        });
        this.dropIndicator.setVisibilityMode(Ext.dom.AbstractElement.DISPLAY);

        // this.column.on('destroy', this.onDestroy, this);
    },

    /**
     * @private
     */
    onDestroy: function() {
        this.dropIndicator.remove();
    },

    /**
     * @inheritdoc
     */
    notifyDrop: function(source, e, data) {
        debugger;
        var samePlace = false,
            // column = this.column,
            // card = column.getCard(data.card.getRecord()),
            // cards = column.getCards(),
            // dropHandler = column.dropControllerPlugin,
            allowDrop = dropHandler.mayDrop(card),
            index;

        if (data.target && data.target.card) {
            var cardInfo = this.column.findCardInfo(data.target.card.record);
            if (cardInfo && data.target.position === 'before') {
                index = cardInfo.index;
                samePlace = cards[index] == card || cards[index - 1] === card;
            } else if (cardInfo && data.target.position === 'after') {
                index = cardInfo.index + 1;
                samePlace = cards[index - 1] === card || cards[index] === card;

                if (index >= cards.length) {
                    index = undefined;
                }
            }
        }

        this._removeAllExistingDropIndicators();
        this.el.removeCls(NO_DROP_CLASS);
        this.el.removeCls(DROP_CLASS);

        if (allowDrop && !samePlace) {
            dropHandler.onCardDropped(data, index);
        }

        return allowDrop;
    },

    /**
     * @inheritdoc
     */
    notifyEnter: function(source, e, data) {
        debugger;
        var dropHandler = this.column.dropControllerPlugin;
        if (dropHandler.addNoDropClass(data.card.getRecord())) {
            dropHandler.getDndContainer().addCls(NO_DROP_CLASS);
        }
        this.el.addCls(DROP_CLASS);
    },

    /**
     * @inheritdoc
     */
    notifyOut: function(source, e, data) {
        debugger;
        this.el.removeCls(NO_DROP_CLASS);
        this.el.removeCls(DROP_CLASS);
        this._removeAllExistingDropIndicators();
    },

    /**
     * @inheritdoc
     */
    notifyOver: function(source, e, data) {
        debugger;
        var column = this.column,
            cards = column.getCards();

        if (!column.mayRank() ||
            (!column.enableCrossColumnRanking &&
                data.column !== column)) {
            //Figure out the natural sort order
            var records = Ext.clone(column.getRecords());
            records.push(data.card.getRecord());
            column._sortCards(records);
            var index = Ext.Array.indexOf(records, data.card.getRecord());
            if (index === 0) {
                if(cards[0]) {
                    this._addDropIndicatorBefore(cards[0], data);
                }
            } else {
                this._addDropIndicatorAfter(cards[index - 1], data);
            }
        } else {
            //Figure out which card we are over
            var mouseEventY = e.xy[1],
                found = false;
            Ext.each(cards, function(card) {
                var cardContainerY = card.getEl().getY();
                var cardContainerHeight = card.getEl().getSize().height;
                if (this._mouseIsOverCard(card, mouseEventY)) {
                    found = true;
                    if (mouseEventY - cardContainerY > cardContainerHeight / 2) {
                        this._addDropIndicatorAfter(card, data);
                    } else {
                        this._addDropIndicatorBefore(card, data);
                    }
                } else if (this._mouseIsBeforeCard(card, mouseEventY)) {
                    found = true;
                    this._addDropIndicatorBefore(card, data);
                }
                if (found) {
                    return false;
                }
            }, this);

            if (!found && cards.length) {
                var last = cards[cards.length - 1];
                this._addDropIndicatorAfter(last, data);
            }
        }
    },

    _mouseIsOverCard: function(card, mouseEventY) {
        debugger;
        var cardContainerY = card.getEl().getY();
        var cardContainerHeight = card.getEl().getSize().height;
        return cardContainerY <= mouseEventY && (cardContainerHeight + cardContainerY) >= mouseEventY;
    },

    _mouseIsBeforeCard: function(card, mouseEventY) {
        var cardContainerY = card.getEl().getY();
        return mouseEventY < cardContainerY;
    },

    /**
     * @private
     */
    _addDropIndicatorAfter: function(card, data) {
        this._removeAllExistingDropIndicators();

        data.target = { card: card, position: 'after' };
        this.dropIndicator.insertAfter(card.getEl());
        this.dropIndicator.setVisible(true);
    },

    /**
     * @private
     */
    _addDropIndicatorBefore: function(card, data) {
        this._removeAllExistingDropIndicators();

        data.target = { card: card, position: 'before' };
        this.dropIndicator.insertBefore(card.getEl());
        this.dropIndicator.setVisible(true);
    },

    /**
     * @private
     */
    _removeAllExistingDropIndicators: function() {
        this.dropIndicator.setVisible(false);
    }
});


Ext.define('Hackathon.HCB.ArtifactHolder', {
    alias: 'widget.hackathonartifactholder',
    extend: 'Ext.Container',
    // plugins: [ {ptype: 'rallycolumndropcontroller'} ],
    layout: 'vbox',
    width: 400,
    height: 400,
    items: [
        {
            xtype: 'component',
            html: 'Visual Clipboard'
        },
        {
            xtype: 'container',
            itemId: 'contents',
            width: 400,
            height: 350,
            cls: 'x-dd-drop-ok cardboard contents',
            style: {
                backgroundColor: '#F00'
            }
        }
    ],

    initComponent: function(){
        this.callParent(arguments);

        this.contents = this.down('#contents');
        this.contents.on('render', this._initializeDropTarget, this);
    },

    _initializeDropTarget: function(){
        // this.contents.dropTarget.notifyDrop = Ext.bind(this.onDrop, this);
        var me = this;

        this.contents.dropZone = Ext.create('Hackathon.HCB.CardDropTarget', this.contents.el, {

            ddGroup: "cardboard",


            // If the mouse is over a grid row, return that node. This is
            // provided as the "target" parameter in all "onNodeXXXX" node event handling functions
            getTargetFromEvent: function(e) {
                debugger;
                return e.getTarget(me.contents.el);
            },

            // On entry into a target node, highlight that node.
            onNodeEnter : function(target, dd, e, data){
                debugger;
                Ext.fly(target).addCls('my-row-highlight-class');
            },

            // On exit from a target node, unhighlight that node.
            onNodeOut : function(target, dd, e, data){
                debugger;
                Ext.fly(target).removeCls('my-row-highlight-class');
            },

            // While over a target node, return the default drop allowed class which
            // places a "tick" icon into the drag proxy.
            onNodeOver : function(target, dd, e, data){
                debugger;
                return Ext.dd.DropZone.prototype.dropAllowed;
            },

            // On node drop we can interrogate the target to find the underlying
            // application object that is the real target of the dragged data.
            // In this case, it is a Record in the GridPanel's Store.
            // We can use the data set up by the DragZone's getDragData method to read
            // any data we decided to attach in the DragZone's getDragData method.
            onNodeDrop : function(target, dd, e, data){
                debugger;
                // var rowIndex = me.contents.el.findRowIndex(target);
                // var r = myGridPanel.getStore().getAt(rowIndex);
                // Ext.Msg.alert('Drop gesture', 'Dropped Record id ' + data.draggedRecord.id +
                //     ' on Record id ' + r.id);
                return true;
            }
        });
    }

    // onDrop: function(source, evt, data){
    //     debugger;
    // }


    // getContentContainer: function(){
    //     return this.column;
    // },

    // onCardDropped: function(){
    //     this.callParent(arguments);
    //     alert('hi');
    // }


});
