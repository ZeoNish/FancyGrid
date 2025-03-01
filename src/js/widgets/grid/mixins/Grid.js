/*
 * @mixin Fancy.grid.mixin.Grid
 */
(function () {
    //SHORTCUTS
    const F = Fancy;

    //CONSTANTS
    const TOUCH_CLS = F.TOUCH_CLS;
    const HIDDEN_CLS = F.HIDDEN_CLS;
    const GRID_CLS = F.GRID_CLS;
    const GRID_STATE_SORTED_CLS = F.GRID_STATE_SORTED_CLS;
    const GRID_STATE_FILTERED_CLS = F.GRID_STATE_FILTERED_CLS;
    const GRID_CENTER_CLS = F.GRID_CENTER_CLS;
    const GRID_LEFT_CLS = F.GRID_LEFT_CLS;
    const GRID_RIGHT_CLS = F.GRID_RIGHT_CLS;
    const GRID_HEADER_CLS = F.GRID_HEADER_CLS;
    const GRID_BODY_CLS = F.GRID_BODY_CLS;
    const PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
    const GRID_UNSELECTABLE_CLS = F.GRID_UNSELECTABLE_CLS;
    const GRID_LEFT_EMPTY_CLS = F.GRID_LEFT_EMPTY_CLS;
    const GRID_RIGHT_EMPTY_CLS = F.GRID_RIGHT_EMPTY_CLS;
    const GRID_COLUMN_SORT_ASC_CLS = F.GRID_COLUMN_SORT_ASC;
    const GRID_COLUMN_SORT_DESC_CLS = F.GRID_COLUMN_SORT_DESC;
    const GRID_ROW_GROUP_CLS = F.GRID_ROW_GROUP_CLS;
    const GRID_ROW_GROUP_COLLAPSED_CLS = F.GRID_ROW_GROUP_COLLAPSED_CLS;

    const PANEL_CLS = F.PANEL_CLS;
    const PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
    const PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
    const PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
    const PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;
    const PANEL_GRID_INSIDE_CLS = F.PANEL_GRID_INSIDE_CLS;

    const ANIMATE_DURATION = F.ANIMATE_DURATION;

    const GRID_ANIMATION_CLS = F.GRID_ANIMATION_CLS;

    let activeGrid;

    F.Mixin('Fancy.grid.mixin.Grid', {
        tabScrollStep: 80,
        waitingForFilters: false,
        tpl: [
            '<div class="' + GRID_LEFT_CLS + ' ' + GRID_LEFT_EMPTY_CLS + '"></div>',
            '<div class="' + GRID_CENTER_CLS + '"></div>',
            '<div class="' + GRID_RIGHT_CLS + ' ' + GRID_RIGHT_EMPTY_CLS + '"></div>',
            '<div class="fancy-grid-editors"></div>'
        ],
        /*
     *
     */
        initStore() {
            var me = this,
                fields = me.getFieldsFromData(me.data),
                modelName = 'Fancy.model.' + F.id(),
                data = me.data,
                remoteSort,
                remoteFilter,
                pageType,
                collapsed = false,
                state = me.state;

            if (me.data.items) {
                data = me.data.items;
            }

            remoteSort = me.data.remoteSort;
            remoteFilter = me.data.remoteFilter;
            pageType = me.data.remotePage;

            if (pageType) {
                pageType = 'server';
            }

            F.define(modelName, {
                extend: F.Model,
                fields: fields
            });

            if (me.isGroupable() && me.grouping.collapsed !== undefined) {
                collapsed = me.grouping.collapsed;
            }

            const storeConfig = {
                widget: me,
                model: modelName,
                data,
                paging: me.paging,
                remoteSort,
                remoteFilter,
                pageType,
                collapsed,
                multiSort: me.multiSort
            };

            if (me.multiSortLimit) {
                storeConfig.multiSortLimit = me.multiSortLimit;
            }

            if (me.infinite) {
                storeConfig.infinite = true;
            }

            if (state) {
                if (state.filters) {
                    storeConfig.filters = state.filters;
                }
            }

            if (me.filterable === true && !storeConfig.filters) {
                storeConfig.filters = {};
            }

            if (data.pageSize) {
                storeConfig.pageSize = data.pageSize;
            }

            me.store = new F.Store(storeConfig);

            me.model = modelName;
            me.fields = fields;

            /*
      if (me.store.filters && !F.Object.isEmpty(me.store.filters)){
        setTimeout(function(){
          me.filter.updateStoreFilters();
        }, 1);
      }
      */
        },
        initDebug() {
            const me = this;

            if (F.DEBUG) {
                if (me.panel) {
                    me.panel.addCls('fancy-debug');
                } else {
                    me.addCls('fancy-debug');
                }
            }
        },
        /*
     *
     */
        initTouch() {
            const me = this;

            if (F.isTouch && window.FastClick) {
                if (me.panel) {
                    // eslint-disable-next-line
                    FastClick.attach(me.panel.el.dom);
                    me.panel.addCls(TOUCH_CLS);
                } else {
                    // eslint-disable-next-line
                    FastClick.attach(me.el.dom);
                    me.addCls(TOUCH_CLS);
                }
            }
        },
        /*
     *
     */
        initElements() {
            const me = this;

            if (me.header !== false) {

                me.leftHeader = new F.grid.Header({
                    widget: me,
                    side: 'left'
                });

                me.header = new F.grid.Header({
                    widget: me,
                    side: 'center'
                });

                me.rightHeader = new F.grid.Header({
                    widget: me,
                    side: 'right'
                });
            }

            me.leftBody = new F.grid.Body({
                widget: me,
                side: 'left'
            });

            me.body = new F.grid.Body({
                widget: me,
                side: 'center'
            });

            me.rightBody = new F.grid.Body({
                widget: me,
                side: 'right'
            });

            me.leftEl = me.el.select(`.${GRID_LEFT_CLS}`);
            me.centerEl = me.el.select(`.${GRID_CENTER_CLS}`);
            me.rightEl = me.el.select(`.${GRID_RIGHT_CLS}`);
        },
        /*
     * @param {Array} data
     * @return {Array}
     */
        getFieldsFromData(data) {
            const me = this,
                items = data.items || data;

            if (data.fields) {
                if (me.isTreeData) {
                    data.fields.push('$deep');
                    data.fields.push('leaf');
                    data.fields.push('parentId');
                    data.fields.push('expanded');
                    data.fields.push('child');
                    data.fields.push('filteredChild');
                }

                return data.fields;
            }

            if (!items) {
                F.error('Data is empty and not set fields of data to build model', 4);
            }

            const itemZero = items[0],
                fields = [];

            for (var p in itemZero) {
                fields.push(p);
            }

            if (me.isTreeData) {
                fields.push('$deep');
                fields.push('leaf');
                fields.push('parentId');
                fields.push('expanded');
                fields.push('child');
            }

            return fields;
        },
        /*
     *
     */
        render() {
            var me = this,
                renderTo = Fancy.get(me.renderTo || document.body),
                el = F.newEl('div'),
                panelBodyBorders = me.panelBodyBorders;

            if (me.renderOuter) {
                el = renderTo;
            }

            if (!renderTo.dom) {
                F.error(`Could not find renderTo element: ${me.renderTo}`, 1);
            }

            el.addCls(
                F.cls,
                me.widgetCls,
                me.cls
            );

            if (Fancy.loadingStyle) {
                if (me.panel) {
                    me.panel.el.css('opacity', 0);
                    me.intervalStyleLoad = setInterval(() => {
                        if (!Fancy.loadingStyle) {
                            clearInterval(me.intervalStyleLoad);
                            me.panel.el.animate({
                                'opacity': 1,
                                force: true
                            });
                        }
                    }, 100);
                } else {
                    el.css('opacity', 0);
                    me.intervalStyleLoad = setInterval(() => {
                        if (!Fancy.loadingStyle) {
                            clearInterval(me.intervalStyleLoad);
                            me.el.animate({
                                'opacity': 1,
                                force: true
                            });
                        }
                    }, 100);
                }
            }

            el.attr('role', 'grid');
            el.attr('id', me.id);

            if (me.panel === undefined && me.shadow) {
                el.addCls('fancy-panel-shadow');
            }

            if (me.columnLines === false) {
                el.addCls('fancy-grid-disable-column-lines');
            }

            if (me.rowLines === false) {
                el.addCls('fancy-grid-disable-row-lines');
            }

            if (me.theme !== 'default' && !me.panel) {
                el.addCls(Fancy.getThemeCSSCls(me.theme));
            }

            if (me.treeFolder) {
                el.addCls('fancy-grid-tree-folder');
            }

            var panelBordersWidth = 0,
                panelBorderHeight = 0;

            if (me.panel) {
                panelBordersWidth = panelBodyBorders[1] + panelBodyBorders[3];
            }

            el.css({
                width: (me.width - panelBordersWidth) + 'px',
                height: (me.height - panelBorderHeight) + 'px'
            });

            me.initTpl();
            el.update(me.tpl.getHTML({}));

            if (me.renderOuter) {
                me.el = el;
            } else {
                me.el = F.get(renderTo.dom.appendChild(el.dom));
            }

            me.setHardBordersWidth();

            setTimeout(() => {
                if (Fancy.nojQuery) {
                    me.el.addCls(Fancy.GRID_ANIMATION_CLS);
                }
            }, 100);

            me.rendered = true;
        },
        /*
     *
     */
        setHardBordersWidth() {
            var me = this,
                borders = me.panel ? me.gridBorders : me.gridWithoutPanelBorders;

            if (me.wrapped) {
                borders = me.gridBorders;
            }

            me.css({
                'border-top-width': borders[0],
                'border-right-width': borders[1],
                'border-bottom-width': borders[2],
                'border-left-width': borders[3]
            });
        },
        /*
     * @param {Object} [o]
     */
        update(o) {
            const me = this,
                s = me.store;

            if (s.loading) {
                return;
            }

            if (me.expander) {
                me.expander.reSet();
            }

            var type = 'default';

            if (o && o.type) {
                type = o.type;
            }

            me.updater.update(type);
            me.fire('update');

            if (me.heightFit) {
                me.fitHeight();
            }

            me.setBodysHeight();

            if (me.paging) {
                me.paging.update();
            }

            if (o && o.flash) {
                const changes = me.store.changed;

                for (const id in changes) {
                    const item = changes[id],
                        rowIndex = me.getRowById(id);

                    if (rowIndex === undefined) {
                        continue;
                    }

                    for (const key in item) {
                        switch (key) {
                            case 'length':
                                break;
                            default:
                                const _o = me.getColumnOrderByKey(key);

                                switch (o.flash) {
                                    case true:
                                        me.flashCell(rowIndex, _o.order, _o.side);
                                        break;
                                    case 'plusminus':
                                        me.flashCell(rowIndex, _o.order, _o.side, {
                                            type: 'plusminus',
                                            delta: item[key].value - item[key].originValue
                                        });
                                        break;
                                }
                        }
                    }
                }

                me.clearDirty();
            } else {
                me.scroller.update();
            }

            me._setColumnsAutoWidth();
        },
        /*
     *
     */
        lightStartUpdate() {
            const me = this;

            if (me.rowheight) {
                me.rowheight.onUpdate();
            }

            me.bugFixReFreshChartColumns('left');
            me.bugFixReFreshChartColumns('center');
            me.bugFixReFreshChartColumns('right');
        },
        /*
     *
     */
        bugFixReFreshChartColumns(side) {
            const me = this,
                body = me.getBody(side),
                columns = me.getColumns(side);

            columns.forEach((column, i) => {
                switch (column.type) {
                    case 'grossloss':
                        body.renderGrossLoss(i);
                        break;
                    case 'hbar':
                        body.renderHBar(i);
                        break;
                }
            });
        },
        /*
     * @param {String} side
     * @return {Number}
     */
        getColumnsWidth(side) {
            const me = this;

            switch (side) {
                case 'center':
                case undefined:
                    return me.getCenterFullWidth();
                case 'left':
                    return me.getLeftFullWidth();
                case 'right':
                    return me.getRightFullWidth();
            }
        },
        /*
     *
     */
        setSides() {
            var me = this,
                leftColumns = me.leftColumns,
                rightColumns = me.rightColumns,
                leftWidth = me.getLeftFullWidth(),
                centerWidth = me.getCenterFullWidth(),
                rightWidth = me.getRightFullWidth(),
                gridBorders = me.gridBorders,
                panelBodyBorders = me.panelBodyBorders,
                gridWithoutPanelBorders = me.gridWithoutPanelBorders;

            if (leftColumns.length > 0) {
                me.leftEl.removeCls(GRID_LEFT_EMPTY_CLS);
            }

            if (rightColumns.length > 0) {
                me.rightEl.removeCls(GRID_RIGHT_EMPTY_CLS);
            }

            if (me.wrapped) {
                centerWidth = me.width - gridBorders[1] - gridBorders[3];
            } else if (me.panel) {
                centerWidth = me.width - gridBorders[1] - gridBorders[3] - panelBodyBorders[1] - panelBodyBorders[3];
            } else {
                centerWidth = me.width - gridWithoutPanelBorders[1] - gridWithoutPanelBorders[3];
            }

            if (leftWidth === 0 && rightWidth === 0) {
            } else if (rightWidth === 0) {
                centerWidth -= leftWidth;
            } else if (leftWidth === 0) {
                centerWidth -= rightWidth;
            } else if (me.width > leftWidth + centerWidth + rightWidth) {
                centerWidth -= leftWidth;
            } else {
                centerWidth -= leftWidth + rightWidth;
            }

            me.leftEl.css({
                width: leftWidth + 'px'
            });

            me.centerEl.css({
                left: leftWidth + 'px',
                width: centerWidth + 'px'
            });

            if (me.header) {
                me.el.select(`.${GRID_LEFT_CLS} .${GRID_HEADER_CLS}`).css({
                    width: leftWidth + 'px'
                });

                me.el.select(`.${GRID_CENTER_CLS} .${GRID_HEADER_CLS}`).css({
                    width: centerWidth + 'px'
                });
            }

            me.el.select(`.${GRID_CENTER_CLS} .${GRID_BODY_CLS}`).css({
                width: centerWidth + 'px'
            });

            if (me.width > leftWidth + centerWidth + rightWidth) {
                me.rightEl.css({
                    right: '0px'
                });
            } else {
                me.rightEl.css({
                    left: '',
                    right: '0px'
                });
            }

            me.rightEl.css({
                width: rightWidth
            });

            if (me.header) {
                me.el.select(`.${GRID_RIGHT_CLS} .${GRID_HEADER_CLS}`).css({
                    width: rightWidth + 'px'
                });
            }

            me.startWidths = {
                center: centerWidth,
                left: leftWidth,
                right: rightWidth
            };
        },
        /*
     *
     */
        setColumnsPosition() {
            const me = this;

            me.body.setColumnsPosition();
            me.leftBody.setColumnsPosition();
            me.rightBody.setColumnsPosition();
        },
        /*
     * @param {Number} [viewHeight]
     */
        setSidesHeight(viewHeight) {
            var me = this,
                s = me.store,
                height = 1,
                cellHeaderHeight = me.cellHeaderHeight;

            if (me.header !== false) {
                height += cellHeaderHeight;
                if (me.filter && me.filter.header) {
                    if (me.groupheader) {
                        if (me.filter.groupHeader) {
                            height += cellHeaderHeight;
                        }
                    } else {
                        height += cellHeaderHeight;
                    }
                }

                if (me.groupheader) {
                    if (!(me.filter && me.filter.header)) {
                        height += cellHeaderHeight;
                    } else {
                        height += cellHeaderHeight;
                    }
                }
            }

            if (me.isGroupable()) {
                height += me.grouping.groups.length * me.groupRowHeight;
            }

            if (me.expander) {
                height += me.expander.plusHeight;
            }

            if (me.summary) {
                height += me.summary.topOffSet;
                //height += me.summary.bottomOffSet;
            }

            if (me.rowheight && me.rowheight.totalHeight) {
                viewHeight = me.rowheight.totalHeight;
            }

            height += viewHeight || (s.getLength() * me.cellHeight - 1);

            if (me.paging && me.summary && me.summary.position === 'bottom') {
                height = me.height;
            }

            me.leftEl.css({
                height: height + 'px'
            });

            me.centerEl.css({
                height: height + 'px'
            });

            me.rightEl.css({
                height: height + 'px'
            });
        },
        /*
     *
     */
        setBodysHeight() {
            const me = this;

            me.body.setHeight();
            me.leftBody.setHeight();
            me.rightBody.setHeight();
        },
        /*
     *
     */
        preRender() {
            const me = this;

            if (me.title || me.subTitle || me.tbar || me.bbar || me.buttons || me.panel) {
                me.renderPanel();
            }
        },
        /*
     *
     */
        renderPanel() {
            const me = this,
                panelConfig = {
                    renderTo: me.renderTo,
                    renderOuter: me.renderOuter,
                    title: me.title,
                    subTitle: me.subTitle,
                    width: me.width,
                    height: me.height,
                    titleHeight: me.titleHeight,
                    subTitleHeight: me.subTitleHeight,
                    barHeight: me.barHeight,
                    subTBarHeight: me.subTBarHeight || me.barHeight,
                    tbarHeight: me.tbarHeight || me.barHeight,
                    bbarHeight: me.bbarHeight || me.barHeight,
                    buttonsHeight: me.buttonsHeight || me.barHeight,
                    theme: me.theme,
                    shadow: me.shadow,
                    style: me.style || {},
                    window: me.window,
                    modal: me.modal,
                    frame: me.frame,
                    items: [me],
                    draggable: me.draggable,
                    resizable: me.resizable,
                    minWidth: me.minWidth,
                    minHeight: me.minHeight,
                    panelBodyBorders: me.panelBodyBorders,
                    barContainer: me.barContainer,
                    barScrollEnabled: me.barScrollEnabled,
                    tabScrollStep: me.tabScrollStep
                },
                panelBodyBorders = me.panelBodyBorders;

            if (me.bbar) {
                panelConfig.bbar = me.bbar;
                if (me.bbarHidden) {
                    panelConfig.bbarHidden = true;
                } else {
                    me.height -= me.bbarHeight || me.barHeight;
                }
            }

            if (me.tbar) {
                panelConfig.tbar = me.tbar;
                if (me.tbarHidden) {
                    panelConfig.tbarHidden = true;
                } else {
                    me.height -= me.tbarHeight || me.barHeight;
                }
            }

            if (me.subTBar) {
                panelConfig.subTBar = me.subTBar;
                if (me.subTBarHidden) {
                    panelConfig.subTBarHidden = true;
                } else {
                    me.height -= me.subTBarHeight || me.barHeight;
                }
            }

            if (me.buttons) {
                panelConfig.buttons = me.buttons;
                if (me.buttonsHidden) {
                    panelConfig.buttonsHidden = true;
                } else {
                    me.height -= me.buttonsHeight || me.barHeight;
                }
            }

            if (me.footer) {
                panelConfig.footer = me.footer;
                me.height -= me.barHeight;
            }

            me.panel = new F.Panel(panelConfig);

            me.bbar = me.panel.bbar;
            me.tbar = me.panel.tbar;
            me.subTBar = me.panel.subTBar;
            me.buttons = me.panel.buttons;

            if (!me.wrapped) {
                me.panel.addCls(PANEL_GRID_INSIDE_CLS);
            }

            if (me.title) {
                me.height -= me.titleHeight;
            }

            if (me.subTitle) {
                me.height -= me.subTitleHeight;
                me.height += panelBodyBorders[2];
            }

            me.height -= panelBodyBorders[0] + panelBodyBorders[2];

            me.renderTo = me.panel.el.select(`.${PANEL_BODY_INNER_CLS}`).dom;

            if (me.resizable) {
                me.panel.on('resize', () => me.setBodysHeight());
            }
        },
        /*
     * @return {Number}
     */
        getBodyHeight() {
            let me = this,
                height = me.height,
                rows = 1,
                gridBorders = me.gridBorders,
                gridWithoutPanelBorders = me.gridWithoutPanelBorders;

            if (me.groupheader) {
                rows = 2;
            }

            if (me.filter && me.filter.header) {
                if (me.groupheader) {
                    if (me.filter.groupHeader && !me.subHeaderFilter) {
                        rows++;
                    }

                    if (me.subHeaderFilter) {
                        height -= me.cellHeight;
                    }
                } else {
                    if (me.subHeaderFilter) {
                        height -= me.cellHeight;
                    } else {
                        rows++;
                    }
                }
            }

            if (me.header !== false) {
                height -= me.cellHeaderHeight * rows;
            }

            if (me.panel) {
                height -= gridBorders[0] + gridBorders[2];
            } else {
                height -= gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2];
            }

            if (me.summary) {
                height -= me.summary.topOffSet;
                height -= me.summary.bottomOffSet;
            }

            return height;
        },
        /*
     *
     */
        ons() {
            const me = this,
                store = me.store,
                docEl = F.get(document);

            store.on('set', me.onSetStore, me);
            store.on('insert', me.onInsertStore, me);
            store.on('remove', me.onRemoveStore, me);
            store.on('beforesort', me.onBeforeSortStore, me);
            store.on('sort', me.onSortStore, me);
            store.on('beforeload', me.onBeforeLoadStore, me);
            store.on('load', me.onLoadStore, me);
            docEl.on('mouseup', me.onDocMouseUp, me);
            docEl.on('click', me.onDocClick, me);
            docEl.on('mousemove', me.onDocMove, me);
            store.on('servererror', me.onServerError, me);
            store.on('serversuccess', me.onServerSuccess, me);

            if (me.responsive) {
                me.once('render', me.initResponsiveness, me);
            }

            me.on('activate', me.onActivate, me);
            me.on('deactivate', me.onDeActivate, me);
            me.on('filter', me.onFilter, me);
            me.on('sort', me.onSort, me);
        },
        /*
     * @param {Object} grid
     * @param {String} errorTitle
     * @param {String} errorText
     * @param {Object} request
     */
        onServerError(grid, errorTitle, errorText, request) {
            this.fire('servererror', errorTitle, errorText, request);
        },
        /*
     * @param {Object} grid
     * @param {Array} data
     * @param {Object} request
     */
        onServerSuccess(grid, data, request) {
            this.fire('serversuccess', data, request);
        },
        /*
     * @param {Object} store
     */
        onBeforeLoadStore() {
            this.fire('beforeload');
        },
        /*
     * @param {Object} store
     * @param {String} id
     * @param {Fancy.Model} record
     */
        onRemoveStore(store, id, record) {
            this.fire('remove', id, record);
        },
        /*
     * @param {Object} store
     * @param {Fancy.Model} record
     */
        onInsertStore(store, record) {
            this.fire('insert', record);
        },
        /*
     * @param {Object} store
     */
        onLoadStore() {
            const me = this;

            setTimeout(() => {
                me.fire('load');
                if (!me.stateIsWaiting) {
                    me.UPDATING_AFTER_LOAD = true;
                    me.store.changeDataView({
                        reSort: true
                    });
                    me.update();
                    me.setSidesHeight();
                    delete me.UPDATING_AFTER_LOAD;
                }
            }, 1);
        },
        /*
     * @param {Object} store
     * @param {Object} o
     */
        onSetStore(store, o) {
            const me = this;

            me.fire('set', o);
            me.fire('change', o);
            me.fire('edit', o);
        },
        /*
     * @param {Object} store
     * @param {Object} o
     */
        onBeforeSortStore(store, o) {
            this.fire('beforesort', o);
        },
        /*
     * @param {Object} store
     * @param {Object} o
     */
        onSortStore(store, o) {
            this.fire('sort', o);
        },
        /*
     * @return {Number}
     */
        getCellsViewHeight() {
            var me = this,
                s = me.store,
                plusScroll = 0,
                scrollBottomHeight = 0,
                cellsHeight = 0;

            if (me.isGroupable()) {
                me.grouping.calcPlusScroll();
                plusScroll += me.grouping.plusScroll;
            }

            if (me.expander) {
                plusScroll += me.expander.plusScroll;
            }

            if (!me.scroller.scrollBottomEl || me.scroller.scrollBottomEl.hasCls(HIDDEN_CLS)) {
            } else {
                scrollBottomHeight = me.scroller.cornerSize;
            }

            if (me.rowheight) {
                cellsHeight = me.rowheight.totalHeight;
            } else {
                cellsHeight = me.cellHeight * s.dataView.length;
            }

            return cellsHeight + scrollBottomHeight + plusScroll;
        },
        /*
     * @param {Object} e
     */
        onDocMouseUp() {
            this.fire('docmouseup');
        },
        /*
     * @param {Object} e
     */
        onDocClick(e) {
            this.fire('docclick', e);
        },
        /*
     * @param {Object} e
     */
        onDocMove(e) {
            this.fire('docmove', e);
        },
        /*
     * @return {Number}
     */
        getCenterViewWidth() {
            //Realization could be reason of bug
            const me = this,
                elWidth = me.centerEl.width();

            if (elWidth === 0) {
                let width = 0;

                me.columns.forEach(column => {
                    if (!column.hidden) {
                        width += column.width;
                    }
                })

                return width;
            }

            return elWidth;
        },
        /*
     * @return {Number}
     */
        getCenterFullWidth() {
            let width = 0;

            this.columns.forEach(column => {
                if (!column.hidden) {
                    width += column.width;
                }
            })

            return width;
        },
        /*
     * @return {Number}
     */
        getLeftFullWidth() {
            let width = 0;

            this.leftColumns.forEach(column => {
                if (!column.hidden) {
                    width += column.width;
                }
            });

            return width;
        },
        /*
     * @return {Number}
     */
        getRightFullWidth() {
            let width = 0;

            this.rightColumns.forEach(column => {
                if (!column.hidden) {
                    width += column.width;
                }
            });

            return width;
        },
        /*
     * @param {String} [side]
     * @return {Array}
     */
        getColumns(side) {
            const me = this;
            let columns = [];

            switch (side) {
                case 'left':
                    columns = me.leftColumns;
                    break;
                case 'center':
                    columns = me.columns;
                    break;
                case 'right':
                    columns = me.rightColumns;
                    break;
                case undefined:
                    columns = columns.concat(me.leftColumns).concat(me.columns).concat(me.rightColumns);
                    break;
            }

            return columns;
        },
        /*
     * @param {Array} columns
     * @param {String} side
     */
        setColumnsLinksToSide(columns, side) {
            const me = this;

            switch (side) {
                case 'left':
                    me.leftColumns = columns;
                    break;
                case 'center':
                case undefined:
                    me.columns = columns;
                    break;
                case 'right':
                    me.rightColumns = columns;
                    break;
            }
        },
        /*
     * @param {String} side
     * @return {Fancy.grid.Body}
     */
        getBody(side) {
            let me = this,
                body;

            switch (side) {
                case 'left':
                    body = me.leftBody;
                    break;
                case 'center':
                    body = me.body;
                    break;
                case 'right':
                    body = me.rightBody;
                    break;
            }

            return body;
        },
        /*
     * @param {String} side
     * @return {Fancy.grid.Header}
     */
        getHeader(side) {
            let me = this,
                header;

            switch (side) {
                case 'left':
                    header = me.leftHeader;
                    break;
                case 'center':
                    header = me.header;
                    break;
                case 'right':
                    header = me.rightHeader;
                    break;
            }

            return header;
        },
        /*
     * @param {String|Number} index
     * @param {String} [side]
     * @return {Fancy.Element}
     */
        getHeaderCell(index, side) {
            let me = this,
                cell,
                header;

            if (F.isString(index)) {
                const o = me.getColumnOrderByKey(index);

                header = me.getHeader(o.side);
                if (!header) {
                    return;
                }
                cell = header.getCell(o.order);
            } else {
                side = side || 'center';
                header = me.getHeader(side);
                if (!header) {
                    return;
                }
                cell = header.getCell(index);
            }

            return cell;
        },
        /*
     * @param {Number} rowIndex
     * @return {Array}
     */
        getDomRow(rowIndex) {
            const me = this,
                leftBody = me.leftBody,
                body = me.body,
                rightBody = me.rightBody,
                cells = [];

            me.leftColumns.forEach((column, i) => {
                cells.push(leftBody.getDomCell(rowIndex, i));
            });

            me.columns.forEach((column, i) => {
                cells.push(body.getDomCell(rowIndex, i));
            });

            me.rightColumns.forEach((column, i) => {
                cells.push(rightBody.getDomCell(rowIndex, i));
            });

            return cells;
        },
        /*
     *
     */
        initTextSelection() {
            const me = this;

            if (me.textSelection === false) {
                me.addCls(GRID_UNSELECTABLE_CLS);
            }
        },
        /*
     * @param {String} type
     * @param {*} value
     */
        setTrackOver(type, value) {
            const me = this;

            switch (type) {
                case 'cell':
                    me.cellTrackOver = value;
                    break;
                case 'column':
                    me.columnTrackOver = value;
                    break;
                case 'row':
                    me.trackOver = value;
                    break;
            }
        },
        /*
     * @param {String} type
     */
        setSelModel(type) {
            const me = this,
                selection = me.selection;

            selection.cell = false;
            selection.cells = false;
            selection.row = false;
            selection.rows = false;
            selection.column = false;
            selection.columns = false;
            selection[type] = true;

            selection.selModel = type;

            me.multiSelect = type === 'rows';

            selection.clearSelection();
        },
        /*
     * @param {Boolean} [returnModel]
     * @return {Array}
     */
        getSelection(returnModel) {
            return this.selection.getSelection(returnModel);
        },
        /*
     * @param {Number} params
     */
        selectCell(params) {
            return this.selection.selectCell(params);
        },
        /*
     *
     */
        selectCellLeft() {
            return this.selection.moveLeft();
        },
        /*
     *
     */
        selectCellRight() {
            return this.selection.moveRight();
        },
        /*
     * @return {Cell|undefined}
     */
        selectCellDown() {
            return this.selection.moveDown();
        },
        /*
     *
     */
        selectCellUp() {
            return this.selection.moveUp();
        },
        /*
     *
     */
        clearSelection() {
            const selection = this.selection;

            if (selection) {
                selection.clearSelection();
            }
        },
        /*
     * @param {Boolean} container
     */
        destroy(container) {
            const me = this,
                s = me.store;
            // docEl = F.get(document);

            if (me.panel) {
                me.panel.hide();
            } else {
                me.el.hide();
            }

            //docEl.un('mouseup', me.onDocMouseUp, me);
            //docEl.un('click', me.onDocClick, me);
            //docEl.un('mousemove', me.onDocMove, me);

            if (me.el && me.el.dom) {
                me.body.destroy();
                me.leftBody.destroy();
                me.rightBody.destroy();

                me.header.destroy();
                me.leftHeader.destroy();
                me.rightHeader.destroy();

                me.scroller.destroy();

                if (container === false) {
                    const children = me.panel ? me.panel.el.child() : me.el.child();
                    Fancy.each(children, child => child.destroy());
                } else {
                    me.el.destroy();

                    if (me.panel) {
                        me.panel.el.destroy();
                    }
                }
            }

            s.destroy();

            if (me.responsiveOverver && me.responsiveOverver.stop) {
                me.responsiveOverver.stop();
                delete me.responsiveOverver;
            }
        },
        clearData() {
            const me = this;

            me.setData([]);
            me.update();
            me.scroller.update();
        },
        /*
     *
     */
        showAt() {
            const me = this;

            if (me.panel) {
                me.panel.showAt.apply(me.panel, arguments);
            }
        },
        /*
     *
     */
        show() {
            const me = this;

            setTimeout(() => {
                if (me.panel) {
                    me.panel.show.apply(me.panel, arguments);
                } else {
                    me.el.show();
                }
            }, 30);
        },
        /*
     *
     */
        hide() {
            const me = this;

            if (me.panel) {
                me.panel.hide.apply(me.panel, arguments);
            } else {
                me.el.hide();
            }

            if (me.celledit) {
                const editor = me.celledit.activeEditor;

                if (editor) {
                    editor.hide();
                }
            }
        },
        /*
     *
     */
        initDateColumn() {
            const me = this;

            const prepareColumns = function (columns) {
                columns.forEach(column => {
                    if (column.type === 'date') {
                        column.format = column.format || {};

                        const format = {
                            type: 'date'
                        };

                        F.applyIf(format, me.lang.date);

                        F.applyIf(column.format, format);
                    }
                });

                return columns;
            };

            me.columns = prepareColumns(me.columns);
            me.leftColumns = prepareColumns(me.leftColumns);
            me.rightColumns = prepareColumns(me.rightColumns);
        },
        /*
     *
     */
        stopEditor() {
            this.edit.stopEditor();
        },
        /*
     *
     */
        stopSaving() {
            this.store.stopSaving = true;
        },
        /*
     * @param {String} id
     * @return {Fancy.Model}
     */
        getById(id) {
            return this.store.getById(id);
        },
        /*
     * @param {Number} rowIndex
     * @param {String} key
     * @return {Fancy.Model}
     */
        get(rowIndex, key) {
            const me = this,
                store = me.store;

            if (key !== undefined) {
                return store.get(rowIndex, key);
            } else if (rowIndex === undefined) {
                return store.get();
            }

            return store.getItem(rowIndex);
        },
        /*
     * @param {Number} id
     * @return {Number}
     */
        getRowById(id) {
            return this.store.getRow(id);
        },
        /*
     * @return {Number}
     */
        getTotal() {
            return this.store.getTotal();
        },
        /*
     * @return {Number}
     */
        getViewTotal() {
            return this.store.getLength();
        },
        /*
     * @return {Array}
     */
        getDataView() {
            return this.store.getDataView();
        },
        /*
     * @return {Array}
     */
        getData() {
            return this.store.getData();
        },
        /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     * @param {Boolean} [fire]
     */
        selectRow(rowIndex, value, multi, fire) {
            this.selection.selectRow(rowIndex, value, multi, fire);
            //this.activated = true;
        },
        /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
        deSelectRow(rowIndex) {
            this.selection.selectRow(rowIndex, false, true);
            //this.activated = true;
        },
        /*
     * @param {Number|String} id
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
        selectById(rowIndex, value, multi) {
            this.selection.selectById(rowIndex, value, multi);
        },
        /*
     * @param {String} key
     */
        selectColumn(key) {
            let me = this,
                side,
                columnIndex,
                leftColumns = me.leftColumns || [],
                columns = me.columns || [],
                rightColumns = me.rightColumns || [];

            const isInSide = (columns) => {
                let i = 0,
                    iL = columns.length;

                for (; i < iL; i++) {
                    const column = columns[i];

                    if (column.index === key) {
                        columnIndex = i;
                        return true;
                    }
                }

                return false;
            };

            if (isInSide(leftColumns)) {
                side = 'left';
            } else if (isInSide(columns)) {
                side = 'center';
            } else if (isInSide(rightColumns)) {
                side = 'right';
            }

            if (side) {
                me.selection.selectColumn(columnIndex, side);
            }
        },
        /*
     * @param {String} key
     * @return {Object}
     */
        getColumnByIndex(key) {
            let me = this,
                columns = me.getColumns(),
                i = 0,
                iL = columns.length;

            for (; i < iL; i++) {
                const column = columns[i];
                if (column.index === key) {
                    return column;
                }
            }
        },
        /*
     * @param {String} key
     * @return {Object}
     */
        getColumn(key) {
            return this.getColumnByIndex(key);
        },
        /*
     * @param {String} id
     * @return {Object}
     */
        getColumnById(id) {
            let me = this,
                columns = me.getColumns(),
                i = 0,
                iL = columns.length;

            for (; i < iL; i++) {
                const column = columns[i];
                if (column.id === id) {
                    return column;
                }
            }
        },
        /*
     * @param {String} key
     * @return {Object}
     */
        getColumnOrderByKey(key) {
            let me = this,
                leftColumns = me.leftColumns || [],
                columns = me.columns || [],
                rightColumns = me.rightColumns || [],
                side = '',
                order;

            columns.forEach((column, i) => {
                if (column.index === key) {
                    side = 'center';
                    order = i;
                }
            });

            if (!side) {
                leftColumns.forEach((column, i) => {
                    if (column.index === key) {
                        side = 'left';
                        order = i;
                    }
                });

                if (!side) {
                    rightColumns.forEach((column, i) => {
                        if (column.index === key) {
                            side = 'right';
                            order = i;
                        }
                    });
                }
            }

            return {
                side,
                order
            };
        },
        /*
     * @param {String} id
     * @return {Object}
     */
        getColumnOrderById(id) {
            var me = this,
                leftColumns = me.leftColumns || [],
                columns = me.columns || [],
                rightColumns = me.rightColumns || [],
                side = '',
                order;

            F.each(columns, (column, i) => {
                if (column.id === id) {
                    side = 'center';
                    order = i;
                }
            });

            if (!side) {
                F.each(leftColumns, (column, i) => {
                    if (column.id === id) {
                        side = 'left';
                        order = i;
                    }
                });

                if (!side) {
                    F.each(rightColumns, (column, i) => {
                        if (column.id === id) {
                            side = 'right';
                            order = i;
                        }
                    });
                }
            }

            return {
                side,
                order
            };
        },
        /*
     * @param {Function} [fn]
     */
        load(fn) {
            this.store.loadData(fn);
        },
        /*
     *
     */
        save() {
            this.store.save();
        },
        /*
     *
     */
        onWindowResize() {
            var me = this,
                renderTo = me.renderTo,
                el;

            if (me.panel) {
                renderTo = me.panel.renderTo;
            }

            if (me.responsive) {
                el = F.get(renderTo);
            } else if (me.panel) {
                el = me.panel.el;
            } else {
                el = F.get(renderTo);
            }

            if (el.hasClass(PANEL_CLS) || el.hasClass(GRID_CLS)) {
                el = el.parent();
            }

            let newWidth = el.width();

            if (el.dom === undefined) {
                return;
            }

            if (newWidth === 0) {
                newWidth = el.parent().width();
            }

            if (me.responsive) {
                me.setWidth(newWidth);
            } else if (me.fitWidth) {
                //me.setWidthFit();
            }

            if (me.responsiveHeight) {
                let height = parseInt(el.height());

                if (height === 0) {
                    height = parseInt(el.parent().height());
                }

                me.setHeight(height);
            }

            me.setBodysHeight();
            me.updateColumnsWidth();

            me.scroller.scrollDelta(0);
            me.scroller.update();
        },
        updateColumnsWidth() {
            const me = this;

            const fn = function (columns, header, side) {
                Fancy.each(columns, (column, i) => {
                    if (column.hidden) {
                        return;
                    }

                    if (column.flex) {
                        var cell = header.getCell(i);

                        /*
            me.fire('columnresize', {
              cell: cell.dom,
              width: column.width,
              column: column,
              side: side
            });
            */
                    }
                });
            };

            fn(me.columns, me.header, 'center');
            fn(me.leftColumns, me.leftHeader, 'left');
            fn(me.rightColumns, me.rightHeader, 'right');
        },
        /*
     * @param {Number} width
     */
        setWidth(width) {
            const me = this,
                el = me.el,
                gridBorders = me.gridBorders,
                gridWithoutPanelBorders = me.gridWithoutPanelBorders,
                panelBodyBorders = me.panelBodyBorders,
                body = me.body,
                header = me.header;

            //me.scroller.scroll(0, 0);

            const calcColumnsWidth = (columns) => {
                let width = 0;

                columns.forEach(column => {
                    if (!column.hidden) {
                        width += column.width;
                    }
                })

                return width;
            };

            let leftColumnWidth = calcColumnsWidth(me.leftColumns),
                rightColumnWidth = calcColumnsWidth(me.rightColumns),
                newCenterWidth = width - leftColumnWidth - rightColumnWidth - panelBodyBorders[1] - panelBodyBorders[3],
                gridWidth;

            if (me.wrapped) {
                gridWidth = width;
                newCenterWidth = width - leftColumnWidth - rightColumnWidth;

                newCenterWidth -= gridBorders[1] + gridBorders[3];

                me.css({
                    width: gridWidth
                });
            } else if (me.panel) {
                newCenterWidth = width - leftColumnWidth - rightColumnWidth - panelBodyBorders[1] - panelBodyBorders[3];
                me.panel.el.width(width);

                newCenterWidth -= gridBorders[1] + gridBorders[3];

                gridWidth = width - panelBodyBorders[1] - panelBodyBorders[3];

                me.css({
                    width: gridWidth
                });
            } else {
                newCenterWidth = width - leftColumnWidth - rightColumnWidth - gridWithoutPanelBorders[1] - gridWithoutPanelBorders[3];

                el.css('width', width);
            }

            if (newCenterWidth < 100) {
                newCenterWidth = 100;
            }

            el.select(`.${GRID_CENTER_CLS}`).css('width', newCenterWidth);

            header.css('width', newCenterWidth);
            body.css('width', newCenterWidth);

            if (me.hasFlexColumns) {
                me.reCalcColumnsWidth();
                me.columnresizer.updateColumnsWidth();
            }

            me.scroller.setScrollBars();
            me.fire('changewidth', width);
        },
        /*
     * @return {Number}
     */
        getWidth() {
            let me = this,
                value;

            if (me.panel) {
                value = parseInt(me.panel.css('width'));
            } else {
                value = parseInt(me.css('width'));
            }

            return value;
        },
        /*
     * @return {Number}
     */
        getHeight() {
            let me = this,
                value;

            if (me.panel) {
                value = parseInt(me.panel.css('height'));
            } else {
                value = parseInt(me.css('height'));
            }

            return value;
        },
        /*
     * @param {Number} value
     * @param {Number} changePanelHeight
     */
        setHeight(value, changePanelHeight) {
            const me = this,
                originalHeight = value,
                gridBorders = me.gridBorders,
                panelBodyBorders = me.panelBodyBorders;

            if (me.panel && changePanelHeight !== false) {
                me.panel.setHeight(value);
            }

            if (me.title) {
                value -= me.titleHeight;
            }

            if (me.subTitle) {
                value -= me.subTitleHeight;
            }

            if (me.footer) {
                value -= me.barHeight;
            }

            if (me.bbar && !me.bbarHidden) {
                value -= me.bbarHeight || me.barHeight;
            }

            if (me.tbar && !me.tbarHidden) {
                value -= me.tbarHeight || me.barHeight;
            }

            if (me.subTBar && !me.subTBarHidden) {
                value -= me.subTBarHeight || me.barHeight;
            }

            if (me.buttons && !me.buttonsHidden) {
                value -= me.buttonsHeight || me.barHeight;
            }

            let bodyHeight = value;

            if (me.header) {
                bodyHeight -= me.cellHeaderHeight;
                if (me.groupheader) {
                    bodyHeight -= me.cellHeaderHeight;
                }
            }

            if (me.panel) {
                bodyHeight -= 2;
                //bodyHeight -= panelBodyBorders[0] + panelBodyBorders[2];
                //bodyHeight -= gridBorders[0] + gridBorders[2];
            } else {
                bodyHeight -= gridBorders[0] + gridBorders[2];
            }

            if (me.summary) {
                if (me.summary.el) {
                    bodyHeight -= me.summary.el.dom.clientHeight;
                } else {
                    bodyHeight -= me.cellHeight;
                }
            }

            if (me.body) {
                me.body.css('height', bodyHeight);
            }

            if (me.leftBody) {
                me.leftBody.css('height', bodyHeight);
            }

            if (me.rightBody) {
                me.rightBody.css('height', bodyHeight);
            }

            me.el.css('height', value);
            me.height = value;

            me.scroller.update();
            me.fire('changeheight', originalHeight);
        },
        /*
     * @param {String} key
     * @param {*} value
     * @param {Boolean} complex
     * @return {Array}
     */
        find(key, value, complex) {
            return this.store.find(key, value, complex);
        },
        /*
     * @param {String} key
     * @param {*} value
     * @return {Array}
     */
        findItem(key, value) {
            return this.store.findItem(key, value);
        },
        /*
     * @param {Function} fn
     * @param {Object} scope
     */
        each(fn, scope) {
            this.store.each(fn, scope);
        },
        /*
     *
     */
        onActivate() {
            const me = this,
                doc = F.get(document);

            if (activeGrid && activeGrid.id !== me.id) {
                activeGrid.fire('deactivate');
            }

            setTimeout(() => {
                doc.on('click', me.onDeactivateClick, me);
            }, 100);

            activeGrid = me;
        },
        /*
     *
     */
        onDeActivate() {
            const me = this,
                doc = F.get(document);

            me.activated = false;
            doc.un('click', me.onDeactivateClick, me);

            if (me.selection && me.selection.activeCell) {
                me.selection.clearActiveCell();
            }
        },
        /*
     * @param {Object} e
     */
        onDeactivateClick(e) {
            var me = this,
                i = 0,
                iL = 20,
                parent = F.get(e.target);

            for (; i < iL; i++) {
                if (!parent.dom) {
                    return;
                }

                if (!parent.dom.tagName || parent.dom.tagName.toLocaleLowerCase() === 'body') {
                    me.fire('deactivate');
                    return;
                }

                if (parent.hasCls === undefined) {
                    me.fire('deactivate');
                    return;
                }

                //if (parent.hasCls(me.widgetCls)){
                if (parent.hasCls(GRID_BODY_CLS)) {
                    return;
                }

                parent = parent.parent();
            }
        },
        /*
     * @param {Array} keys
     * @param {Array} values
     */
        search(keys, values) {
            this.searching.search(keys, values);
        },
        /*
     *
     */
        stopSelection() {
            const me = this;

            if (me.selection) {
                me.selection.stopSelection();
            }
        },
        /*
     * @param {Boolean} value
     */
        enableSelection(value) {
            const me = this;

            if (me.selection) {
                me.selection.enableSelection(value);
            }
        },
        /*
     * @param {String|Number} side
     * @param {String|Number} [index]
      @param {Object} [column]
     */
        hideColumn(side, index, column) {
            const me = this;

            if (index === undefined && !F.isArray(index) && !F.isArray(side)) {
                index = side;
                side = this.getSideByColumnIndex(index);

                if (!side) {
                    var info = me.getColumnOrderById(index);

                    if (!info.side) {
                        F.error('Column does not exist');
                    }

                    column = me.getColumnById(index);
                    side = info.side;
                }
            }

            if (index === undefined) {
                index = side;
                side = undefined;
            }

            if (F.isArray(index)) {
                F.each(index, (value) => {
                    if (side) {
                        me.hideColumn(side, value);
                    } else {
                        me.hideColumn(value);
                    }
                });

                return;
            }

            if (column) {
                var info = me.getColumnOrderById(column.id);
                side = info.side;

                if (column.hidden) {
                    return;
                }
            }

            var body = me.getBody(side),
                header = me.getHeader(side),
                columns = me.getColumns(side),
                orderIndex,
                i = 0,
                iL = columns.length,
                centerEl = me.centerEl,
                leftEl = me.leftEl,
                leftHeader = me.leftHeader,
                rightEl = me.rightEl,
                rightHeader = me.rightHeader;

            if (column) {
                orderIndex = info.order;
                column.hidden = true;
            } else if (F.isNumber(index)) {
                column = columns[index];

                if (column.hidden) {
                    return;
                }

                orderIndex = index;
                column.hidden = true;
            } else {
                for (; i < iL; i++) {
                    column = columns[i];

                    if (column.index === index) {
                        if (column.hidden) {
                            return;
                        }

                        orderIndex = i;
                        column.hidden = true;
                        break;
                    }
                }
            }

            header.hideCell(orderIndex);
            body.hideColumn(orderIndex);

            if (me.rowedit) {
                me.rowedit.hideField(orderIndex, side);
            }

            if (me.leftColumns.length || me.rightColumns.length) {
                var leftWidth = me.calcCurrentLeftWidth(),
                    rightWidth = me.calcCurrentRightWidth(),
                    centerWidth = parseInt(me.el.css('width')) - leftWidth - rightWidth;

                if (me.panel) {
                    centerWidth -= me.gridBorders[1] + me.gridBorders[3];
                } else {
                    centerWidth -= me.gridWithoutPanelBorders[1] + me.gridWithoutPanelBorders[3];
                }

                leftEl.animate({width: leftWidth}, ANIMATE_DURATION);
                leftHeader.el.animate({width: leftWidth}, ANIMATE_DURATION);
                centerEl.animate({left: leftWidth}, ANIMATE_DURATION);
                centerEl.animate({width: centerWidth}, ANIMATE_DURATION);
                me.body.el.animate({width: centerWidth}, ANIMATE_DURATION);
                me.header.el.animate({width: centerWidth}, ANIMATE_DURATION);

                rightEl.animate({width: rightWidth}, ANIMATE_DURATION);
                rightHeader.el.animate({width: rightWidth}, ANIMATE_DURATION);

                if (rightWidth === 0) {
                    setTimeout(function () {
                        rightEl.css('display', 'none');
                    }, ANIMATE_DURATION);
                }
            }

            if (me.isGroupable()) {
                me.grouping.updateGroupRows();
            }

            if (side === 'right' || side === 'left') {
                clearInterval(me.intervalScrollUpdate);

                me.intervalScrollUpdate = setTimeout(() => {
                    me.scroller.update();
                    delete me.intervalScrollUpdate;
                }, ANIMATE_DURATION);
            }

            me.onWindowResize();

            me.fire('columnhide', {
                column,
                side,
                orderIndex
            });
        },
        /*
     * @param {String|Number} side
     * @param {String|Number|Array} [index]
     * @param {Object} [column]
     */
        showColumn(side, index, column) {
            const me = this;

            if (index === undefined && !F.isArray(index) && !F.isArray(side)) {
                index = side;
                side = this.getSideByColumnIndex(index);

                if (!side) {
                    var info = me.getColumnOrderById(index);

                    if (!info.side) {
                        F.error(`Column ${index} does not exist`);
                    }

                    column = me.getColumnById(index);
                    side = info.side;
                }
            }

            if (index === undefined) {
                index = side;
                side = undefined;
            }

            if (F.isArray(index)) {
                F.each(index, (value) => {
                    if (side) {
                        me.showColumn(side, value);
                    } else {
                        me.showColumn(value);
                    }
                });

                return;
            }

            if (column) {
                var info = me.getColumnOrderById(column.id);
                side = info.side;

                if (!column.hidden) {
                    return;
                }
            }

            var body = me.getBody(side),
                header = me.getHeader(side),
                columns = me.getColumns(side),
                orderIndex,
                i = 0,
                iL = columns.length,
                centerEl = me.centerEl,
                leftEl = me.leftEl,
                leftHeader = me.leftHeader,
                rightEl = me.rightEl,
                rightHeader = me.rightHeader;

            if (column) {
                orderIndex = info.order;
                column.hidden = false;
            } else if (F.isNumber(index)) {
                column = columns[index];
                if (!column.hidden) {
                    return;
                }

                orderIndex = index;
                column.hidden = false;
            } else {
                for (; i < iL; i++) {
                    column = columns[i];

                    if (column.index === index) {
                        if (!column.hidden) {
                            return;
                        }
                        orderIndex = i;
                        delete column.hidden;
                        break;
                    }
                }
            }

            header.showCell(orderIndex, column.width);
            body.showColumn(orderIndex, column.width);

            if (me.rowedit) {
                me.rowedit.showField(orderIndex, side);
            }

            if (me.leftColumns.length || me.rightColumns.length) {
                var leftWidth = me.calcCurrentLeftWidth(),
                    rightWidth = me.calcCurrentRightWidth(),
                    centerWidth = parseInt(me.el.css('width')) - leftWidth - rightWidth;

                if (me.panel) {
                    centerWidth -= me.gridBorders[1] + me.gridBorders[3];
                } else {
                    centerWidth -= me.gridWithoutPanelBorders[1] + me.gridWithoutPanelBorders[3];
                }

                if (rightEl.css('display') === 'none') {
                    rightEl.show();
                }

                leftEl.animate({width: leftWidth}, ANIMATE_DURATION);
                leftHeader.el.animate({width: leftWidth}, ANIMATE_DURATION);
                centerEl.animate({left: leftWidth}, ANIMATE_DURATION);
                centerEl.animate({width: centerWidth}, ANIMATE_DURATION);
                me.body.el.animate({width: centerWidth}, ANIMATE_DURATION);
                me.header.el.animate({width: centerWidth}, ANIMATE_DURATION);

                rightEl.animate({width: rightWidth}, ANIMATE_DURATION);
                rightHeader.el.animate({width: rightWidth}, ANIMATE_DURATION);
            }

            if (me.isGroupable()) {
                me.grouping.updateGroupRows();
            }

            if (side === 'right' || side === 'left') {
                clearInterval(me.intervalScrollUpdate);

                me.intervalScrollUpdate = setTimeout(() => {
                    me.scroller.update();
                    delete me.intervalScrollUpdate;
                }, ANIMATE_DURATION);
            }

            me.onWindowResize();
            me.fire('columnshow', {
                column,
                side,
                orderIndex
            });
        },
        /*
     * @param {Number|String} indexOrder
     * @param {String} side
     * @return {Object}
     */
        removeColumn(indexOrder, side) {
            var me = this,
                leftEl = me.leftEl,
                leftHeader = me.leftHeader,
                leftBody = me.leftBody,
                centerEl = me.centerEl,
                body = me.body,
                header = me.header,
                rightEl = me.rightEl,
                rightBody = me.rightBody,
                rightHeader = me.rightHeader,
                column;

            if (side === undefined) {
                side = 'center';
            }

            // Column data index
            if (F.isString(indexOrder)) {
                var info = me.getColumnOrderById(indexOrder);

                if (info.side) {
                    indexOrder = info.order;
                    side = info.side;
                } else {
                    var columns = me.getColumns(side);

                    F.each(columns, (column, i) => {
                        if (column.index === indexOrder) {
                            indexOrder = i;
                            return true;
                        }
                    });

                    if (F.isString(indexOrder) && side === 'center') {
                        columns = me.getColumns('left');

                        F.each(columns, (column, i) => {
                            if (column.index === indexOrder) {
                                indexOrder = i;
                                side = 'left';
                                return true;
                            }
                        });

                        if (F.isString(indexOrder)) {
                            columns = me.getColumns('right');

                            F.each(columns, (column, i) => {
                                if (column.index === indexOrder) {
                                    indexOrder = i;
                                    side = 'right';
                                    return true;
                                }
                            });

                            if (F.isString(indexOrder)) {
                                F.error('Column was not found for method removeColumn', 7);
                            }
                        }
                    }
                }
            }
            // Column object
            else if (F.isObject(indexOrder)) {
                var info = me.getColumnOrderById(indexOrder.id);

                column = indexOrder;
                indexOrder = info.order;
                side = info.side;
            }

            switch (side) {
                case 'left':
                    column = me.leftColumns[indexOrder];
                    me.leftColumns.splice(indexOrder, 1);
                    leftHeader.removeCell(indexOrder);
                    leftBody.removeColumn(indexOrder);
                    leftEl.css('width', parseInt(leftEl.css('width')) - column.width);
                    centerEl.css('left', parseInt(centerEl.css('left')) - column.width);
                    centerEl.css('width', parseInt(centerEl.css('width')) + column.width);
                    body.css('width', parseInt(body.css('width')) + column.width);
                    header.css('width', parseInt(header.css('width')) + column.width);

                    if (me.leftColumns.length === 0) {
                        me.leftEl.addCls(Fancy.GRID_LEFT_EMPTY_CLS);
                    }
                    break;
                case 'center':
                    column = me.columns[indexOrder];
                    me.columns.splice(indexOrder, 1);
                    header.removeCell(indexOrder);
                    body.removeColumn(indexOrder);
                    break;
                case 'right':
                    var extraWidth = 0;

                    column = me.rightColumns[indexOrder];
                    me.rightColumns.splice(indexOrder, 1);
                    rightHeader.removeCell(indexOrder);
                    rightBody.removeColumn(indexOrder);
                    rightEl.css('width', parseInt(rightEl.css('width')) - column.width);
                    //rightEl.css('right', parseInt(rightEl.css('right')) - column.width);
                    centerEl.css('width', parseInt(centerEl.css('width')) + column.width);
                    header.css('width', parseInt(header.css('width')) + column.width);

                    if (me.rightColumns.length === 0) {
                        me.rightEl.addCls(Fancy.GRID_RIGHT_EMPTY_CLS);

                        if (F.nojQuery) {
                            extraWidth = 2;
                        }
                    }

                    body.css('width', parseInt(body.css('width')) + column.width - extraWidth);

                    break;
            }

            if (column.grouping) {
                delete column.grouping;
            }

            if (me.summary) {
                me.summary.removeColumn(indexOrder, side);
            }

            me.fire('columnremove');

            clearInterval(me.removeColumnScrollInt);

            me.removeColumnScrollInt = setTimeout(() => {
                delete me.removeColumnScrollInt;
                me.scroller.update();
            }, Fancy.ANIMATE_DURATION);

            if (column.index === column.id) {
                delete me.columnsIdsSeed[column.index];
            } else if (new RegExp(column.index).test(column.id)) {
                if (me.columnsIdsSeed[column.index] === 1) {
                    delete me.columnsIdsSeed[column.index];
                } else {
                    me.columnsIdsSeed[column.index]--;
                }
            }

            return column;
        },
        /*
     * @param {Object} column
     * @param {Number} index
     * @param {String} side
     * @param {String} fromSide
     */
        insertColumn(column, index, side, fromSide) {
            var me = this,
                s = me.store,
                leftEl = me.leftEl,
                leftBody = me.leftBody,
                leftHeader = me.leftHeader,
                centerEl = me.centerEl,
                body = me.body,
                header = me.header,
                rightEl = me.rightEl,
                rightBody = me.rightBody,
                rightHeader = me.rightHeader,
                extraLeft = 0;

            if (column.index) {
                s.addField(column.index);
            }

            side = side || 'center';

            switch (side) {
                case 'center':
                    delete column.rightLocked;
                    delete column.locked;
                    me.columns.splice(index, 0, column);
                    header.insertCell(index, column);
                    body.insertColumn(index, column);
                    break;
                case 'left':
                    column.locked = true;
                    extraLeft = 0;
                    var extraHeaderWidth = 0;
                    var extraWidth = 0;

                    if (me.leftColumns.length === 0) {
                        if (!F.nojQuery) {
                            extraLeft = 1;
                            extraWidth = 2;
                        }
                        me.leftEl.removeCls(GRID_LEFT_EMPTY_CLS);
                    } else {
                        extraWidth = 2;
                    }

                    if (!F.nojQuery) {
                        extraHeaderWidth = 0;
                    }

                    var newWidth = leftEl.dom.clientWidth + column.width + extraWidth;

                    if (newWidth - parseInt(leftEl.css('width')) - column.width < -10) {
                        newWidth = parseInt(leftEl.css('width')) + column.width;
                    }

                    me.leftColumns.splice(index, 0, column);
                    leftHeader.insertCell(index, column);
                    leftHeader.css('width', parseInt(leftHeader.css('width')) + extraHeaderWidth);
                    leftBody.insertColumn(index, column);
                    //leftEl.css('width', leftEl.dom.clientWidth + column.width + extraWidth);
                    //leftEl.css('width', parseInt(leftEl.css('width')) + column.width);
                    leftEl.css('width', newWidth);
                    //leftEl.css('width', parseInt(leftHeader.css('width')));
                    centerEl.css('width', parseInt(centerEl.css('width')) - column.width);
                    centerEl.css('left', parseInt(centerEl.css('left')) + column.width + extraLeft);
                    body.el.css('width', parseInt(body.el.css('width')) - column.width);
                    header.el.css('width', parseInt(header.el.css('width')) - column.width);
                    break;
                case 'right':
                    column.rightLocked = true;

                    var extraWidth = 0;

                    if (me.rightColumns.length === 0) {
                        if (!F.nojQuery) {
                            extraLeft = 1;
                            extraWidth = 2;
                        }
                        me.rightEl.removeCls(GRID_RIGHT_EMPTY_CLS);
                    }

                    me.rightColumns.splice(index, 0, column);
                    rightHeader.insertCell(index, column);
                    rightBody.insertColumn(index, column);
                    rightEl.css('width', parseInt(rightEl.css('width')) + column.width);
                    centerEl.css('width', parseInt(centerEl.css('width')) - column.width - extraLeft);
                    body.css('width', parseInt(body.css('width')) - column.width - extraWidth);
                    header.css('width', parseInt(header.css('width')) - column.width - extraWidth);
                    break;
            }

            if (column.menu) {
                if (column._menu) {
                    column.menu = column._menu;
                } else {
                    var isMenuConfig = true;

                    F.each(column.menu, (item) => {
                        if (F.isString(item)) {
                            return;
                        }

                        if (F.isObject(item) && item._isConfigApplied) {
                            isMenuConfig = false;
                        }
                    });

                    if (!isMenuConfig) {
                        column.menu = true;
                    }
                }
            }

            if (me.isGroupable()) {
                switch (side) {
                    case 'left':
                        if (me.leftColumns.length === 1) {
                            me.grouping.softRenderGroupedRows('left');
                        }
                        break;
                    case 'right':
                        if (me.rightColumns.length === 1) {
                            me.grouping.softRenderGroupedRows('right');
                        }
                        break;
                }

                me.grouping.updateGroupRows();
                me.grouping.setCellsPosition(index, side);
            }

            if (column.rowEditor) {
                if (side === 'left') {
                    index--;
                }

                me.rowedit.moveEditor(column, index, side, fromSide);
            }

            if (me.summary) {
                me.summary.insertColumn(index, side);
            }

            me.header.destroyMenus();
            me.leftHeader.destroyMenus();
            me.rightHeader.destroyMenus();

            if (me.sorter) {
                me.sorter.updateSortedHeader();
            }

            if (me.filter) {
                clearInterval(me.intFilterFieldsUpdate);

                me.intFilterFieldsUpdate = setTimeout(() => {
                    me.filter.updateFields();
                    delete me.intFilterFieldsUpdate;
                }, F.ANIMATE_DURATION);
            }
        },
        /*
     * @param {Object} column
     * @param {String} side
     * @param {Number} orderIndex
     * @param {Boolean} [timeout]
     */
        addColumn(column, side, orderIndex, timeout) {
            const me = this;

            if (timeout === false) {
                me._addColumn(column, side, orderIndex);
                return;
            }

            // Delay is used to prevent running sort on column if it was executed inside of headercellclick event.
            setTimeout(() => {
                me._addColumn(column, side, orderIndex);
            }, 1);
        },
        /*
       * @param {Object} column
       * @param {String} side
       * @param {Number} orderIndex
       */
        _addColumn(column, side = 'center', orderIndex) {
            const me = this;

            if (!column.type) {
                column.type = 'string';
            }

            if (!column.width) {
                column.width = me.defaultColumnWidth;
            }

            if (orderIndex === undefined) {
                const columns = me.getColumns(side);

                orderIndex = columns.length;
            }

            const specialIndexes = {
                $selected: true,
                $order: true,
                $rowdrag: true
            };

            if (column.id === undefined) {
                if (column.index && !specialIndexes[column.index]) {
                    column.id = me.getColumnId(column.index);
                } else {
                    column.id = Fancy.id(null, 'col-id-');
                }
            }

            if (me.defaults) {
                F.applyIf(column, me.defaults);
            }

            me.insertColumn(column, orderIndex, side);

            me.scroller.update();

            me.fire('columnadd');
        },
        /*
     * @param {Number} orderIndex
     * @param {String} legend
     */
        disableLegend(orderIndex, legend) {
            const me = this;

            me.columns[orderIndex].disabled = me.columns[orderIndex].disabled || {};
            me.columns[orderIndex].disabled[legend] = true;

            //me.body.updateRows(undefined, orderIndex);
            me.update();
        },
        /*
     * @param {Number} orderIndex
     * @param {String} legend
     */
        enableLegend(orderIndex, legend) {
            const me = this;

            me.columns[orderIndex].disabled = me.columns[orderIndex].disabled || {};
            delete me.columns[orderIndex].disabled[legend];

            //me.body.updateRows(undefined, orderIndex);
            me.update();
        },
        /*
     *
     */
        fitHeight() {
            var me = this,
                s = me.store,
                panelBodyBorders = me.panelBodyBorders,
                gridBorders = me.gridBorders,
                height = s.getLength() * me.cellHeight,
                headerRows = 1,
                columns = me.columns.concat(me.leftColumns || []).concat(me.rightColumns || []);

            Fancy.each(columns, (column) => {
                if (column.grouping) {
                    if (headerRows < 2) {
                        headerRows = 2;
                    }

                    if (column.filter && column.filter.header) {
                        if (headerRows < 3) {
                            headerRows = 3;
                        }
                    }
                }

                if (column.filter && column.filter.header) {
                    if (headerRows < 2) {
                        headerRows = 2;
                    }
                }
            });

            if (me.getCenterFullWidth() > me.getCenterViewWidth() && !me.nativeScroller && !Fancy.isIE) {
                height += me.bottomScrollHeight;
            }

            if (me.title) {
                height += me.titleHeight;
            }

            if (me.tbar) {
                height += me.tbarHeight || me.barHeight;
            }

            if (me.summary) {
                height += me.cellHeight;
            }

            if (me.bbar) {
                height += me.bbarHeight || me.barHeight;
            }

            if (me.buttons) {
                height += me.buttonsHeight || me.barHeight;
            }

            if (me.subTBar) {
                height += me.subTBarHeight || me.barHeight;
            }

            if (me.footer) {
                height += me.barHeight;
            }

            if (me.header !== false) {
                height += me.cellHeaderHeight * headerRows;
            }

            if (me.isGroupable()) {
                height += me.grouping.groups.length * me.groupRowHeight;
            }

            if (me.panel) {
                height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
            } else {
                height += gridBorders[0] + gridBorders[2];
            }

            me.setHeight(height);
        },
        /*
     * @param {String} index
     * @param {Mixed} value
     * @param {String} sign
     * @param {Boolean} [updateHeaderFilter]
     */
        addFilter(index, value, sign, updateHeaderFilter) {
            var me = this,
                filter = me.store.filters[index],
                update = me.waitingForFilters === false;

            if (F.isFunction(value)) {
                sign = 'fn';
            }

            sign = sign || '';

            if (filter === undefined) {
                filter = {};
            }

            if (F.isDate(value)) {
                const format = this.getColumnByIndex(index).format;

                filter['type'] = 'date';
                filter['format'] = format;
                value = Number(value);
            }

            filter[sign] = value;

            me.store.filters[index] = filter;

            if (update) {
                clearInterval(me.intervalUpdatingFilter);

                me.intervalUpdatingFilter = setTimeout(() => {
                    if (me.WAIT_FOR_STATE_TO_LOAD) {
                        me.filter.updateStoreFilters(false);
                    } else {
                        me.filter.updateStoreFilters();
                    }

                    delete me.intervalUpdatingFilter;
                }, 1);
            }

            if (updateHeaderFilter !== false) {
                me.filter.addValuesInColumnFields(index, value, sign);
            } else if (me.searching) {
                //Not needed
                //Stay code for a while
                //me.searching.setValueInField(value);
            }
        },
        /*
     * @param {String|Boolean} [index]
     * @param {String} [sign]
     * @param {Boolean} [updateHeaderField]
     */
        clearFilter(index, sign, updateHeaderField) {
            const me = this,
                s = me.store,
                update = me.waitingForFilters === false;

            if (me.isRequiredChangeAllMemorySelection()) {
                me.selection.memory.selectAllFiltered();
                setTimeout(() => {
                    me.selection.updateHeaderCheckBox();
                }, 1);
            }

            if (index === undefined || index === null) {
                s.filters = {};
            } else if (sign === undefined || sign === null) {
                if (s.filters && s.filters[index]) {
                    //s.filters[index] = {};
                    delete s.filters[index];
                }
            } else {
                if (me.filter && s.filters && s.filters[index] && s.filters[index][sign] !== undefined) {
                    delete s.filters[index][sign];

                    if (F.Object.isEmpty(s.filters[index])) {
                        delete s.filters[index];
                    }
                }
            }

            if (F.Object.isEmpty(s.filter)) {
                delete s.filteredData;
                delete s.filterOrder;
                delete s.filteredDataMap;
            }

            if (me.searching && index === undefined && sign === undefined) {
                //if(me.searching){
                //me.searching.clear();
                me.searching.clearBarField();
                me.search('');

                if (me.expander) {
                    me.expander.reSet();
                }
            }

            if (update) {
                clearInterval(me.intervalUpdatingFilter);

                me.intervalUpdatingFilter = setTimeout(() => {
                    if (s.remoteFilter) {
                        s.once('serversuccess', () => {
                            me.fire('filter', s.filters);

                            delete me.intervalUpdatingFilter;
                        });
                        s.serverFilter();

                        return;
                    }

                    if (s.grouping && s.grouping.by) {
                        const grouping = me.grouping;

                        if (s.isFiltered()) {
                            //s.filterData();
                            s.changeDataView();
                            grouping.initGroups('filteredData');
                        } else {
                            grouping.initGroups();
                        }

                        grouping.reFreshExpanded();
                        grouping.initOrder();
                        s.changeDataView();
                        /*
            s.changeDataView({
              stoppedFilter: true
            });
            */


                        grouping.updateGroupRows();
                        grouping.setCellsPosition();
                        grouping.setPositions();
                        grouping.reFreshGroupTexts();

                        grouping.update();
                    } else {
                        s.changeDataView();
                    }

                    if (s.grouping && s.grouping.by) {
                    } else {
                        me.update();
                    }
                    me.setSidesHeight();

                    delete me.intervalUpdatingFilter;
                }, 100);
            }

            if (me.filter && updateHeaderField !== false) {
                me.filter.clearColumnsFields(index, sign);
            }

            if (update) {
                me.fire('filter', s.filters);

                me.setSidesHeight();
            }
        },
        /*
    *
    */
        isRequiredChangeAllMemorySelection() {
            const me = this,
                s = me.store,
                selection = me.selection;

            return s.hasFilters() && selection && selection.memory && selection.memory.all;
        },
        /*
     *
     */
        updateFilters() {
            const me = this;

            delete me.waitingForFilters;
            me.filter.updateStoreFilters();
        },
        /*
     *
     */
        updateFilter() {
            this.updateFilters();
        },
        /*
     * @param {String} text
     */
        showLoadMask(text) {
            this.loadmask.show(text);
        },
        /*
     *
     */
        clearSorter() {
            if (this.sorter) {
                this.sorter.clearSort();
            }
        },
        /*
     *
     */
        hideLoadMask() {
            this.loadmask.hide();
        },
        /*
     *
     */
        prevPage() {
            this.paging.prevPage();
        },
        /*
     *
     */
        nextPage() {
            this.paging.nextPage();
        },
        /*
     * @param {Number} value
     * @param {Boolean} [update]
     */
        setPage(value, update) {
            value--;
            if (value < 0) {
                value = 0;
            }

            this.paging.setPage(value, update);
        },
        /*
     *
     */
        firstPage() {
            this.paging.firstPage();
        },
        /*
     *
     */
        lastPage() {
            this.paging.lastPage();
        },
        /*
     * @param {Number} value
     */
        setPageSize(value) {
            this.paging.setPageSize(value);
        },
        /*
     * @return {Number}
     */
        getPage() {
            return this.store.showPage + 1;
        },
        /*
     * @return {Number}
     */
        getPages() {
            return this.store.pages;
        },
        /*
     * @return {Number}
     */
        getPageSize() {
            return this.store.pageSize;
        },
        /*
     *
     */
        refresh() {
            this.paging.refresh();
        },
        /*
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [animate]
     */
        scroll(x, y, animate) {
            const me = this,
                scroller = me.scroller;

            if (y !== undefined && y > 0) {
                y = -y;
            }

            const scrollHeight = scroller.getScrollHeight();

            if (x > scrollHeight) {
                x = scrollHeight;
                if (me.nativeScroller && scroller.isRightScrollable()) {
                    x += 17;
                }
            }

            const scrollWidth = scroller.getScrollWidth();

            if (Math.abs(y) > scrollWidth) {
                y = -scrollWidth;
            }

            if (scroller.isBottomScrollable() === false) {
                y = 0;
            } else {
                if (me.nativeScroller && scroller.isRightScrollable()) {
                    y -= 17;
                }
            }

            scroller.scroll(x, y, animate);

            scroller.scrollBottomKnob();
            scroller.scrollRightKnob();
        },
        /*
     * @return {Array}
     */
        getDataFiltered() {
            return this.store.filteredData;
        },
        /*
     *
     */
        reCalcColumnsWidth() {
            const me = this;

            if (!me.hasFlexColumns) {
                return;
            }

            var scroller = me.scroller,
                viewWidth = me.getCenterViewWidth(),
                columns = me.columns,
                flex = 0,
                i = 0,
                iL = columns.length,
                widthForFlex = viewWidth,
                flexPerCent,
                column;

            if (me.flexScrollSensitive !== false && scroller.isRightScrollable() && !scroller.nativeScroller) {
                widthForFlex -= me.bottomScrollHeight;
            }

            for (; i < iL; i++) {
                column = columns[i];

                if (column.hidden) {
                    continue;
                }

                if (column.flex) {
                    flex += column.flex;
                } else {
                    widthForFlex -= column.width;
                }
            }

            if (flex === 0) {
                return;
            }

            flexPerCent = widthForFlex / flex;

            i = 0;
            for (; i < iL; i++) {
                column = columns[i];

                if (column.hidden) {
                    continue;
                }

                if (column.flex) {
                    column.width = Math.floor(column.flex * flexPerCent);

                    if (column.minWidth && column.width < column.minWidth) {
                        column.width = column.minWidth;
                    }

                    if (column.minWidth && column.width < column.minWidth) {
                        column.width = column.minWidth;
                    } else if (column.width < me.minColumnWidth) {
                        column.width = me.minColumnWidth;
                    }
                }
            }
        },
        /*
     * @param {Boolean} [all]
     * @param {Boolean} [ignoreRender]
     * @param {Array} [rowIds]
     * @param {Boolean} [exporting]
     * @param {Boolean} [selection]
     * @return {Array}
     */
        getDisplayedData(all, ignoreRender, rowIds, exporting, selection) {
            var me = this,
                viewTotal = me.getViewTotal(),
                data = [],
                i = 0,
                leftColumns = me.leftColumns,
                columns = me.columns,
                rightColumns = me.rightColumns,
                allowedIdsMap = {};

            if (selection) {
                selection = this.getSelection();
            }

            if (rowIds) {
                F.each(rowIds, value => {
                    allowedIdsMap[value] = true;
                });
            }

            if (all) {
                viewTotal = me.getTotal();
            }

            const fn = function (column) {
                if (column.index === undefined || column.index === '$selected' || column.hidden) {
                    return;
                }

                if (exporting && column.exportable === false) {
                    return;
                }

                if (/spark/.test(column.type)) {
                    return false;
                }

                switch (column.type) {
                    case 'select':
                    case 'action':
                    case 'expand':
                    case 'grossloss':
                    case 'hbar':
                    case 'rowdrag':
                        break;
                    case 'order':
                        rowData.push(i + 1);
                        break;
                    default:
                        if (selection) {
                            var data = selection[i],
                                value = data[column.index];
                        } else {
                            var data = me.get(i),
                                value = me.get(i, column.index);
                        }

                        if (column.exportFn && exporting) {
                            if (data && data.data) {
                                data = data.data;
                            }

                            rowData.push(column.exportFn({
                                value: value,
                                data: data
                            }).value);
                        } else if (column.render && ignoreRender !== true) {
                            if (data && data.data) {
                                data = data.data;
                            }

                            value = column.render({
                                value: value,
                                data: data
                            }).value.replace(/<\/?[^>]+(>|$)/g, '');

                            rowData.push(value);
                        } else {
                            if (selection) {
                                rowData.push(value);
                            } else {
                                rowData.push(me.get(i, column.index));
                            }
                        }
                }
            };

            if (selection) {
                i = 0;
                viewTotal = selection.length;
            }

            for (; i < viewTotal; i++) {
                var rowData = [];

                if (rowIds) {
                    var item = me.get(i);

                    if (!item || !allowedIdsMap[item.id]) {
                        continue;
                    }
                }

                F.each(leftColumns, fn);
                F.each(columns, fn);
                F.each(rightColumns, fn);

                data.push(rowData);
            }

            return data;
        },
        /*
     * @return {Array}
     */
        getAllDisplayedData() {
            var me = this,
                viewTotal = me.getViewTotal(),
                data = [],
                i = 0,
                leftColumns = me.leftColumns,
                columns = me.columns,
                rightColumns = me.rightColumns;

            const fn = function (column) {
                if (column.index === undefined || column.index === '$selected' || column.hidden) {
                    return;
                }

                switch (column.type) {
                    case 'order':
                        rowData.push(i + 1);
                        break;
                    default:
                        if (column.render) {
                            var data = me.get(i),
                                value = me.get(i, column.index);

                            rowData.push(column.render({
                                value: value,
                                data: data
                            }).value);
                        } else {
                            rowData.push(me.get(i, column.index));
                        }
                }
            };

            for (; i < viewTotal; i++) {
                var rowData = [];

                F.each(leftColumns, fn);
                F.each(columns, fn);
                F.each(rightColumns, fn);

                data.push(rowData);
            }

            return data;
        },
        /*
     * @param {Array} data
     */
        setData(data) {
            const me = this,
                s = me.store;

            //me.clearSelection();

            if (s.isTree) {
                s.initTreeData(data);
            } else {
                s.setData(data);
            }

            if (me.isGroupable()) {
                s.orderDataByGroup();
            }

            if (s.sorters) {
                s.reSort();
            }

            if (s.filterOrder) {
                me.filter.updateStoreFilters(false);
            }

            s.clearDirty();

            if (s.sorters || s.filterOrder) {
                s.changeDataView({
                    doNotFired: true
                });
            }

            //Not sure that it is needed.
            //Without method update, grid won't be updated.
            me.setSidesHeight();

            if (me.filter && me.filter.waitForComboData) {
                me.filter.updateFilterComboData();
            }

            if (me.isGroupable()) {
                me.grouping.reGroup();
                me.update();
            }
        },
        /*
     * @params {Object} [o]
     */
        exportToExcel(o) {
            const me = this;

            if (me.exporter) {
                me.exporter.exportToExcel(o);
            }
        },
        /*
     * @params {Object} [o]
     */
        getDataAsCsv(o) {
            const me = this;

            if (me.exporter) {
                return me.exporter.getDataAsCsv(o);
            }
        },
        /*
     * @params {Object} o
     */
        getDataAsCSV(o) {
            return this.getDataAsCsv(o);
        },
        /*
     * @params {Object} [o]
     */
        exportToCSV(o) {
            const me = this;

            if (me.exporter) {
                return me.exporter.exportToCSV(o);
            }
        },
        /*
     * @params {Object} o
     */
        exportToCsv(o) {
            return this.exportToCSV(o);
        },
        /*
     *
     */
        disableSelection() {
            this.selection.disableSelection();
        },
        /*
     * @param {Object} o
     */
        setParams(o) {
            const me = this,
                s = me.store;

            if (s.proxy) {
                s.proxy.params = s.proxy.params || {};

                F.apply(s.proxy.params, o);
            }
        },
        /*
     * @param {String|Object} url
     */
        setUrl(url) {
            const me = this,
                s = me.store;

            if (F.isString(url)) {
                if (s.proxy && s.proxy.api) {
                    if (s.proxy.type === 'rest') {
                        for (var p in s.proxy.api) {
                            s.proxy.api[p] = url;
                        }
                    } else {
                        s.proxy.api.read = url;
                    }
                }
            } else {
                if (s.proxy && s.proxy.api) {
                    F.apply(s.proxy.api, url);
                }
            }
        },
        /*
     * @param {Object} cell
     * @return {String}
     */
        getSideByCell(cell) {
            var me = this,
                side;

            if (me.centerEl.within(cell)) {
                side = 'center';
            } else if (me.leftEl.within(cell)) {
                side = 'left';
            } else if (me.rightEl.within(cell)) {
                side = 'right';
            }

            return side;
        },
        /*
     * @param {String} side
     * @return {String}
     */
        getSideEl(side) {
            const me = this;

            switch (side) {
                case 'left':
                    return me.leftEl;
                case 'center':
                    return me.centerEl;
                case 'right':
                    return me.rightEl;
            }
        },
        /*
     * @param {Fancy.Model|id|Object} item
     * @param {Object} o
     *
     * Used for tree grid
     */
        addChild(item, o) {
            const me = this,
                s = me.store;

            if (o === undefined) {
                item.$deep = 1;
                if (item.child === undefined) {
                    item.child = [];
                }

                me.add(item);
            } else {
                if (F.isNumber(item)) {
                    item = me.getById(item);
                }

                var fixParent = false;

                if (item.get('leaf') === true) {
                    item.set('leaf', false);
                    item.set('expanded', true);
                    item.set('child', []);

                    fixParent = true;
                }

                const $deep = item.get('$deep'),
                    child = item.get('child'),
                    rowIndex = me.getRowById(item.id) + child.length + 1;

                o.$deep = $deep + 1;
                o.parentId = item.id;

                if (fixParent) {
                    const parentId = item.get('parentId');
                    if (parentId) {
                        const parentItem = me.getById(parentId);

                        F.each(parentItem.data.child, (child) => {
                            if (child.id === item.id) {
                                child.leaf = false;
                                child.expanded = true;
                                child.child = [o];

                                return true;
                            }
                        });
                    }
                }

                child.push(new s.model(o));
                item.set('child', child);

                if (item.get('expanded') === true) {
                    me.insert(rowIndex, o);
                }
            }
        },
        /*
     * @param {Number|String|Object} id
     * @param {Boolean} toggle
     */
        expand(id, toggle) {
            var item,
                me = this;

            switch (F.typeOf(id)) {
                case 'number':
                case 'string':
                    item = me.getById(id);
                    break;
            }

            if (!item) {
                return;
            }

            if (item.get('expanded') === true) {
                //for tree only
                if (toggle) {
                    this.collapse(id);
                }
                return;
            }

            if (me.tree) {
                me.tree.expandRow(item);
            }

            if (me.expander) {
                if (toggle && this.expander._expandedIds[id]) {
                    this.collapse(id);
                    return;
                }

                var rowIndex = me.getRowById(id);
                me.expander.expand(rowIndex);
            }
        },
        /*
     * @param {Number|String|Object} id
     */
        toggleExpand(id) {
            this.expand(id, true);
        },
        /*
     * @param {Number|String|Object} id
     * @param {Boolean} toggle
     */
        collapse(id, toggle) {
            var item,
                me = this;

            switch (F.typeOf(id)) {
                case 'number':
                case 'string':
                    item = me.getById(id);
                    break;
            }

            if (item.get('expanded') === false) {
                //for tree only
                if (toggle) {
                    this.expand(id);
                }
                return;
            }

            if (me.tree) {
                me.tree.collapseRow(item);
            }

            if (me.expander) {
                var isCollapsed = !this.expander._expandedIds[id];

                if (!isCollapsed && this.expander._expandedIds[id].hidden) {
                    isCollapsed = true;
                }

                if (toggle && isCollapsed) {
                    this.expand(id);
                    return;
                }

                var rowIndex = me.getRowById(id);
                me.expander.collapse(rowIndex);
            }
        },
        /*
     * @param {Number} id
     */
        toggleCollapse(id) {
            this.collapse(id, true);
        },
        /*
     *
     */
        collapseAll() {
            const me = this;

            if (me.tree) {
                const items = me.findItem('$deep', 1);

                F.each(items, (item) => {
                    me.collapse(item.id);
                });
            } else if (me.expander) {
                me.expander.collapseAll();
            }
        },
        /*
     *
     */
        expandAll() {
            let me = this,
                items = me.findItem('expanded', false);

            F.each(items, (item) => {
                me.expand(item.id);
            });

            items = me.findItem('expanded', false);

            if (items.length) {
                me.expandAll();
            }
        },
        /*
     * @param {Boolean} copyHeader
     */
        copy(copyHeader) {
            const me = this;

            if (me.selection) {
                me.selection.copy(copyHeader);
            }
        },
        /*
     * @param {String} key
     * @param {'ASC'|'DESC'} direction
     * @param {Boolean} [update]
     */
        sort(key, direction, update) {
            var me = this,
                column = me.getColumnByIndex(key),
                o = me.getColumnOrderByKey(key),
                header,
                cell;

            if (update === undefined) {
                update = true;
            }

            if (!o.side) {
                return;
            }

            header = me.getHeader(o.side);
            cell = header.getCell(o.order);

            if (!direction) {
                cell.dom.click();
            } else {
                direction = direction || 'ASC';
                cell = header.getCell(o.order);

                direction = direction.toLocaleLowerCase();

                switch (direction) {
                    case 'asc':
                        cell.removeCls(GRID_COLUMN_SORT_DESC_CLS);
                        cell.addCls(GRID_COLUMN_SORT_ASC_CLS);
                        break;
                    case 'desc':
                        cell.removeCls(GRID_COLUMN_SORT_ASC_CLS);
                        cell.addCls(GRID_COLUMN_SORT_DESC_CLS);
                        break;
                    case 'drop':
                        cell.removeCls(GRID_COLUMN_SORT_ASC_CLS);
                        cell.removeCls(GRID_COLUMN_SORT_DESC_CLS);
                        break;
                    default:
                        F.error('sorting type is not right - ' + direction);
                }

                me.sorter.sort(direction, key, o.side, column, cell, update);
            }
        },
        /*
     * @param {Number} rowIndex
     */
        flashRow(rowIndex) {
            const me = this,
                cells = me.getDomRow(rowIndex);

            cells.forEach(cell => {
                cell = F.get(cell);
                cell.addCls('fancy-grid-cell-flash');
            });

            setTimeout(() => {
                cells.forEach(cell => {
                    cell = F.get(cell);
                    cell.addCls('fancy-grid-cell-animation');
                });
            }, 200);

            setTimeout(() => {
                cells.forEach(cell => {
                    cell = F.get(cell);

                    cell.removeCls('fancy-grid-cell-flash');
                    cell.removeCls('fancy-grid-cell-animation');
                });
            }, 700);
        },
        /*
     * @param {Number|Object} rowIndex
     * @param {Number} [columnIndex]
     * @param {String} [side]
     * @param {Object} [o]
     */
        flashCell(rowIndex, columnIndex, side = 'center', o) {
            var me = this,
                body = me.getBody(side),
                duration = 700,
                cell = Fancy.isObject(rowIndex) ? rowIndex : body.getCell(rowIndex, columnIndex);

            if (o) {
                if (o.duration) {
                    duration = o.duration;
                }

                switch (o.type) {
                    case 'plusminus':
                        if (o.delta > 0) {
                            cell.addCls('fancy-grid-cell-flash-plus');
                            setTimeout(() => {
                                cell.removeCls('fancy-grid-cell-flash-plus');
                                cell.removeCls('fancy-grid-cell-animation');
                            }, duration);
                        } else {
                            cell.addCls('fancy-grid-cell-flash-minus');
                            setTimeout(() => {
                                cell.removeCls('fancy-grid-cell-flash-minus');
                                cell.removeCls('fancy-grid-cell-animation');
                            }, duration);
                        }
                        break;
                }
            } else {
                cell.addCls('fancy-grid-cell-flash');

                setTimeout(() => {
                    cell.removeCls('fancy-grid-cell-flash');
                    cell.removeCls('fancy-grid-cell-animation');
                }, 700);
            }

            setTimeout(() => {
                cell.addCls('fancy-grid-cell-animation');
            }, 200);
        },
        /*
    * @param {Number} rowIndex
     */
        scrollToRow(rowIndex) {
            const me = this,
                cell = me.body.getCell(rowIndex, 0);

            me.scroller.scrollToCell(cell.dom, false, true);
            me.scroller.update();

            me.flashRow(rowIndex);
        },
        /*
     * @return {Object}
     */
        getStateSorters() {
            const me = this,
                o = {},
                state = JSON.parse(localStorage.getItem(me.getStateName()));

            if (!state) {
                return;
            }

            if (!state.sorters) {
                return {};
            }

            const sorted = JSON.parse(state.sorters);

            F.each(sorted, sorter => {
                o[sorter.key] = sorter;
            });

            return o;
        },
        /*
     *
     */
        getStateName() {
            const me = this,
                id = me.id,
                url = location.host + '-' + location.pathname;

            if (me.stateId) {
                return me.stateId;
            }

            return id + '-' + url;
        },
        /*
     *
     */
        setWidthFit() {
            var me = this,
                panelBodyBorders = me.panelBodyBorders,
                gridWithoutPanelBorders = me.gridWithoutPanelBorders,
                gridBorders = me.gridBorders,
                width = 0,
                hasLocked = false,
                columns = [].concat(me.leftColumns).concat(me.columns).concat(me.rightColumns);

            Fancy.each(columns, (column) => {
                if (!column.hidden) {
                    width += column.width;
                }

                if (column.locked) {
                    hasLocked = true;
                }
            });

            if (me.panel) {
                width += panelBodyBorders[1] + panelBodyBorders[3] + gridBorders[1] + gridBorders[3];
            } else {
                width += gridWithoutPanelBorders[1] + gridWithoutPanelBorders[3] + gridBorders[1] + gridBorders[3];
            }

            if (hasLocked) {
                width--;
            }

            me.setWidth(width);
        },
        /*
     * @param {Number|String} index
     * @param {String} value
     * @param {String} [side]
     */
        setColumnTitle(index, value, side = 'center') {
            var me = this,
                header = me.getHeader(side),
                cell,
                column,
                columns = header.getColumns();

            if (Fancy.isString(index)) {
                index = me.getColumnOrderByKey(index).order;
            }

            column = columns[index];
            column.title = value;

            cell = header.getCell(index);
            cell.select(`.${Fancy.GRID_HEADER_CELL_TEXT_CLS}`).item(0).update(value);

            me.fire('columntitlechange', {
                orderIndex: index,
                index: column.index,
                value,
                side
            });
        },
        /*
     *
     */
        clearDirty() {
            const me = this;

            me.store.clearDirty();
            me.body.clearDirty();
            me.leftBody.clearDirty();
            me.rightBody.clearDirty();
        },
        /*
     * @return {Boolean}
     */
        isDirty() {
            return this.store.isDirty();
        },
        /*
     * @param {String} bar
     */
        hideBar(bar) {
            var me = this,
                barCls,
                barEl,
                barHeight = me.barHeight;

            switch (bar) {
                case 'tbar':
                    barCls = PANEL_TBAR_CLS;
                    me.tbarHidden = true;
                    if (me.tbarHeight) {
                        barHeight = me.tbarHeight;
                    }
                    break;
                case 'subtbar':
                    barCls = PANEL_SUB_TBAR_CLS;
                    me.subTBarHidden = true;
                    if (me.subTBarHeight) {
                        barHeight = me.subTBarHeight;
                    }
                    break;
                case 'bbar':
                    barCls = PANEL_BBAR_CLS;
                    me.bbarHidden = true;
                    if (me.bbarHeight) {
                        barHeight = me.bbarHeight;
                    }
                    break;
                case 'buttons':
                    barCls = PANEL_BUTTONS_CLS;
                    me.buttonsHidden = true;
                    if (me.buttonsHeight) {
                        barHeight = me.buttonsHeight;
                    }
                    break;
                default:
                    F.error('Bar does not exist');
            }

            barEl = me.panel.el.select(`.${barCls}`);

            if (barEl.css('display') !== 'none') {
                barEl.hide();

                const panelHeight = parseInt(me.panel.el.css('height'));
                //me.panel.el.css('height', panelHeight - barHeight);
                me.setHeight(panelHeight);
            }
        },
        /*
     * @param {String} bar
     */
        showBar(bar) {
            var me = this,
                barCls,
                barEl,
                barHeight = me.barHeight;

            switch (bar) {
                case 'tbar':
                    barCls = PANEL_TBAR_CLS;
                    delete me.tbarHidden;
                    if (me.tbarHeight) {
                        barHeight = me.tbarHeight;
                    }
                    break;
                case 'subtbar':
                    barCls = PANEL_SUB_TBAR_CLS;
                    delete me.subTBarHidden;
                    if (me.subTBarHeight) {
                        barHeight = me.subTBarHeight;
                    }
                    break;
                case 'bbar':
                    barCls = PANEL_BBAR_CLS;
                    delete me.bbarHidden;
                    if (me.bbarHeight) {
                        barHeight = me.bbarHeight;
                    }
                    break;
                case 'buttons':
                    barCls = PANEL_BUTTONS_CLS;
                    delete me.buttonsHidden;
                    if (me.buttonsHeight) {
                        barHeight = me.buttonsHeight;
                    }
                    break;
                default:
                    F.error('Bar does not exist');
            }

            barEl = me.panel.el.select(`.${barCls}`);

            if (barEl.css('display') == 'none') {
                barEl.show();

                const panelHeight = parseInt(me.panel.el.css('height'));
                //me.panel.el.css('height', panelHeight + barHeight);
                me.setHeight(panelHeight);
            }
        },
        /*
     *
     */
        initResponsiveness() {
            const me = this;

            const onWindowResize = function () {
                me.onWindowResize();

                clearInterval(me.intWindowResize);

                me.intWindowResize = setTimeout(() => {
                    me.onWindowResize();
                    delete me.intWindowResize;

                    //Bug fix for Mac
                    setTimeout(() => {
                        me.onWindowResize();
                    }, 300);
                }, 30);
            };

            if ('ResizeObserver' in window) {
                setTimeout(() => {
                    var myObserver;
                    if (me.nativeResizeObserver) {
                        myObserver = new ResizeObserver(onWindowResize);
                    } else {
                        myObserver = new F.ResizeObserver(onWindowResize);
                        me.responsiveOverver = myObserver;
                    }

                    var dom;

                    if (me.panel) {
                        dom = me.panel.el.parent().dom;
                    } else {
                        dom = me.el.parent().dom;
                    }

                    if (!dom) {
                        return;
                    }

                    myObserver.observe(dom);
                }, 100);
                F.$(window).bind('resize', onWindowResize);
            } else {
                setTimeout(() => {
                    const myObserver = new F.ResizeObserver(onWindowResize),
                        dom = me.el.parent().dom;

                    if (!dom) {
                        return;
                    }

                    me.responsiveOverver = myObserver;
                    myObserver.observe(dom);
                }, 100);
                F.$(window).bind('resize', onWindowResize);
            }
        },
        /*
     * @return {Number}
     */
        getNumOfVisibleCells() {
            const me = this;

            if (!me.numOfVisibleCells) {
                try {
                    me.numOfVisibleCells = Math.ceil(me.getBodyHeight() / me.cellHeaderHeight);
                } catch (e) {
                    me.numOfVisibleCells = 0;
                }
            }

            return me.numOfVisibleCells;
        },
        /*
     * @params {String} index
     * @return {'center'|'left'|'right'}
     */
        getSideByColumnIndex(index) {
            var me = this,
                side;

            F.each(me.columns, (column) => {
                if (column.index === index) {
                    side = 'center';
                }
            });

            F.each(me.leftColumns, (column) => {
                if (column.index === index) {
                    side = 'left';
                }
            });

            F.each(me.rightColumns, (column) => {
                if (column.index === index) {
                    side = 'right';
                }
            });

            return side;
        },
        /*
     * @param {Array|Number|String} index
     * @param {Number} width
     * @param {'center'|'left'|'right'} [side]
     */
        setColumnWidth(index, width, side = 'center') {
            const me = this;

            if (F.isArray(index)) {
                F.each(index, (item) => {
                    me.setColumnWidth(item.index, item.width, item.side);
                });
            } else {
                const columns = me.getColumns(side);

                if (F.isNumber(index)) {
                    columns[index].width = width;
                } else {
                    me.getColumnByIndex(index).width = width;
                }
            }

            clearInterval(me.intervalUpdateColumnsWidth);

            me.intervalUpdateColumnsWidth = setTimeout(() => {
                if (me.columnresizer) {
                    me.columnresizer.updateColumnsWidth('all');
                    delete this.intervalUpdateColumnsWidth;
                    setTimeout(() => {
                        me.scroller.update();
                    }, Fancy.ANIMATE_DURATION);
                }
            }, 100);
        },
        /*
     * @return {Boolean}
     */
        isLoading() {
            return this.store.loading;
        },
        /*
     * @return {Object}
     */
        getChanges() {
            const me = this,
                s = me.store,
                changes = {};

            changes.changed = s.changed;
            changes.removed = s.removed;
            changes.inserted = s.inserted;

            return changes;
        },
        /*
     * @param {String} index
     * @param {String|Boolean} [side]
     * @param {Object} [column]
     */
        autoSizeColumn(index, side, column) {
            var me = this,
                info;

            if (F.isBoolean(side)) {
                info = me.getColumnOrderById(index);
                side = info.side;
            } else {
                info = me.getColumnOrderByKey(index);
                if (!info || info.order === undefined) {
                    info = me.getColumnOrderById(index);
                    side = info.side;
                }
            }

            if (!info || info.order === undefined) {
                F.error('Column index was not found');
                return;
            }

            side = side || info.side;

            var body = me.getBody(side),
                columnEl = F.get(body.getDomColumn(info.order)),
                width = columnEl.css('width'),
                offsetWidth;

            // Bug case
            // When modules are in progress of loading, width can be calculated wrong.
            // It requires to do another way of calculation column width
            //if(width > 300 && !Fancy.stylesLoaded){
            if (width > 500) {
                width = 100;
            }

            columnEl.css('width', '');
            offsetWidth = columnEl.dom.offsetWidth + 2;

            if (column && (column.maxWidth && column.maxWidth < offsetWidth)) {
                offsetWidth = column.maxWidth;
            } else if (column && (column.minWidth && column.minWidth > offsetWidth)) {
                offsetWidth = column.minWidth;
            } else if (column && (column.maxAutoWidth && column.maxAutoWidth < offsetWidth)) {
                offsetWidth = column.maxAutoWidth;
            }

            columnEl.css('width', width);

            if (me.header) {
                const headerCell = me.getHeaderCell(info.order, side);
                width = headerCell.css('width');

                headerCell.css('width', '');
                const headerCellOffset = headerCell.dom.offsetWidth + 25;
                headerCell.css('width', width);

                if (headerCellOffset > offsetWidth) {
                    offsetWidth = headerCellOffset;
                }
            }

            me.setColumnWidth(info.order, offsetWidth, side);
        },
        /*
     *
     */
        autoSizeColumns() {
            const me = this,
                columns = me.getColumns();

            F.each(columns, (column) => {
                if (me.isServiceColumn(column)) {
                    return;
                }

                if (column.id) {
                    me.autoSizeColumn(column.id, true, column);
                }
            });
        },
        /*
     *
     */
        onFilter() {
            const me = this,
                s = me.store,
                isFiltered = s.hasFilters();

            if (isFiltered) {
                me.addCls(GRID_STATE_FILTERED_CLS);
            } else {
                me.removeCls(GRID_STATE_FILTERED_CLS);
            }
        },
        /*
     *
     */
        onSort() {
            const me = this,
                s = me.store;

            if (s.sorters && s.sorters.length) {
                me.addCls(GRID_STATE_SORTED_CLS);
            } else {
                me.removeCls(GRID_STATE_SORTED_CLS);
            }
        },
        /*
     *
     */
        isServiceColumn(column) {
            switch (column.type) {
                case 'order':
                case 'select':
                case 'expand':
                case 'rowdrag':
                    return true;
            }

            return false;
        },
        /*
     * @params {String} [index]
     * @params {String} [sign]
     *
     * @return {Array|Object|undefined}
     */
        getFilter(index, sign) {
            const me = this;

            if (index === undefined && sign === undefined) {
                return me.store.filters;
            }

            const filter = me.store.filters[index];

            if (sign === undefined) {
                if (filter) {
                    return filter;
                } else {
                    return;
                }
            }

            if (filter && filter[sign]) {
                return filter[sign];
            }
        },
        /*
     * @params {String} [index]
     *
     * @return {Array|Object}
     */
        getSorter(index) {
            const me = this;

            if (index !== undefined) {
                let foundedItem;

                F.each(me.store.sorters, (item) => {
                    if (item.key === index) {
                        foundedItem = item;

                        return true;
                    }
                });

                return foundedItem;
            }

            return me.store.sorters;
        },
        /*
     * @param {String} index
     * @param {Array} data
     */
        setColumnComboData(index, data) {
            const me = this,
                columns = me.getColumns();

            F.each(columns, (column) => {
                if (column.index === index || column.id === index) {
                    column.data = data;

                    if (column.editor) {
                        delete column.editor;
                    }

                    if (column.filterField) {
                        var comboData = [];
                        if (F.isObject(data[0])) {
                            comboData = data;
                        } else {
                            F.each(data, (value, i) => {
                                comboData.push({
                                    value: i,
                                    text: value
                                });
                            });
                        }

                        column.filterField.setData(comboData);
                    }

                    if (column.rowEditor) {
                        var comboData = [];
                        if (F.isObject(data[0])) {
                            comboData = data;
                        } else {
                            F.each(data, (value, i) => {
                                comboData.push({
                                    value: i,
                                    text: value
                                });
                            });
                        }

                        column.rowEditor.setData(comboData);
                    }
                }
            });
        },
        /*
     *
     */
        clearGroup() {
            const me = this,
                s = me.store;

            s.clearGroup();
            me.grouping.clearGroup();

            s.changeDataView();
            me.update();
            me.setSidesHeight();
            me.scroller.update();
        },
        /*
     * @param {String} key
     * @param {Boolean} [expand]
     */
        addGroup(key, expand) {
            const me = this,
                s = me.store,
                isBySet = !me.grouping.by;

            s.addGroup(key);

            if (s.sorters) {
                s.reSort();
            }

            if (s.filterOrder) {
                //me.filter.updateStoreFilters(false);
            }

            me.grouping.addGroup(isBySet);
            me.setSidesHeight();
            //me.scroller.update();

            if (expand) {
                me.expandGroup();
            }

            me.scroller.update();
            me.scroll(0, 0);
        },
        /*
     * @return {Boolean}
     */
        isGroupable() {
            const me = this;

            return me.grouping && me.grouping.by;
        },
        /*
     * @param {String} [group]
     */
        expandGroup(group) {
            const me = this,
                s = me.store,
                grouping = me.grouping,
                groups = grouping.groups;

            if (group) {
                me.el.select('.' + GRID_ROW_GROUP_CLS + '[group="' + group + '"]').removeCls(GRID_ROW_GROUP_COLLAPSED_CLS);
                grouping.expand(grouping.by, group);
            } else {
                F.each(groups, function (group) {
                    me.el.select('.' + GRID_ROW_GROUP_CLS + '[group="' + group + '"]').removeCls(GRID_ROW_GROUP_COLLAPSED_CLS);
                    //grouping.expand(grouping.by, group);
                });

                grouping.expand(grouping.by, groups);
            }

            if (s.sorters || s.filterOrder) {
                s.changeDataView({
                    doNotFired: true
                });
            }

            if (s.filterOrder && s.grouping && s.grouping.by) {
                me.filter.reGroupAccordingToFilters();
            }

            grouping.update();
        },
        /*
     * @param {key} [group]
     */
        collapseGroup(group) {
            const me = this,
                grouping = me.grouping,
                groups = grouping.groups;

            if (group) {
                me.el.select('.' + GRID_ROW_GROUP_CLS + '[group="' + group + '"]').addCls(GRID_ROW_GROUP_COLLAPSED_CLS);
                grouping.collapse(grouping.by, group);
            } else {
                F.each(groups, function (group) {
                    me.el.select('.' + GRID_ROW_GROUP_CLS + '[group="' + group + '"]').addCls(GRID_ROW_GROUP_COLLAPSED_CLS);
                    grouping.collapse(grouping.by, group);
                });
            }

            grouping.update();
        },
        /*
     * @return {Number}
     */
        calcCurrentLeftWidth() {
            var columns = this.getColumns('left'),
                width = 0;

            F.each(columns, (column) => {
                if (!column.hidden) {
                    width += column.width;
                }
            });

            return width;
        },
        /*
     *
     */
        calcCurrentRightWidth() {
            var columns = this.getColumns('right'),
                width = 0;

            F.each(columns, (column) => {
                if (!column.hidden) {
                    width += column.width;
                }
            });

            return width;
        },
        /*
     * @param {Array} columns
     */
        setColumns(columns) {
            const me = this;

            columns = Fancy.Array.copy(columns, true);

            columns = me.prepareConfigColumnMinMaxWidth({
                columns: columns
            }).columns;

            if (me.defaults) {
                columns = me.prepareConfigDefaults({
                    defaults: me.defaults,
                    columns: columns
                }).columns;
            }

            me.refreshcolumns.setColumns(columns);
            me._setColumnsAutoWidth();

            setTimeout(() => {
                Fancy.each(['left', 'center', 'right'], (side) => {
                    const header = me.getHeader(side),
                        body = me.getBody(side);

                    header.reSetColumnsAlign();
                    header.reSetColumnsCls();
                    body.reSetColumnsAlign();
                    body.reSetColumnsCls();
                    body.reSetIndexes();
                });
            }, 1);
        }
    });

    F.ResizeObserver = function (fn) {
        this.fn = fn;
    };

    F.ResizeObserver.prototype.observe = function (el) {
        this.el = el;
        this.init();
    };

    F.ResizeObserver.prototype.init = function () {
        const me = this;

        me.width = me.el.clientWidth;
        me.height = me.el.clientHeight;

        me.interval = setInterval(() => {
            const width = me.el.clientWidth,
                height = me.el.clientHeight;

            if (width !== me.width || height !== me.height) {
                me.fn();
                me.width = me.el.clientWidth;
                me.height = me.el.clientHeight;
            }

        }, 100);
    };

    F.ResizeObserver.prototype.stop = function () {
        clearInterval(this.interval);

        delete this.width;
        delete this.height;
    };

})();
