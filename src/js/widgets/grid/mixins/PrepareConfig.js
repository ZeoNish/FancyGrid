/*
 * @mixin Fancy.grid.mixin.PrepareConfig
 */
Fancy.modules['grid'] = true;
Fancy.Mixin('Fancy.grid.mixin.PrepareConfig', {
    /*
    TODO: it goes many  time for columns, to get something and it takes a bit time.
    TODO: if possible to redo to one for, but maybe it is not so timely, so I am not sure
   */
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfig(config, originalConfig) {
        const me = this;

        config._plugins = config._plugins || [];

        if (config.renderOuter) {
            config.renderTo = config.renderOuter;
        }

        config = me.generateColumnsFromData(config, originalConfig);
        /*
         * prevent columns linking if one columns object for several grids
         */
        config = me.copyColumns(config, originalConfig);
        config = me.prepareConfigScroll(config, originalConfig);
        config = me.prepareConfigData(config, originalConfig);
        config = me.prepareConfigTheme(config, originalConfig);
        config = me.prepareConfigLang(config, originalConfig);
        config = me.prepareConfigSpark(config, originalConfig);
        config = me.prepareConfigPaging(config, originalConfig);
        config = me.prepareConfigInfinite(config, originalConfig);
        config = me.prepareConfigBars(config);
        config = me.prepareConfigTBar(config);
        config = me.prepareConfigSubTBar(config);
        config = me.prepareConfigExpander(config);
        config = me.prepareConfigColumnMinMaxWidth(config);
        config = me.prepareConfigGrouping(config);
        config = me.prepareConfigGroupHeader(config);
        config = me.prepareConfigSorting(config);
        config = me.prepareConfigEdit(config);
        config = me.prepareConfigSelection(config);
        config = me.prepareConfigLoadMask(config, originalConfig);
        config = me.prepareConfigDefaults(config);
        config = me.prepareConfigFilter(config, originalConfig);
        config = me.prepareConfigSearch(config);
        config = me.prepareConfigSummary(config);
        config = me.prepareConfigState(config, originalConfig);
        config = me.prepareConfigExporter(config);
        config = me.prepareConfigSmartIndex(config);
        config = me.prepareConfigActionColumn(config);
        config = me.prepareConfigWidgetColumn(config);
        config = me.prepareConfigChart(config, originalConfig);
        config = me.prepareConfigCellTip(config);
        config = me.prepareConfigHeaderCellTip(config);
        config = me.prepareConfigColumnsWidth(config);
        config = me.prepareConfigSize(config, originalConfig);
        config = me.prepareConfigContextMenu(config, originalConfig);
        config = me.prepareConfigColumns(config);
        config = me.prepareConfigColumnsResizer(config);
        config = me.prepareConfigFooter(config);
        config = me.prepareConfigDD(config);

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    copyColumns(config, originalConfig) {
        if (config.columns) {
            config.columns = Fancy.Array.copy(config.columns, true);
        }

        if (originalConfig.columns) {
            originalConfig.columns = Fancy.Array.copy(originalConfig.columns);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    generateColumnsFromData(config, originalConfig) {
        if (!config.columns && config.data && config.data.length && Fancy.isArray(config.data[0])) {
            const firstDataRow = config.data[0] || config.data[0],
                columns = [],
                fields = [];

            Fancy.each(firstDataRow, (value, i) => {
                columns.push({
                    index: 'autoIndex' + i
                });

                fields.push('autoIndex' + i);
            });

            config.columns = columns;
            config.data = {
                items: config.data,
                fields: fields
            };

            originalConfig.data = config.data;
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigScroll(config, originalConfig) {
        if (Fancy.isIE && originalConfig.nativeScroller !== false) {
            config.nativeScroller = true;
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigSpark(config) {
        const me = this;

        Fancy.each(config.columns, (column) => {
            const spark = column.sparkConfig;

            if (spark && spark.legend) {
                switch (spark.legend.type) {
                    case 'tbar':
                    case 'bbar':
                    case 'buttons':
                        var barName = spark.legend.type,
                            index = column.index;

                        config[barName] = config[barName] || [];
                        config[barName] = config[barName].concat(me._generateLegendBar(spark.title, index, spark.legend.style, column));
                        break;
                }
            }
        });

        return config;
    },
    /*
     * @private
     * @param {String} title
     * @param {Object} style
     * @param {Object} column
     * @return {Array}
     */
    _generateLegendBar(title, indexes, style, column) {
        var i = 0,
            iL = title.length,
            bar = [],
            me = this;

        const disabled = {
            length: 0
        };

        const legendFn = function (button) {
            var grid = me,
                indexOrder;

            Fancy.each(me.columns, (column, i) => {
                if (column.index === me.columns[i].index) {
                    indexOrder = i;
                }
            });

            if (!button.hasCls('fancy-legend-item-disabled') && title.length - 1 === disabled.length) {
                return;
            }

            button.toggleCls('fancy-legend-item-disabled');

            if (button.hasCls('fancy-legend-item-disabled')) {
                disabled[button.index] = true;
                grid.disableLegend(indexOrder, button.index);
                disabled.length++;
            } else {
                grid.enableLegend(indexOrder, button.index);
                delete disabled[button.index];
                disabled.length--;
            }
        };

        for (; i < iL; i++) {
            var index = indexes[i];
            if (Fancy.isString(column.index)) {
                index = column.index + '.' + i;
            }

            const buttonConfig = {
                handler: legendFn,
                index: index,
                imageColor: Fancy.COLORS[i],
                text: title[i]
            };

            if (i === 0 && style) {
                buttonConfig.style = style;
            }

            bar.push(buttonConfig);
        }

        return bar;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigData(config) {
        if (!config.data) {
            config.data = [];
        }

        if (Fancy.isArray(config.data) && config.data.length === 0 && config.columns) {
            const fields = [],
                nestedKey = {};

            Fancy.each(config.columns, (column) => {
                if (column.index) {
                    if (/\./.test(column.index)) {
                        var splitted = column.index.split('.');
                        if (!nestedKey[splitted[0]]) {
                            fields.push(splitted[0]);
                            nestedKey[splitted[0]] = true;
                        }
                    } else {
                        fields.push(column.index || column.key);
                    }
                }

                if (column.columns) {
                    Fancy.each(column.columns, (column) => {
                        if (column.index) {
                            fields.push(column.index || column.key);
                        }
                    });
                }
            });

            config.data = {
                fields: fields,
                items: []
            };
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigLoadMask(config) {
        var showOnWaitingServer = config.loadMask === false ? false : true,
            loadText;

        if (Fancy.isString(config.loadMask)) {
            loadText = config.loadMask;
        }

        config._plugins.push({
            type: 'grid.loadmask',
            showOnWaitingServer: showOnWaitingServer,
            loadText: loadText
        });

        return config;
    },
    /*
     * @param {Array} data
     */
    reConfigStore(data) {
        const me = this,
            s = me.store,
            fields = me.getFieldsFromData(data),
            modelName = 'Fancy.model.' + Fancy.id();

        Fancy.define(modelName, {
            extend: Fancy.Model,
            fields: fields
        });

        me.model = modelName;
        s.model = modelName;

        me.fields = fields;
        s.fields = fields;
        s.setModel();
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigDefaults(config) {
        config.defaults = config.defaults || {};

        if (config.defaults.type === undefined) {
            config.defaults.type = 'string';
        }

        Fancy.each(config.defaults, (value, p) => {
            Fancy.each(config.columns, (column) => {
                switch (column.type) {
                    case 'select':
                    case 'order':
                    case 'expand':
                    case 'rowdrag':
                        return;
                }

                if (column[p] === undefined) {
                    column[p] = config.defaults[p];
                }

                if (p === 'width' && column.flex) {
                    delete column.width;
                }
            });
        });

        return config;
    },
    prepareConfigColumnMinMaxWidth(config) {
        Fancy.each(config.columns, (column) => {
            if (column.width === undefined && !column.flex && column.minWidth) {
                column.width = column.minWidth;
            }
        });

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigCellTip(config) {
        Fancy.each(config.columns, (column) => {
            if (column.cellTip) {
                config._plugins.push({
                    type: 'grid.celltip'
                });
                return true;
            }
        });

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigHeaderCellTip(config) {
        Fancy.each(config.columns, (column) => {
            if (column.headerCellTip) {
                config._plugins.push({
                    type: 'grid.headercelltip'
                });
                return true;
            }
        });

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigDD(config) {
        if (config.gridToGrid) {
            var pluginConfig = {
                type: 'grid.dragdrop'
            };

            Fancy.apply(pluginConfig, config.gridToGrid);

            config._plugins.push(pluginConfig);
        }

        if (config.rowDragDrop || config.droppable) {
            var pluginConfig = {
                type: 'grid.rowdragdrop'
            };

            Fancy.apply(pluginConfig, config.rowDragDrop);

            config._plugins.push(pluginConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Boolean} initial
     * @return {Object}
     */
    prepareConfigColumns(config, initial) {
        var columns = config.columns,
            leftColumns = [],
            rightColumns = [],
            i = 0,
            iL = columns.length,
            isDraggable = false,
            isTreeData = false,
            autoHeight = false,
            $selected = 0,
            $order = 0,
            $rowdrag = 0;

        for (; i < iL; i++) {
            const column = columns[i];

            if (column.draggable) {
                isDraggable = true;
            }

            if (column.type === 'tree') {
                isTreeData = true;
            }

            if ((column.type === 'rowdrag' || column.rowdrag) && !config.rowDragDrop) {
                config.rowDragDrop = true;
            }

            if (column.headerCheckBox && column.sortable !== true) {
                column.sortable = false;
            }

            if (column.autoHeight) {
                autoHeight = true;
            }

            if (column.select) {
                this.checkboxRowSelection = true;
                this.multiSelect = true;
                $selected++;
            }

            if (initial !== false) {
                if (column.id === undefined) {
                    if (column.index) {
                        column.id = this.getColumnId(column.index);
                    } else {
                        column.id = Fancy.id(null, 'col-id-');
                    }
                }
            }

            if (!column.title && column.index && !Fancy.isArray(column.index)) {
                switch (column.type) {
                    case 'string':
                    case 'number':
                    case 'currency':
                    case 'date':
                    case 'combo':
                    case 'checkbox':
                    case 'text':
                        column.title = Fancy.String.upFirstChar(column.index);
                        break;
                }
            }

            switch (column.type) {
                case 'select':
                    this.checkboxRowSelection = true;
                    this.multiSelect = true;
                    columns[i].index = '$selected';
                    columns[i].editable = true;
                    $selected++;

                    if ($selected > 1) {
                        //columns[i].index += $selected;
                    }
                    break;
                case 'order':
                    columns[i].editable = false;
                    columns[i].sortable = false;
                    columns[i].index = '$order';
                    columns[i].cellAlign = 'right';
                    $order++;

                    if ($order > 1) {
                        //columns[i].index += $order;
                    }
                    break;
                case 'rowdrag':
                    columns[i].editable = false;
                    columns[i].sortable = false;
                    columns[i].resizable = false;
                    columns[i].width = 30;
                    columns[i].index = '$rowdrag';
                    $rowdrag++;

                    if ($rowdrag > 1) {
                        //columns[i].index += $rowdrag;
                    }
                    break;
                case 'checkbox':
                    if (column.cellAlign === undefined) {
                        column.cellAlign = 'center';
                    }
                    break;
                case 'currency':
                    if (column.format === undefined) {
                        column.format = 'number';
                    }

                    if (column.ellipsis !== false) {
                        column.ellipsis = true;
                    }

                    if (!column.editFormat) {
                        column.editFormat = 'currency';
                    }

                    if (!column.beforeSaveFormat) {
                        column.beforeSaveFormat = 'currency';
                    }
                    break;
                case 'string':
                case 'number':
                case 'text':
                case 'date':
                case 'combo':
                case 'tree': //Bug: For tree text-overflow does not work.
                    if (column.ellipsis !== false) {
                        column.ellipsis = true;
                    }
                    break;
            }

            if (initial === false) {
                continue;
            }

            if (column.locked) {
                leftColumns.push(column);
                columns.splice(i, 1);
                i--;
                iL--;
                continue;
            }

            if (column.rightLocked) {
                rightColumns.push(column);
                columns.splice(i, 1);
                i--;
                iL--;
                continue;
            }
        }

        if (initial === false) {
            return config;
        }

        if (autoHeight) {
            config._plugins.push({
                type: 'grid.rowheight'
            });
        }

        if (isDraggable) {
            config._plugins.push({
                type: 'grid.columndrag'
            });
        }

        if (isTreeData) {
            var treeConfig = {
                type: 'grid.tree'
            };

            if (config.singleExpand) {
                treeConfig.singleExpand = config.singleExpand;
            }

            config._plugins.push(treeConfig);

            config.isTreeData = true;
        }

        config.leftColumns = leftColumns;
        config.rightColumns = rightColumns;

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigColumnsWidth(config) {
        var me = this,
            columns = config.columns,
            width = config.width,
            columnsWithoutWidth = [],
            flexColumns = [],
            maxWidth = 100,
            minWidth = 50,
            defaultWidth = maxWidth,
            flexTotal = 0,
            column,
            hasLocked = false,
            hasRightLocked = false,
            bootstrapTab = false,
            _el = Fancy.get(config.renderTo || document.body);

        if ((config.width < 1 || config.width === undefined) && _el.prop('tagName').toLocaleLowerCase() !== 'body') {
            bootstrapTab = _el.closest('.tab-pane');
            if (bootstrapTab) {
                bootstrapTab.css({
                    display: 'block',
                    visibility: 'hidden'
                });
            }
        }

        if (width === undefined || width === 'fit') {
            width = Fancy.get(config.renderTo || document.body).width();
        }

        width -= config.panelBorderWidth * 2;
        if (config.flexScrollSensitive !== false) {
            width -= config.bottomScrollHeight;
        } else {
            var theme = this.theme;

            if (Fancy.isString(config.theme)) {
                theme = config.theme;
            } else if (Fancy.isObject(config.theme)) {
                if (config.theme.name) {
                    theme = config.theme.name;
                }
            }

            if (theme !== 'bootstrap-no-borders') {
                width -= 1;
            }
        }

        Fancy.each(columns, (column, i) => {
            if (column.autoWidth) {
                config.autoColumnWidth = true;
            }

            if (column.flex) {
                config.hasFlexColumns = true;
            }

            switch (column.type) {
                case 'select':
                    if (column.width === undefined) {
                        column.width = 35;
                    }
                    break;
                case 'order':
                    if (column.width === undefined) {
                        column.width = 40;
                    }
                    break;
                case 'rowdrag':
                    if (column.width === undefined) {
                        column.width = 30;
                    }
                    break;
                case 'expand':
                    if (column.width === undefined) {
                        column.width = 38;
                    }
                    break;
                case 'combo':
                    if (!column.data) {
                        column.data = [];
                        setTimeout(() => {
                            me.on('init', () => {
                                const data = me.store.getColumnUniqueData(column.index);

                                me.setColumnComboData(column.index, data);
                            });
                        }, 1);
                    }
                    break;
            }

            if (column.locked) {
                hasLocked = true;
            }

            if (column.rightLocked) {
                hasRightLocked = true;
            }

            if (column.hidden) {
                if (column.width === undefined) {
                    column.width = 100;
                }
                return;
            }

            if (column.width === undefined) {
                if (column.flex) {
                    flexTotal += column.flex;
                    flexColumns.push(i);
                }
                columnsWithoutWidth.push(i);
            } else if (Fancy.isNumber(column.width)) {
                width -= column.width;
            }
        });

        if (config.hasFlexColumns) {
            config._plugins.push({
                type: 'grid.columnresizer'
            });
        }

        if (hasLocked && hasRightLocked) {
            width -= 2;
        }

        var averageWidth = parseInt(width / columnsWithoutWidth.length);

        if (averageWidth < minWidth) {
            averageWidth = minWidth;
        }

        if (averageWidth > maxWidth) {
            defaultWidth = maxWidth;
        }

        if (averageWidth < minWidth) {
            defaultWidth = minWidth;
        }

        var isOverFlow = false,
            _width = width;

        Fancy.each(columnsWithoutWidth, (value) => {
            column = columns[value];
            if (column.flex === undefined) {
                _width -= defaultWidth;
            }
        });

        if (flexTotal) {
            const onePerCent = parseInt(_width / flexTotal);
            Fancy.each(flexColumns, (columnIndex) => {
                _width -= onePerCent * columns[columnIndex].flex;
            });
        }

        if (_width < 0) {
            isOverFlow = true;
        }

        Fancy.each(columnsWithoutWidth, (value) => {
            column = columns[value];
            if (column.flex === undefined) {
                column.width = defaultWidth;
                width -= defaultWidth;
            }
        });

        if (flexTotal) {
            Fancy.each(flexColumns, (value) => {
                column = columns[value];
                if (isOverFlow) {
                    column.width = defaultWidth * column.flex;
                } else {
                    column.width = (width / flexTotal) * column.flex;
                }

                column.width = parseInt(column.width);

                if (column.minWidth && column.width < column.minWidth) {
                    column.width = column.minWidth;
                }
            });

            if (_width >= 1) {
                Fancy.each(flexColumns, (value) => {
                    if (_width < 1) {
                        return true;
                    }

                    column = columns[value];

                    column.width += 1;
                    _width -= 1;
                });
            }
        }

        if (bootstrapTab) {
            bootstrapTab.css({
                display: '',
                visibility: ''
            });
        }

        return config;
    },
    /*
     * @param {Object} column
     * @return {Object}
     */
    prepareConfigActionRender(column) {
        return function (o) {
            Fancy.each(column.items, (item) => {
                const itemText = item.text || '',
                    style = Fancy.styleToString(item.style),
                    cls = item.cls || '';

                o.value += [
                    '<div class="fancy-grid-column-action-item ' + cls + '" style="' + style + '">',
                    itemText,
                    '</div>'
                ].join(' ');

                if (item.render) {
                    o = item.render(o);
                }
            });

            return o;
        };
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigSmartIndex(config) {
        Fancy.each(config.columns, (column) => {
            if (/\+|\-|\/|\*|\[|\./.test(column.index)) {
                var smartIndex = column.index;

                switch (smartIndex) {
                    case 'xAxis.categories':
                    case 'yAxis.categories':
                    case 'zAxis.categories':
                        return;
                }

                smartIndex = smartIndex.replace(/(\w+)/g, function (f, found, index, str) {
                    if (str[index - 1] === '.') {
                        return found;
                    }

                    if (isNaN(Number(found))) {
                        return 'data.' + found;
                    }
                    return found;
                });
                smartIndex = 'return ' + smartIndex + ';';
                column.smartIndexFn = new Function('data', smartIndex);
            }
        });

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigActionColumn(config) {
        var me = this,
            columns = config.columns,
            i = 0,
            iL = columns.length;

        for (; i < iL; i++) {
            const column = columns[i];

            if (column.type === 'action') {
                column.sortable = false;
                column.editable = false;
                column.render = me.prepareConfigActionRender(column);

                var items = column.items;

                if (items !== undefined && items.length !== 0) {
                    var j = 0,
                        jL = items.length,
                        item;

                    for (; j < jL; j++) {
                        item = items[j];
                        switch (item.action) {
                            case 'remove':
                                if (item.handler === undefined) {
                                    item.handler = function (grid, o) {
                                        grid.remove(o);
                                    };
                                }
                                break;
                            case 'dialog':
                                (function (item) {
                                    if (item.handler === undefined) {
                                        var _items = [],
                                            k = 0,
                                            kL = columns.length,
                                            height = 42 + 38 + 7;

                                        for (; k < kL; k++) {
                                            const _column = columns[k];
                                            switch (_column.type) {
                                                case 'action':
                                                    continue;
                                            }

                                            _items.push({
                                                label: _column.title || '',
                                                type: _column.type,
                                                name: _column.index
                                            });

                                            height += 38;
                                        }

                                        item.handler = function (grid, o) {
                                            if (item.dialog) {
                                                item.dialog.show();
                                                item.dialog.set(o.data);
                                            } else {
                                                item.dialog = new FancyForm({
                                                    window: true,
                                                    draggable: true,
                                                    modal: true,
                                                    title: {
                                                        text: 'Edit',
                                                        tools: [{
                                                            text: 'Close',
                                                            handler() {
                                                                this.hide();
                                                            }
                                                        }]
                                                    },
                                                    width: 300,
                                                    height: height,
                                                    items: _items,
                                                    buttons: ['side', {
                                                        text: 'Clear',
                                                        handler() {
                                                            this.clear();
                                                        }
                                                    }, {
                                                        text: 'Save',
                                                        handler() {
                                                            const values = this.get();

                                                            if (!values.id) {
                                                                return;
                                                            }

                                                            me.getById(values.id).set(values);
                                                            me.update();
                                                        }
                                                    }],
                                                    events: [{
                                                        init() {
                                                            this.show();
                                                            this.set(o.data);
                                                        }
                                                    }]
                                                });
                                            }
                                        };
                                    }
                                })(item);

                                break;
                        }
                    }
                }
            }
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigWidgetColumn(config) {
        var me = this,
            columns = config.columns,
            i = 0,
            iL = columns.length;

        for (; i < iL; i++) {
            const column = columns[i];

            if (column.widget) {
                column.render = function (o) {
                    var fieldEl = o.cell.select('.' + Fancy.FIELD_CLS),
                        field,
                        renderTo = o.cell.dom,
                        column = o.column;

                    const itemComfig = {
                        vtype: column.vtype,
                        style: {
                            'padding': '0px',
                            'margin-top': '-10px',
                            'margin-left': '-1px'
                        },
                        label: false,
                        renderTo: renderTo,
                        value: o.value,
                        emptyText: column.emptyText
                    };

                    if (fieldEl.length) {
                        field = Fancy.getWidget(fieldEl.dom.id);

                        if (field.get() != o.value) {
                            field.set(o.value);
                        }
                    } else {
                        var width = o.column.width,
                            column = o.column,
                            index = column.index;

                        switch (o.column.type) {
                            case 'number':
                            case 'currency':
                                Fancy.apply(itemComfig, {
                                    spin: column.spin,
                                    min: column.min,
                                    max: column.max,
                                    events: [{
                                        change(field, value) {
                                            me.set(o.rowIndex, index, value);
                                            me.updater.updateRow();
                                        }
                                    }]
                                });

                                field = new Fancy.NumberField(itemComfig);
                                break;
                            case 'string':
                            case 'image':
                                Fancy.apply(itemComfig, {
                                    events: [{
                                        change(field, value) {
                                            me.set(o.rowIndex, index, value);
                                            me.updater.updateRow();
                                        }
                                    }]
                                });

                                field = new Fancy.StringField(itemComfig);
                                break;
                            case 'combo':
                                Fancy.apply(itemComfig, {
                                    displayKey: o.column.displayKey,
                                    valueKey: o.column.displayKey,
                                    padding: false,
                                    checkValidOnTyping: true,
                                    data: o.column.data,
                                    events: [{
                                        change(field, value) {
                                            me.set(o.rowIndex, index, value);
                                            me.updater.updateRow();
                                        }
                                    }]
                                });

                                field = new Fancy.Combo(itemComfig);
                                break;
                        }

                        switch (o.column.type) {
                            case 'number':
                            case 'string':
                            case 'currency':
                            case 'image':
                                field.setInputSize({
                                    width: width + 1,
                                    height: 33
                                });
                                break;
                            case 'combo':
                                field.size({
                                    width: width + 1,
                                    height: 33
                                });
                                break;
                        }
                    }

                    return o;
                };
            }
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigSorting(config) {
        const defaults = config.defaults || {};

        if (defaults.sortable) {
            config._plugins.push({
                type: 'grid.sorter'
            });

            return config;
        }

        Fancy.each(config.columns, function (column) {
            if (column.sortable) {
                config._plugins.push({
                    type: 'grid.sorter'
                });
            }
        });

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigSelection(config) {
        var initSelection = false,
            selectionConfig = {
                type: 'grid.selection'
            },
            disabled = false;

        if (config.trackOver || config.columnTrackOver || config.cellTrackOver) {
            initSelection = true;
        }

        if (config.selModel) {
            initSelection = true;
            var checkOnly = false;
            var memory = false;
            var memoryPerformance = true;
            var selectLeafsOnly = false;
            var keyNavigation = true;
            var allowDeselect = false;
            var mouseMoveSelection = true;
            var selectBottomCellAfterEdit = false;
            var selectRightCellOnEnd = false;
            var selectLeftCellOnLeftEnd = false;
            var selectUpCellOnUp = false;
            var selectBottomCellOnDown = false;
            var continueEditOnEnter = false;
            var activeCell = false;

            if (Fancy.isObject(config.selModel)) {
                checkOnly = !!config.selModel.checkOnly;
                activeCell = !!config.selModel.activeCell;

                if (config.selModel.type === 'cell' || config.selModel.type === 'cells' || activeCell) {
                    if (config.selModel.selectBottomCellAfterEdit) {
                        selectBottomCellAfterEdit = true;
                    }

                    if (config.selModel.selectRightCellOnEnd) {
                        selectRightCellOnEnd = true;
                    }

                    if (config.selModel.selectLeftCellOnLeftEnd) {
                        selectLeftCellOnLeftEnd = true;
                    }

                    if (config.selModel.selectUpCellOnUp) {
                        selectUpCellOnUp = true;
                    }

                    if (config.selModel.selectBottomCellOnDown) {
                        selectBottomCellOnDown = true;
                    }

                    if (config.selModel.continueEditOnEnter) {
                        continueEditOnEnter = config.selModel.continueEditOnEnter;
                    }
                }

                var containsTreeColumn = false,
                    containsSelectColumn = false;

                Fancy.each(config.columns, (column) => {
                    if (column.type === 'tree') {
                        containsTreeColumn = true;
                    }

                    if (column.select) {
                        containsSelectColumn = true;
                    }

                    if (column.type === 'select') {
                        containsSelectColumn = true;
                    }
                });

                if (containsTreeColumn && containsSelectColumn) {
                    checkOnly = true;
                }

                if (!config.selModel.type) {
                    throw new Error('[FancyGrid Error 5]: Type for selection is not set');
                }

                if (config.selModel.mouseMoveSelection !== undefined) {
                    mouseMoveSelection = config.selModel.mouseMoveSelection;
                }

                memory = config.selModel.memory === true;
                if (config.selModel.disabled) {
                    disabled = true;
                }

                if (config.selModel.selectLeafsOnly) {
                    selectLeafsOnly = true;
                }

                if (config.selModel.allowDeselect !== undefined) {
                    allowDeselect = true;
                }

                if (config.selModel.keyNavigation !== undefined) {
                    keyNavigation = config.selModel.keyNavigation;
                }

                config.selModel = config.selModel.type;
            }

            if (config.selModel === 'rows') {
                config.multiSelect = true;
            }

            config.selection = config.selection || {};
            config.selection.selModel = config.selModel;
            config.selection[config.selModel] = true;
            config.selection.checkOnly = checkOnly;
            config.selection.memory = memory;
            config.selection.memoryPerformance = memoryPerformance;
            config.selection.disabled = disabled;
            config.selection.selectLeafsOnly = selectLeafsOnly;
            config.selection.keyNavigation = keyNavigation;
            config.selection.allowDeselect = allowDeselect;
            config.selection.mouseMoveSelection = mouseMoveSelection;
            config.selection.selectBottomCellAfterEdit = selectBottomCellAfterEdit;
            config.selection.selectRightCellOnEnd = selectRightCellOnEnd;
            config.selection.selectLeftCellOnLeftEnd = selectLeftCellOnLeftEnd;
            config.selection.selectUpCellOnUp = selectUpCellOnUp;
            config.selection.selectBottomCellOnDown = selectBottomCellOnDown;
            config.selection.continueEditOnEnter = continueEditOnEnter;
            config.selection.activeCell = activeCell;
        }

        if (config.selection) {
            initSelection = true;

            if (Fancy.isObject(config.selection)) {
                Fancy.apply(selectionConfig, config.selection);
            }
        }

        if (initSelection === true) {
            config._plugins.push(selectionConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigEdit(config) {
        var defaults = config.defaults || {},
            editPluginConfig = {
                type: 'grid.edit'
            },
            included = false,
            editable = defaults.editable;

        if (config.clicksToEdit !== undefined) {
            editPluginConfig.clicksToEdit = config.clicksToEdit;
        }

        if (editable) {
            if (!included) {
                config._plugins.push(editPluginConfig);
            }

            config._plugins.push({
                type: 'grid.celledit'
            });

            included = true;
        }

        if (config.rowEdit) {
            config._plugins.push({
                type: 'grid.rowedit'
            });
        }

        Fancy.each(config.columns, (column) => {
            if (column.index === undefined && column.key === undefined) {
                column.editable = false;
            }

            switch (column.type) {
                case 'image':
                    column.sortable = false;
                    break;
                case 'sparklineline':
                case 'sparklinebar':
                case 'sparklinetristate':
                case 'sparklinediscrete':
                case 'sparklinebullet':
                case 'sparklinepie':
                case 'sparklinebox':
                    column.editable = false;
                    column.sortable = false;
                    break;
            }

            if (column.editable && included === false) {
                config._plugins.push(editPluginConfig);

                config._plugins.push({
                    type: 'grid.celledit'
                });
            }
        });

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigExpander(config) {
        if (config.expander) {
            const expanderConfig = config.expander;

            Fancy.apply(expanderConfig, {
                type: 'grid.expander'
            });

            config.expanded = {};

            if (config.grouping) {
                expanderConfig.expanded = false;
            }

            config._plugins.push(expanderConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigGrouping(config) {
        if (config.grouping) {
            var groupConfig = config.grouping;

            if (groupConfig === true) {
                groupConfig = {};
            }

            Fancy.apply(groupConfig, {
                type: 'grid.grouping'
            });

            config.expanded = {};

            config._plugins.push(groupConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigSummary(config) {
        if (config.summary) {
            var summaryConfig = config.summary;

            if (summaryConfig === true) {
                summaryConfig = {};
            }

            Fancy.apply(summaryConfig, {
                type: 'grid.summary'
            });

            config._plugins.push(summaryConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigContextMenu(config) {
        if (config.contextmenu) {
            var menuConfig = config.contextmenu;

            if (Fancy.isArray(config.contextmenu)) {
                Fancy.each(config.contextmenu, function (value) {
                    if (value === 'export') {
                        config.exporter = true;
                    }
                });
            }

            if (menuConfig === true) {
                menuConfig = {};
            }

            if (Fancy.isArray(menuConfig)) {
                menuConfig = {
                    items: menuConfig
                };
            }

            Fancy.apply(menuConfig, {
                type: 'grid.contextmenu'
            });

            config._plugins.push(menuConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigExporter(config) {
        if (config.exporter) {
            var exporterConfig = config.exporter;

            if (exporterConfig === true) {
                exporterConfig = {};
            }

            Fancy.apply(exporterConfig, {
                type: 'grid.exporter'
            });

            config._plugins.push(exporterConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigFilter(config) {
        var columns = config.columns,
            isFilterable = false,
            isHeaderFilter = false,
            /*
             * Detects if at least one header cell with filter under group header cell
             */
            isInGroupHeader = false,
            filterConfig = {
                type: 'grid.filter'
            };

        if (config.filter) {
            if (config.filter === true) {
                isFilterable = true;
                config.filter = {};
            }

            Fancy.apply(filterConfig, config.filter);
        }

        Fancy.each(columns, (column) => {
            if (column.filter) {
                isFilterable = true;
                if (column.filter.header) {
                    isHeaderFilter = true;

                    if (column.grouping) {
                        isInGroupHeader = true;
                    }
                }
            }
        });

        filterConfig.header = isHeaderFilter;
        filterConfig.groupHeader = isInGroupHeader;

        if (isFilterable) {
            config._plugins.push(filterConfig);
            config.filterable = true;
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigSearch(config) {
        var searchConfig = {
                type: 'grid.search'
            },
            isSearchable = false;

        if (config.searching) {
            isSearchable = true;
            Fancy.apply(searchConfig, config.searching);
        }

        if (isSearchable) {
            config._plugins.push(searchConfig);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigGroupHeader(config) {
        var columns = config.columns,
            i = 0,
            iL = columns.length,
            groups = [],
            isGrouped = false,
            _columns = [];

        columns.forEach(column => {
            if (column.columns) {
                isGrouped = true;
                groups.push(column);
            }
        })

        if (isGrouped) {
            i = 0;
            for (; i < iL; i++) {
                var column = columns[i];

                if (column.columns) {
                    var j = 0,
                        jL = column.columns.length,
                        groupName = column.text || column.title || '  ';

                    for (; j < jL; j++) {
                        if (column.locked) {
                            column.columns[j].locked = true;
                        }

                        if (column.rightLocked) {
                            column.columns[j].rightLocked = true;
                        }
                        column.columns[j].grouping = groupName;

                        if (column.defaults) {
                            Fancy.applyIf(column.columns[j], column.defaults);

                            if (column.defaults.width && column.columns[j].flex) {
                                delete column.columns[j].width;
                            }
                        }
                    }

                    _columns = _columns.concat(column.columns);
                } else {
                    _columns = _columns.concat(columns.slice(i, i + 1));
                }
            }

            const groupsMap = {};

            Fancy.each(groups, (group) => {
                groupsMap[group.title || group.text || ''] = group;
            });

            config.columns = _columns;

            config._plugins.push({
                type: 'grid.groupheader',
                groups: groups,
                groupsMap: groupsMap
            });

            config.isGroupedHeader = true;
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigPaging(config, originalConfig) {
        var me = this,
            lang = config.lang,
            paging = config.paging,
            barType = 'bbar',
            pageOverFlowType = 'last';

        if (!paging) {
            return config;
        }

        if (paging.barType !== undefined) {
            switch (paging.barType) {
                case 'bbar':
                case 'tbar':
                case 'both':
                    barType = paging.barType;
                    break;
                case false:
                case 'none':
                    barType = 'none';
                    break;
                default:
                    throw new Error('[FancyGrid Error]: - not supported bar type for paging');
            }
        }

        if (paging.pageOverFlowType) {
            pageOverFlowType = paging.pageOverFlowType;
        }

        config._plugins.push({
            i18n: originalConfig.i18n,
            type: 'grid.paging',
            barType: barType,
            pageOverFlowType: pageOverFlowType
        });

        if (barType === 'both') {
            config['tbar'] = me.generatePagingBar(paging, lang);
            config['bbar'] = me.generatePagingBar(paging, lang);
        } else if (barType === 'none') {
        } else {
            config[barType] = me.generatePagingBar(paging, lang);
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigInfinite(config) {
        const infinite = config.infinite;

        if (!infinite) {
            return config;
        }
        // Force disabling native scroller
        config.nativeScroller = false;

        config._plugins.push({
            type: 'grid.infinite'
        });

        return config;
    },
    /*
     * @param {Object|Boolean} paging
     * @param {Object} lang
     * @return {Array}
     */
    generatePagingBar(paging, lang) {
        var me = this,
            bar = [],
            disabledCls = 'fancy-bar-button-disabled',
            marginTop = me.theme === 'material' ? 8 : 3,
            style = {
                'float': 'left',
                'margin-right': '5px',
                'margin-top': marginTop + 'px'
            };

        bar.push({
            imageCls: 'fancy-paging-first',
            disabledCls: disabledCls,
            role: 'first',
            handler: function () {
                me.paging.firstPage();
            },
            style: {
                'float': 'left',
                'margin-left': '5px',
                'margin-right': '5px',
                'margin-top': marginTop + 'px'
            }
        });

        bar.push({
            imageCls: 'fancy-paging-prev',
            disabledCls: disabledCls,
            role: 'prev',
            handler: function () {
                me.paging.prevPage();
            },
            style: style
        });

        bar.push('|');

        bar.push({
            type: 'text',
            text: lang.paging.page
        });

        bar.push({
            type: 'number',
            label: false,
            padding: false,
            style: {
                'float': 'left',
                'margin-left': '-1px',
                'margin-right': '8px',
                'margin-top': (marginTop + 1) + 'px'
            },
            role: 'pagenumber',
            min: 1,
            width: paging.inputWidth || 30,
            listeners: [{
                enter(field) {
                    if (parseInt(field.getValue()) === 0) {
                        field.set(1);
                    }

                    var page = parseInt(field.getValue()) - 1,
                        setPage = me.paging.setPage(page);

                    if (page !== setPage) {
                        field.set(setPage);
                    }
                }
            }, {
                up(field, value) {
                    var pages = me.store.pages,
                        value = Number(value) + 1;

                    if (value > pages) {
                        value = pages;
                    }

                    field.set(value);
                }
            }, {
                down(field, value) {
                    var pages = me.store.pages,
                        value = Number(value) - 1;

                    if (value < 1) {
                        value = 1;
                    }

                    field.set(value);
                }
            }]
        });

        bar.push({
            type: 'text',
            text: '',
            role: 'ofText'
        });

        bar.push('|');

        bar.push({
            imageCls: 'fancy-paging-next',
            disabledCls: disabledCls,
            role: 'next',
            style: style,
            handler() {
                me.paging.nextPage();
            }
        });

        bar.push({
            imageCls: 'fancy-paging-last',
            disabledCls: disabledCls,
            role: 'last',
            style: style,
            handler() {
                me.paging.lastPage();
            }
        });

        if (Fancy.isObject(paging) && paging.refreshButton === true) {
            bar.push('|');

            bar.push({
                imageCls: 'fancy-paging-refresh',
                disabledCls: disabledCls,
                role: 'refresh',
                style: style,
                handler() {
                    me.paging.refresh();
                }
            });
        }

        if (paging && Fancy.isArray(paging.pageSizeData)) {
            var pageSizeData = paging.pageSizeData,
                sizes = [],
                i = 0,
                iL = pageSizeData.length,
                value = 0;

            for (; i < iL; i++) {
                sizes.push({
                    index: i,
                    value: pageSizeData[i]
                });

                if (paging.pageSize === pageSizeData[i]) {
                    value = i;
                }
            }

            var sizeStyle = Fancy.Object.copy(style);

            sizeStyle['margin-top'] = (marginTop + 1) + 'px';

            bar.push({
                editable: false,
                width: 50,
                type: 'combo',
                role: 'size',
                style: sizeStyle,
                data: sizes,
                displayKey: 'value',
                valueKey: 'index',
                value: value,
                subSearch: false,
                events: [{
                    change(field, value) {
                        me.scroll(0, 0);
                        me.paging.setPageSize(pageSizeData[value]);
                    }
                }, {
                    render: function (combo) {
                        me.store.on('changepages', () => {
                            if (me.store.pageSize !== Number(combo.input.dom.value)) {
                                var index;
                                Fancy.each(combo.data, (item) => {
                                    if (item.value === me.store.pageSize) {
                                        index = item.index;
                                        return true;
                                    }
                                });

                                if (index !== undefined) {
                                    combo.setValue(index, false);
                                }
                                //combo.input.dom.value = me.store.pageSize;
                            }
                        });
                    }
                }]
            });
        }

        bar.push('side');

        bar.push({
            type: 'text',
            role: 'info',
            text: ''
        });

        return bar;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigState(config) {
        const me = this;

        if (config.stateful) {
            var log = {};

            if (Fancy.isObject(config.stateful)) {
                log = config.stateful;
            }

            const startState = config.state || {};

            var name = config.stateId || this.getStateName(),
                state = localStorage.getItem(name);

            if (!state) {
                me.memoryInitialColumns(name, config.columns);
                if (config.defaults) {
                    me.memoryInitialDefaults(name, config.defaults);
                }
            }

            if (state && (me.wasColumnsCodeChanged(name, config.columns) || me.wasDefaultChanged(name, config.defaults))) {
                localStorage.clear(name);
                localStorage.clear(name + 'memory-columns');
                state = null;
                me.memoryInitialColumns(name, config.columns);
                if (config.defaults) {
                    me.memoryInitialDefaults(name, config.defaults);
                }
            }

            if (state) {
                state = JSON.parse(state);

                for (var p in state) {
                    if (Fancy.isString(state[p])) {
                        state[p] = JSON.parse(state[p]);
                    }
                }

                const stateColumns = state.columns;

                if (stateColumns) {
                    Fancy.each(stateColumns, (stateColumn) => {
                        Fancy.each(stateColumn, (v, p) => {
                            if (v === 'FUNCTION' || v === 'OBJECT' || v === 'ARRAY') {
                                var index = stateColumn.index;
                                Fancy.each(config.columns, (column) => {
                                    if (column.index === index) {
                                        stateColumn[p] = column[p];
                                        return true;
                                    }
                                });
                            }
                        });
                    });

                    config.columns = stateColumns;
                }

                for (var p in state) {
                    if (p === 'columns') {
                        continue;
                    }

                    if (startState[p] === undefined) {
                        startState[p] = state[p];
                    }
                }
            }

            config._plugins.push({
                type: 'grid.state',
                stateful: true,
                startState: startState,
                log: log
            });
        } else if (config.state) {
            config._plugins.push({
                type: 'grid.state',
                startState: config.state
            });
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigColumnsResizer(config) {
        const defaults = config.defaults || {};

        if (defaults.resizable) {
            config._plugins.push({
                type: 'grid.columnresizer'
            });

            return config;
        }

        var columns = [].concat(config.columns).concat(config.leftColumns).concat(config.rightColumns);

        Fancy.each(columns, (column) => {
            if (column.resizable || column.autoWidth) {
                config._plugins.push({
                    type: 'grid.columnresizer'
                });
                return true;
            }
        });

        return config;
    },
    prepareConfigBars(config) {
        const fn = function (bar) {
            var i = 0,
                iL = bar.length;

            for (; i < iL; i++) {
                switch (bar[i].type) {
                    case 'date':
                        if (!bar[i].format) {
                            var date = config.lang.date;
                            bar[i].format = {
                                read: date.read,
                                write: date.write,
                                edit: date.edit
                            };
                        }

                        if (config.i18n) {
                            bar[i].i18n = config.i18n;
                        }
                        break;
                }
            }
        };

        fn(config.tbar || []);
        fn(config.subTBar || []);
        fn(config.bbar || []);
        fn(config.buttons || []);

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigTBar(config) {
        const me = this,
            tbar = config.tbar;

        if (tbar) {
            var i = 0,
                iL = tbar.length;

            for (; i < iL; i++) {
                switch (tbar[i].type) {
                    case 'columns':
                        tbar[i].text = tbar[i].text || 'Columns';
                        tbar[i].type = 'button';
                        tbar[i].menuIcon = false;

                        var menu = [];

                        Fancy.each(config.columns, (column) => {
                            if (!column.title) {
                                return;
                            }

                            menu.push({
                                text: column.title,
                                index: column.index,
                                column: column,
                                checked: !column.hidden,
                                handler(menu, item) {
                                    if (item.checked === true && !item.checkbox.get()) {
                                        item.checkbox.set(true);
                                    }

                                    if (item.checked && menu.el.select('.fancy-checkbox-on').length === 1) {
                                        item.checkbox.set(true);
                                        return;
                                    }

                                    item.checked = !item.checked;
                                    item.checkbox.set(item.checked);

                                    if (item.checked) {
                                        me.showColumn(me.side, item.index, column);
                                    } else {
                                        me.hideColumn(me.side, item.index, column);
                                    }

                                    if (me.responsive) {
                                        me.onWindowResize();
                                    }
                                }
                            });
                        });

                        tbar[i].menu = menu;

                        break;
                    case 'search':
                        config.searching = config.searching || {};
                        config.filter = config.filter || true;
                        break;
                    case 'date':
                        if (config.i18n) {
                            tbar[i].i18n = config.i18n;
                        }
                        break;
                }

                switch (tbar[i].action) {
                    case 'add':
                        if (tbar[i].handler === undefined) {
                            tbar[i].handler = function () {
                                me.insert(0, {});
                                me.scroll(0);
                            };
                        }
                        break;
                    case 'undo':
                        if (tbar[i].handler === undefined) {
                            tbar[i].handler = function () {
                                me.undo();
                            };
                        }
                        break;
                    case 'undoall':
                        if (tbar[i].handler === undefined) {
                            tbar[i].handler = function () {
                                me.undoAll();
                            };
                        }
                        break;
                    case 'redo':
                        if (tbar[i].handler === undefined) {
                            tbar[i].handler = function () {
                                me.redo();
                            };
                        }
                        break;
                    case 'remove':
                        if (tbar[i].handler === undefined) {
                            tbar[i].disabled = true;
                            tbar[i].handler = function () {
                                Fancy.each(me.getSelection(), function (item) {
                                    me.remove(item);
                                });

                                me.selection.clearSelection();
                            };

                            tbar[i].events = [{
                                render: function () {
                                    const me = this;
                                    setTimeout(() => {
                                        const grid = Fancy.getWidget(me.el.parent().parent().parent().select('.' + Fancy.GRID_CLS).dom.id);

                                        grid.on('select', () => {
                                            const selection = grid.getSelection();

                                            if (selection.length === 0) {
                                                me.disable();
                                            } else {
                                                me.enable();
                                            }
                                        });

                                        grid.on('clearselect', () => {
                                            me.disable();
                                        });
                                    }, 10);
                                }
                            }];
                        }
                        break;
                }
            }
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigSubTBar(config) {
        const bar = config.subTBar;

        if (bar) {
            var i = 0,
                iL = bar.length;

            for (; i < iL; i++) {
                switch (bar[i].type) {
                    case 'search':
                        config.searching = config.searching || {};
                        config.filter = config.filter || true;
                        break;
                }
            }
        }

        return config;
    },
    /*
     * @param {Object} config
     * @return {Object}
     */
    prepareConfigChart(config) {
        var data = config.data,
            chart = data.chart;

        if (Fancy.isObject(chart)) {
            chart = [chart];
        }

        if (data && data.chart) {
            config._plugins.push({
                type: 'grid.chartintegration',
                chart: chart,
                toChart: data.items ? true : (data.proxy ? true : false)
            });

            Fancy.each(chart, function (_chart) {
                var type = _chart.type;

                switch (type) {
                    case 'highchart':
                    case 'highcharts':
                        config._plugins.push({
                            type: 'grid.highchart'
                        });
                        break;
                    case undefined:
                        throw new Error('[FancyGrid Error] - type of chart is undefined');
                    default:
                        throw new Error('[FancyGrid Error] - type of chart ' + type + ' does not exist');
                }
            });
        }

        return config;
    },
    /*
     * @param {Object} config
     * @param {Object} originalConfig
     * @return {Object}
     */
    prepareConfigSize(config) {
        var me = this,
            renderTo = config.renderTo,
            length,
            height,
            el,
            isPanel = !!(config.title || config.subTitle || config.tbar || config.bbar || config.buttons || config.panel),
            panelBodyBorders = config.panelBodyBorders,
            gridWithoutPanelBorders = config.gridWithoutPanelBorders,
            gridBorders = config.gridBorders;

        if (config.width === undefined) {
            if (renderTo) {
                config.responsive = true;
                config.responsiveWidth = true;
                el = Fancy.get(renderTo);
                config.width = parseInt(el.width());

                if (config.width < 1 && el.prop('tagName').toLocaleLowerCase() !== 'body') {
                    const bootstrapTab = el.closest('.tab-pane');
                    if (bootstrapTab) {
                        bootstrapTab.css({
                            display: 'block',
                            visibility: 'hidden'
                        });

                        config.width = parseInt(el.width());

                        bootstrapTab.css({
                            display: '',
                            visibility: ''
                        });
                    } else {
                        config.width = el.parent().width();
                    }
                }

                if (config.width === 0) {
                    config.width = parseInt(el.parent().width());
                }
            }
        } else if (config.width === 'fit') {
            var width = 0,
                hasLocked = false;

            this.fitWidth = true;

            Fancy.each(config.columns, (column) => {
                if (!column.hidden) {
                    width += column.width;
                }
                if (column.locked) {
                    hasLocked = true;
                }
            });

            if (config.title || config.subTitle) {
                width += panelBodyBorders[1] + panelBodyBorders[3] + gridBorders[1] + gridBorders[3];
            } else {
                width += gridWithoutPanelBorders[1] + gridWithoutPanelBorders[3] + gridBorders[1] + gridBorders[3];
            }

            if (hasLocked) {
                width--;
            }

            config.width = width;
        }

        if (config.height === undefined) {
            if (renderTo) {
                config.responsiveHeight = true;
                var height = parseInt(el.height());
                if (height < 50) {
                    height = parseInt(el.parent().css('height'));
                }

                config.height = height;
            }
        } else if (config.height === 'fit') {
            var headerRows = 1;
            length = 0;

            Fancy.each(config.columns, (column) => {
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

            if (Fancy.isArray(config.data)) {
                length = config.data.length;
            } else if (config.data && Fancy.isArray(config.data.items)) {
                length = config.data.items.length;
            }

            height = length * config.cellHeight;

            if (config.title) {
                height += config.titleHeight;
            }

            if (config.tbar) {
                height += config.tbarHeight || config.barHeight;
            }

            if (config.tabs) {
                height += config.barHeight;
            }

            if (config.bbar) {
                height += me.bbarHeight || config.barHeight;
            }

            if (config.buttons) {
                height += config.buttonsHeight || config.barHeight;
            }

            if (config.subTBar) {
                height += config.subTBarHeight || config.barHeight;
            }

            if (config.footer) {
                height += config.barHeight;
            }

            if (config.header !== false) {
                height += config.cellHeaderHeight * headerRows;
            }

            if (isPanel) {
                height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
            } else {
                height += gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2] + gridBorders[0] + gridBorders[2];
            }

            if (config.minHeight && height < config.minHeight) {
                height = config.minHeight;
            }

            config.heightFit = true;

            config.height = height;
        }

        if (isPanel && !config.title) {
            config.panelBodyBorders = [0, 0, 0, 0];
            setTimeout(function () {
                if (me.panel) {
                    me.panel.css('border-bottom-width', 0);
                }
            }, 1);
        }

        return config;
    },
    /*
     * @param {String} name
     * @param {Object} defaults
     * @return {Boolean}
     */
    wasDefaultChanged(name, defaults) {
        name = name + '-memory-defaults';
        const memoryDefaults = JSON.parse(localStorage.getItem(name));

        if (!memoryDefaults || !defaults) {
            return false;
        }

        for (var p in memoryDefaults) {
            switch (Fancy.typeOf(memoryDefaults[p])) {
                case 'number':
                case 'string':
                case 'boolean':
                    break;
                default:
                    continue;
            }

            if (defaults[p] !== memoryDefaults[p]) {
                return true;
            }
        }

        for (var p in defaults) {
            switch (Fancy.typeOf(defaults[p])) {
                case 'number':
                case 'string':
                case 'boolean':
                    break;
                default:
                    continue;
            }

            if (memoryDefaults[p] === undefined) {
                return true;
            }
        }

        return false;
    },
    /*
     * @param {String} name
     * @param {Array} columns
     * @return {Boolean}
     */
    wasColumnsCodeChanged(name, columns) {
        name = name + '-memory-columns';
        const memoryColumns = JSON.parse(localStorage.getItem(name));

        if (!memoryColumns) {
            return false;
        }

        if (columns.length !== memoryColumns.length) {
            return true;
        }

        var wasChanges = false;

        Fancy.each(memoryColumns, (column, i) => {
            for (const p in column) {
                if (column[p] !== columns[i][p]) {
                    if (p === 'width' && column.autoWidth) {
                        continue;
                    }
                    wasChanges = true;
                    return true;
                }
            }
        });

        Fancy.each(columns, (column, i) => {
            for (const p in column) {
                switch (Fancy.typeOf(column[p])) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        if (memoryColumns[i][p] === undefined) {
                            wasChanges = true;
                            return true;
                        }
                        break;
                }
            }
        });

        return wasChanges;
    },
    /*
     *
     */
    memoryInitialDefaults(name, defaults) {
        name = name + '-memory-defaults';
        const memoryDefaults = {};

        for (var p in defaults) {
            switch (Fancy.typeOf(defaults[p])) {
                case 'string':
                case 'number':
                case 'boolean':
                    memoryDefaults[p] = defaults[p];
                    break;
            }
        }

        localStorage.setItem(name, JSON.stringify(memoryDefaults));
    },
    /*
     * @param {String} name
     * @param {Array} columns
     */
    memoryInitialColumns(name, columns) {
        name = name + '-memory-columns';
        const memoryColumns = [];

        Fancy.each(columns, (column) => {
            const memoryColumn = {};

            for (const p in column) {
                switch (Fancy.typeOf(column[p])) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        memoryColumn[p] = column[p];
                        break;
                }
            }

            memoryColumns.push(memoryColumn);
        });

        localStorage.setItem(name, JSON.stringify(memoryColumns));
    }
});
