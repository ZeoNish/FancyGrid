/**
 * @class Fancy.Grid
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.Grid', 'FancyGrid'], {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.grid.mixin.Grid',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.grid.mixin.PrepareConfig',
    'Fancy.grid.mixin.ActionColumn',
    Fancy.grid.mixin.Edit
  ],
  plugins: [{
    type: 'grid.updater'
  },{
    type: 'grid.scroller'
  }, {
    type: 'grid.licence'
  },{
    type: 'grid.refreshcolumns'
  }],
  type: 'grid',
  theme: Fancy.default.theme,
  i18n: Fancy.default.lang,
  emptyText: '',
  prefix: 'fancy-grid-',
  cls: '',
  widgetCls: Fancy.GRID_CLS,
  header: true,
  shadow: true,
  striped: true,
  columnLines: true,
  rowLines: true,
  textSelection: false,
  width: 200,
  height: 200,
  minWidth: 200,
  minHeight: 200,
  minColumnWidth: 30,
  defaultColumnWidth: 100,
  emptyValue: '&nbsp;',
  frame: true,
  draggable: false,
  activated: false,
  multiSort: false,
  tabEdit: true,
  dirtyEnabled: true,
  barScrollEnabled: true,
  startResizing: false,
  startEditByTyping: false,
  filterCaseSensitive: true,
  nativeResizeObserver: false,
  dropOutSideActions: true,
  /*
   * @constructoloadr
   * @param {*} renderTo
   * @param {Object} [config]
   */
  constructor: function(renderTo, config){
    const me = this;

    if (Fancy.isDom(renderTo)) {
      config = config || {};
      config.renderTo = renderTo;
    }
    else{
      config = renderTo;
    }

    config = config || {};

    const fn = function (params) {
      if (params) {
        const lang = config.lang;
        Fancy.apply(config, params);

        if (lang) {
          Fancy.apply(config.lang, lang);
        }
      }

      if (config.id) {
        me.id = config.id;
      }
      me.initId();
      me.initColumnsIdSeedByIndex();
      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    const preInit = function () {
      const i18n = config.i18n || me.i18n;

      if (Fancy.loadLang(i18n, fn) === true) {
        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    if(!Fancy.modules['grid'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false){
      if(Fancy.nojQuery){
        Fancy.loadModule('dom', function(){
          Fancy.loadModule('grid', function(){
            preInit();
          });
        });
      }
      else{
        Fancy.loadModule('grid', function(){
          preInit();
        });
      }
    }
    else{
      preInit();
    }
  },
  /*
   *
   */
  init(){
    const me = this;

    //me.initId();
    me.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
    me.addEvents(
      'headercellclick', 'headercellmousemove', 'headercellmousedown', 'headercellenter', 'headercellleave',
      'docmouseup', 'docclick', 'docmove',
      'beforeinit', 'init',
      'columnresize', 'columnclick', 'columndblclick', 'columnenter', 'columnleave', 'columnmousedown', 'columntitlechange',
      'cellclick', 'celldblclick', 'cellenter', 'cellleave', 'cellmousedown', 'beforecellmousedown',
      'rowclick', 'rowdblclick', 'rowenter', 'rowleave', 'rowtrackenter', 'rowtrackleave',
      'beforecolumndrag', 'columndrag',
      'columnhide', 'columnshow',
      'columnremove', 'columnadd',
      'scroll', 'nativescroll',
      'remove',
      'insert',
      'set', 'change', 'edit',
      'update',
      'beforesort', 'sort',
      'beforeload', 'load', 'servererror', 'serversuccess',
      'select', 'selectrow', 'deselectrow',
      'clearselect',
      'activate', 'deactivate',
      'beforeedit', 'startedit', 'beforeendedit', 'endedit', 'beforesaving',
      'changepage', 'changepagesize',
      'dropitems',
      'dragstart',
      'dragrows',
      'collapse', 'expand',
      'treecollapse', 'treeexpand',
      'lockcolumn', 'rightlockcolumn', 'unlockcolumn',
      'filter',
      'contextmenu',
      'statechange',
      'changewidth',
      'changeheight'
    );

    Fancy.loadStyle();

    if(Fancy.fullBuilt !== true && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(me.wtype !== 'datepicker' && me.wtype !== 'monthpicker'){
        me.loadModules();
        return;
      }
    }

    if(!Fancy.stylesLoaded){
      me.intWaitForStyle = setInterval(function (){
        if(Fancy.stylesLoaded){
          clearInterval(me.intWaitForStyle);
          me.init();
        }
      }, 100);

      return;
    }

    me.initStore();

    me.initPlugins();

    me.ons();

    me.initDateColumn();
    me.fire('beforerender');
    me.preRender();
    me.render();
    me.initElements();
    me.initActionColumnHandler();
    me.fire('render');
    me.fire('afterrender');
    me.setSides();
    me.setSidesHeight();
    me.setColumnsPosition();
    //hbar chart column does not work without it.
    //TODO: Needs to study how to fix it and do not run.
    //It is not possible to replicate but unless production sample.
    //Also it is needed to auto height
    //me.update();
    me.lightStartUpdate();
    me.initTextSelection();
    me.initTouch();
    me.initDebug();
    me.fire('beforeinit');

    setTimeout(() =>{
      me.inited = true;
      me.fire('init');
      me.setBodysHeight();
      if (!me.state) {
        me._setColumnsAutoWidth();
      }
    }, 100);

  },
  /*
   *
   */
  loadModules(){
    var me = this,
      requiredModules = {},
      columns = me.columns || [],
      leftColumns = me.leftColumns || [],
      rightColumns = me.rightColumns || [];

    Fancy.modules = Fancy.modules || {};

    if(Fancy.nojQuery){
      requiredModules.dom = true;
    }

    if(Fancy.isTouch){
      requiredModules.touch = true;
    }

    if(me.summary){
      requiredModules.summary = true;
      if(me.summary.options){
        requiredModules.menu = true;
      }
    }

    if(me.exporter){
      requiredModules.exporter = true;
      requiredModules.excel = true;
    }

    if(me.paging){
      requiredModules.paging = true;
    }

    if(me.filter || me.searching){
      requiredModules.filter = true;
    }

    if(me.data && me.data.proxy){
      requiredModules.edit = true;
    }

    if(me.clicksToEdit){
      requiredModules.edit = true;
    }

    if(me.defaults && me.defaults.editable){
      requiredModules.edit = true;
    }

    if(me.stateful || me.state){
      requiredModules.state = true;
    }

    if(Fancy.isObject(me.data)){
      if(me.data.proxy){
        requiredModules['server-data'] = true;
        if(Fancy.nojQuery){
          requiredModules['ajax'] = true;
        }
      }

      if(me.data.chart){
        requiredModules['chart-integration'] = true;
      }
    }

    if(me.expander){
      requiredModules['expander'] = true;
    }

    if(me.isGroupedHeader){
      requiredModules['grouped-header'] = true;
    }

    if(me.grouping){
      requiredModules['grouping'] = true;
    }

    if(me.summary){
      requiredModules['summary'] = true;
    }

    if(me.exporter){
      requiredModules['exporter'] = true;
      requiredModules['excel'] = true;
    }

    if(me.trackOver || me.columnTrackOver || me.cellTrackOver || me.selection){
      requiredModules['selection'] = true;
    }

    if(me.contextmenu){
      requiredModules['menu'] = true;
    }

    if(me.infinite){
      requiredModules.infinite = true;
    }

    const containsMenu = (item) => {
      if (item.menu) {
        requiredModules['menu'] = true;
        return true;
      }
    };

    Fancy.each(me.events, e =>{
      for (const p in e) {
        if(p === 'contextmenu'){
          requiredModules.menu = true;
        }
      }
    });

    Fancy.each(me.controls, (c) => {
      if (c.event === 'contextmenu') {
        requiredModules.menu = true;
      }
    });

    Fancy.each(me.tbar, containsMenu);
    Fancy.each(me.bbar, containsMenu);
    Fancy.each(me.buttons, containsMenu);
    Fancy.each(me.subTBar, containsMenu);

    const _columns = columns.concat(leftColumns).concat(rightColumns);

    Fancy.each(_columns, (column) => {
      if (column.draggable === true) {
        requiredModules['column-drag'] = true;
      }

      if(column.sortable === true){
        requiredModules.sort = true;
      }

      if(column.editable === true){
        requiredModules.edit = true;
      }

      if(column.menu){
        requiredModules.menu = true;
      }

      if(column.filter){
        requiredModules.filter = true;
      }

      switch(column.type){
        case 'select':
          me.checkboxRowSelection = true;
          requiredModules['selection'] = true;
          break;
        case 'combo':
          if(column.data && column.data.proxy){
            requiredModules['ajax'] = true;
          }
          break;
        case 'progressbar':
        case 'progressdonut':
        case 'grossloss':
        case 'hbar':
          requiredModules.spark = true;
          break;
        case 'tree':
          requiredModules.tree = true;
          break;
        case 'date':
          requiredModules.date = true;
          requiredModules.selection = true;
          break;
      }
    });

    if(Fancy.isArray(me.tbar)){
      Fancy.each(me.tbar, (item) => {
        switch(item.action){
          case 'add':
          case 'remove':
            requiredModules.edit = true;
            break;
        }
      });
    }

    if(me.gridToGrid){
      requiredModules.dd = true;
    }

    if(me.rowDragDrop){
      requiredModules.dd = true;
    }

    me.neededModules = {
      length: 0
    };

    for (var p in requiredModules) {
      if(Fancy.modules[p] === undefined){
        me.neededModules[p] = true;
        me.neededModules.length++;
      }
    }

    if(me.neededModules.length === 0){
      me.neededModules = true;
      me.init();
      return;
    }

    const onLoad = function (name) {
      delete me.neededModules[name];
      me.neededModules.length--;

      if (me.neededModules.length === 0) {
        me.neededModules = true;
        me.init();
      }
    };

    if(me.neededModules.dom){
      Fancy.loadModule('dom', function(name){
        delete me.neededModules[name];
        me.neededModules.length--;

        if(me.neededModules.length === 0){
          me.neededModules = true;
          me.init();
        }
        else{
          for (var p in me.neededModules){
            if (p === 'length'){
              continue;
            }

            Fancy.loadModule(p, onLoad);
          }
        }
      });
    }
    else {
      for (var p in me.neededModules){
        if (p === 'length'){
          continue;
        }

        Fancy.loadModule(p, onLoad);
      }
    }
  },
  /*
   * @param {Number|String} indexOrder
   * @param {String} side
   */
  lockColumn(indexOrder, side){
    const me = this;

    if (me.columns.length === 1) {
      return false;
    }

    if (Fancy.isString(indexOrder)) {
      Fancy.each(me.columns, (column, i) => {
        if (column.index === indexOrder) {
          indexOrder = i;
          return true;
        }
      });
    }

    const removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, me.leftColumns.length, 'left');
    if(me.header){
      me.leftHeader.reSetCheckBoxes();

      if(me.groupheader){
        me.header.fixGroupHeaderSizing();
        me.leftHeader.fixGroupHeaderSizing();
      }
    }
    me.body.reSetIndexes();
    me.leftBody.reSetIndexes();

    me.fire('lockcolumn', {
      column: removedColumn
    });

    me.update();
  },
  /*
   * @param {Number|String} indexOrder
   * @param {String} side
   */
  rightLockColumn(indexOrder, side){
    const me = this;

    if (me.columns.length === 1) {
      return false;
    }

    if (Fancy.isString(indexOrder)) {
      Fancy.each(me.columns, function(column, i){
        if(column.index === indexOrder){
          indexOrder = i;
          return true;
        }
      });
    }

    const removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, 0, 'right');

    if (me.header) {
      me.rightHeader.reSetCheckBoxes();

      if (me.groupheader) {
        me.header.fixGroupHeaderSizing();
        me.rightHeader.fixGroupHeaderSizing();
      }
    }
    me.body.reSetIndexes();
    me.rightBody.reSetIndexes();

    me.fire('rightlockcolumn', {
      column: removedColumn
    });

    me.update();
  },
  /*
   * @param {Number|String} indexOrder
   * @param {String} side
   */
  unLockColumn(indexOrder, side){
    const me = this;
    let removedColumn;

    if (side === undefined) {
      if(Fancy.isString(indexOrder)){
        Fancy.each(me.leftColumns, function(column, i){
          if (column.index === indexOrder){
            side = 'left';
            indexOrder = i;
            return true;
          }
        });

        if(side === undefined){
          Fancy.each(me.rightColumns, function(column, i){
            if (column.index === indexOrder){
              side = 'right';
              indexOrder = i;
              return true;
            }
          });
        }
      }
      else{
        side = 'left';
      }
    }

    switch(side){
      case 'left':
        if(Fancy.isString(indexOrder)){
          Fancy.each(me.leftColumns, function(column, i){
            if(column.index === indexOrder){
              indexOrder = i;
              return true;
            }
          });
        }

        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, 0, 'center', 'left');

        if(me.leftColumns.length === 0){
          me.leftEl.addCls(Fancy.GRID_LEFT_EMPTY_CLS);
          me.centerEl.css('left', '0px');
        }
        break;
      case 'right':
        if(Fancy.isString(indexOrder)){
          Fancy.each(me.rightColumns, function(column, i){
            if(column.index === indexOrder){
              indexOrder = i;
              return true;
            }
          });
        }

        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, me.columns.length, 'center', 'right');

        if (me.rightColumns.length === 0) {
          me.rightEl.addCls(Fancy.GRID_RIGHT_EMPTY_CLS);
          const bodyWidth = parseInt(me.body.el.css('width'));

          me.body.el.css('width', bodyWidth + 2);
        }
        break;
    }

    if(side === 'left' && me.isGroupable() && me.leftColumns.length === 0){
      me.grouping.insertGroupEls();
    }

    if (me.header) {
      if(me.groupheader){
        me.header.fixGroupHeaderSizing();

        if(me.rightHeader){
          me.rightHeader.fixGroupHeaderSizing();
        }

        if(me.leftHeader){
          me.leftHeader.fixGroupHeaderSizing();
        }
      }
    }

    me.body.reSetIndexes();
    me.leftBody.reSetIndexes();
    me.rightBody.reSetIndexes();

    me.fire('unlockcolumn', {
      column: removedColumn
    });
  },
  /*
   * @param {String} fromSide
   * @param {String} toSide
   * @param {Number} fromIndex
   * @param {Number} toIndex
   * @param {Object} [grouping]
   */
  moveColumn(fromSide, toSide, fromIndex, toIndex, grouping){
    const me = this;
    let removedColumn;

    if (grouping) {
      var i = 0,
        iL = grouping.end - grouping.start + 1,
        groupIndex = grouping.cell.attr('index'),
        toHeader = me.getHeader(toSide),
        groupCellHTML = grouping.cell.dom.outerHTML;

      for(;i<iL;i++){
        me.moveColumn(fromSide, toSide, grouping.end - i, toIndex);
      }

      const toColumns = me.getColumns(toSide);
      const cells = toHeader.el.select('.' + Fancy.GRID_HEADER_CELL_CLS);

      i = toIndex;
      iL = i + (grouping.end - grouping.start + 1);

      for (;i<iL;i++) {
        const column = toColumns[i],
          cell = cells.item(i);

        column.grouping = groupIndex;
        cell.attr('group-index', groupIndex);
      }

      toHeader.el.append(groupCellHTML);

      toHeader.fixGroupHeaderSizing();

      return;
    }

    if (fromSide === 'center') {
      removedColumn = me.removeColumn(fromIndex, 'center');
      switch(toSide){
        case 'left':
          me.insertColumn(removedColumn, toIndex, 'left', 'center');
          break;
        case 'right':
          me.insertColumn(removedColumn, toIndex, 'right', 'center');
          break;
      }
    }
    else if (fromSide === 'left') {
      removedColumn = me.removeColumn(fromIndex, 'left');
      switch(toSide){
        case 'center':
          me.insertColumn(removedColumn, toIndex, 'center', 'left');
          break;
        case 'right':
          me.insertColumn(removedColumn, toIndex, 'right', 'left');
          break;
      }
    }
    else if (fromSide === 'right') {
      removedColumn = me.removeColumn(fromIndex, 'right');
      switch(toSide){
        case 'center':
          me.insertColumn(removedColumn, toIndex, 'center', 'right');
          break;
        case 'left':
          me.insertColumn(removedColumn, toIndex, 'left', 'right');
          break;
      }
    }

    if (me.groupheader) {
      me.header.fixGroupHeaderSizing();

      if(me.leftColumns){
        me.leftHeader.fixGroupHeaderSizing();
      }

      if(me.rightColumns){
        me.rightHeader.fixGroupHeaderSizing();
      }
    }

    me.getHeader(fromSide).reSetCheckBoxes();
    me.getHeader(toSide).reSetCheckBoxes();

    me.update();
  },
  updateColumnsVisibility(){
    const me = this;

    if (me.columns) {
      if (me.header) {
        me.header.updateCellsVisibility();
      }
      me.body.updateColumnsVisibility();
    }

    if (me.leftColumns) {
      if (me.leftHeader) {
        me.leftHeader.updateCellsVisibility();
      }

      me.leftBody.updateColumnsVisibility();
    }

    if (me.rightColumns) {
      if (me.rightHeader) {
        me.rightHeader.updateCellsVisibility();
      }
      me.rightBody.updateColumnsVisibility();
    }
  },
  initColumnsIdSeedByIndex(){
    this.columnsIdsSeed = {};
  },
  getColumnId(index){
    const me = this;

    if(me.columnsIdsSeed[index] === undefined){
      me.columnsIdsSeed[index] = 0;
    }
    else{
      me.columnsIdsSeed[index]++;
    }

    if(!me.columnsIdsSeed[index]){
      return index;
    }

    return index + '-' + me.columnsIdsSeed[index];
  },
  /*
   * @return {Boolean}
   */
  isGroupable(){
    const me = this;

    return me.grouping && me.grouping.by;
  },
  /*
   *
   */
  _setColumnsAutoWidth(){
    const me = this;

    if (!me.autoColumnWidth) {
      return;
    }

    if (me.state && !Fancy.Object.isEmpty(me.state.getState()) && !me.allowAutoWidthStateIsEmpty) {
      return;
    }

    if (me._firstTimeAutoColumnWidth) {
      return;
    }

    const columns = me.getColumns();
    Fancy.each(columns, function(column){
      if(column.autoWidth && !column.hidden && (column.index || column.smartIndexFn || column.render)){
        me.autoSizeColumn(column.id, true, column);
      }
    });

    setTimeout(() => {
      me._firstTimeAutoColumnWidth = true;
      delete me.allowAutoWidthStateIsEmpty;
    }, 1000);
  }
});

/*
 * @param {String} id
 */
FancyGrid.get = (id) => {
  const el = Fancy.get(id);

  if (!el.dom) {
    return;
  }

  const gridEl = el.select(`.${Fancy.GRID_CLS}`).item(0);

  if (!gridEl.dom) {
    return;
  }

  const gridId = gridEl.dom.id;

  return Fancy.getWidget(gridId);
};

FancyGrid.defineTheme = Fancy.defineTheme;
FancyGrid.defineController = Fancy.defineController;
FancyGrid.addValid = Fancy.addValid;

if (!Fancy.nojQuery && Fancy.$) {
  Fancy.$.fn.FancyGrid = function(o){
    if(this.selector){
      o.renderTo = Fancy.$(this.selector)[0].id;
    }
    else{
      o.renderTo = this.attr('id');
    }

    return new Fancy.Grid(o);
  };
}
