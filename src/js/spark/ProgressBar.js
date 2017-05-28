/*
 * @class Fancy.spark.ProgressBar
 */
Fancy.define('Fancy.spark.ProgressBar', {
  tipTpl: '{value} {suffix}',
  /*
   * @constructor
   * @param {Object} o
   */
  constructor: function(o){
    var me = this;

    Fancy.apply(me, o);
    
    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initId();
    me.render();

    if( me.inited !== true ) {
      me.ons();
    }
  },
  /*
   *
   */
  initId: function(){
    var me = this,
      prefix = me.prefix || Fancy.prefix;

    me.id = me.id || Fancy.id(null, prefix);

    Fancy.addWidget(me.id, me);
  },
  /*
   *
   */
  ons: function() {
    var me = this;
    
    if(me.tip !== false){
      me.el.on('mouseenter', me.onMouseEnter, me);
      me.el.on('mouseleave', me.onMouseLeave, me);
      me.el.on('mousemove', me.onMouseMove, me);
    }
  },
  /*
   *
   */
  onMouseEnter: function(){
    var me = this,
      value = me.el.attr('value'),
      suffix = '%';

    if(me.percents === false){
      suffix = '';
    }

    var tpl = new Fancy.Template(me.tipTpl),
      text = tpl.getHTML({
        value: value,
        suffix: suffix
      });

    Fancy.tip.update(text);
  },
  /*
   *
   */
  onMouseLeave: function(){
    Fancy.tip.hide(1000);
  },
  /*
   * @param {Object} e
   */
  onMouseMove:  function(e){
    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  render: function(){
    var me = this,
      column = me.column,
      width = column.width - 18,
      percent = width / me.maxValue,
      barWidth = me.value * percent,
      value,
      attrValue = me.value,
      spark = column.sparkConfig;

    if(me.percents === false){
      attrValue = me.value;
    }
    else {
      if (attrValue < 1) {
        attrValue = me.value.toFixed(1);
      }
      else {
        attrValue = me.value.toFixed(0);
      }
    }

    var inside = '&nbsp;',
      outside = '',
      outSideLeft = '';

    if(spark.label){
      switch(spark.label.type){
        case 'left':
          inside = '<div class="fancy-grid-bar-label" style="float: left;">'+attrValue+'</div>';
          if(barWidth < String(attrValue).length * 7){
            inside = '&nbsp;';
            outside = '<div class="fancy-grid-bar-label-out" style="">'+attrValue+'</div>';
          }
          break;
        case 'right':
          inside = '<div class="fancy-grid-bar-label" style="float: right;">'+attrValue+'</div>';
          if(barWidth < String(attrValue).length * 7){
            inside = '&nbsp;';
            if(spark.align === 'right'){
              outside = '<div class="fancy-grid-bar-label-out-left" style="">'+attrValue+'</div>';
            }
            else{
              outside = '<div class="fancy-grid-bar-label-out" style="">'+attrValue+'</div>';
            }
          }
          break;
        default:
          inside = '<div class="fancy-grid-bar-label" style="float: left;">'+attrValue+'</div>';
          if(barWidth < String(attrValue).length * 7){
            inside = '&nbsp;';
            outSideLeft = '<div class="fancy-grid-bar-label-out-left" style="">'+attrValue+'</div>';
          }
      }
    }

    var _width = 'width:'+(barWidth)+'px;',
      _float = '';

    if(spark.align){
      _float = 'float:' + spark.align + ';';
    }

    value = '<div id="'+me.id+'" value="' + attrValue + '" class="fancy-grid-column-progress-bar" style="' + _width + _float + '">' + inside + '</div>' + outside + outSideLeft;

    me.renderTo.innerHTML = value;
    me.el = Fancy.get(me.renderTo).select('.fancy-grid-column-progress-bar').item(0);

    if(Fancy.isFunction(me.style)){
      var _style = me.style({
        value: me.value,
        column: me.column,
        rowIndex: me.rowIndex,
        data: me.data
      });

      me.el.css(_style)
    }
  },
  update: function(){
    var me = this,
      column = me.column,
      width = column.width - 18,
      percent = width / me.maxValue,
      barWidth = me.value * percent,
      spark = column.sparkConfig;

    me.el.css('width', barWidth);
    me.el.attr('value', me.value);

    if(spark.label){

    }
  }
});