/**
 * common-library.js
 *
 * @author alextang<colinvivy#gmail.com>
 * @date 2011-07-13
 * @link   http://icolin.org/
 */

// Debug
var tcDebug = {
    $: function (el) {return document.getElementById(el) ;},
    _: {status: 1},
    run: function () {
        if (!this._.status){
            return false ;
        }
        if (!this.$('TaurenChieftainDebug')){
            var div = document.createElement('div') ;
            div.id = 'TaurenChieftainDebug' ;
            div.style.cssText = 'position:fixed;_position:absolute;bottom:10px;right:10px;padding:5px;border:2px solid #399309;background:#EDFED1;height:200px;width:'+(document.body.clientWidth/3)+'px;font-family:courier new;' ;
            document.body.appendChild(div) ;
            var btnPause = document.createElement('div') ;
            var btnClear = document.createElement('div') ;
            btnPause.innerHTML = 'Pause' ;
            btnClear.innerHTML = 'Clear' ;
            var btnStyle = 'position:absolute;top:-30px;right:0px;width:70px;height:23px;line-height:23px;border-color: #FFDF4A #AE4700 #AE4700 #FFDF4A;border-style: solid;border-width: 1px;background-color: #FFE377;cursor:pointer;text-align: center;font-family:\"courier new\"";' ;
            btnClear.style.cssText = btnStyle ;
            btnPause.style.cssText = btnStyle ;
            btnPause.style.right = '75px' ;
            var _self = this ;
            btnPause.onclick = function () {
                _self._.status = (_self._.status == 1)? 0: 1 ;
                btnPause.innerHTML = btnPause.innerHTML == 'Pause'? 'Resume': 'Pause';
            } ;
            btnClear.onclick = function () {
                div.innerHTML = '' ;
                div.appendChild(btnPause) ;
                div.appendChild(btnClear) ;
            } ;
            this.$('TaurenChieftainDebug').appendChild(btnPause) ;
            this.$('TaurenChieftainDebug').appendChild(btnClear) ;
        }

        var vv = '' ;
        if (arguments.length > 0){
            for (var i = 0, l = arguments.length ; i < l ; i++ ) {
                if (i == 0){
                    vv += ''+arguments[i];
                }else {
                    vv += ', '+arguments[i];
                }
            }
        }else {
            vv = 'noArg' ;
        }
        var span = document.createElement('span') ;
        var t = document.createTextNode(vv) ;
        span.style.cssText = 'float:left;margin-right:5px;padding:0 5px;height:18px;line-height:18px; background:#390;color:#FFF' ;      
        span.appendChild(t) ;
        this.$('TaurenChieftainDebug').appendChild(span) ;
    }
} ;

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/gi,'') ;
};
// lib start
$id = function (n) {
    return document.getElementById(n) ;
};
$cls = function (tagName, clsName, pNode) {
    pNode = pNode || document.body ;
    var nodes = pNode.getElementsByTagName(tagName);
    var aNode = [] ;
    for (var i = 0, k ; k = nodes[i] ; i++ ) {
        if ($hasClass(k, clsName)) {
            aNode[aNode.length] = k ;
        }
    }
    return aNode ;
};

// class
$hasClass = function (obj, newClass) {
    //trim newClass
    var objClassName = obj.className,
        s = ' ';
    return (s + objClassName + s).indexOf(s + newClass + s) != -1;
};
$addClass = function(obj, newClass) {
    if (!$hasClass(obj, newClass)){
        obj.className = obj.className + ' ' + newClass ;
    }
};
$removeClass = function(obj, oldClass) {
    if ($hasClass(obj, oldClass)){
        var s = ' ' ;
        obj.className = ((s + obj.className + s).replace((s + oldClass + s), s)).trim() ;
    }
};
$replaceClass = function(obj, oldClass, newClass) {
    if ($hasClass(obj, oldClass)){
        var s = ' ' ;
        obj.className = ((s + obj.className + s).replace((s + oldClass + s), s + newClass + s)).trim() ;
    }
};
$toggleClass = function(obj, class1, class2) {
    ($hasClass(obj, class1)) ? $replaceClass(obj, class1, class2) : $replaceClass(obj, class2, class1);
};

// tabs
var tab = function (hd, bd, itemClsName) {
    var elHead = $id(hd).getElementsByTagName('a') ;
    var elBody = $cls('div', itemClsName, $id(bd));
    var last = 0 ;
    for (var i = 0, k ; k = elHead[i] ; i++ ) {
        k.no = i ;
        k.onclick = function () {
            $removeClass(elHead[last], 'on');
            $addClass(this, 'on');
            $addClass(elBody[last], 'hidden');
            $removeClass(elBody[this.no], 'hidden');
            last = this.no ;
        }
    }
};
// tab('yxjTabHd', 'yxjTabBd', 'switch_tab_cont_item');

// 展示Abs的DOM元素
var showAbs = function (el) {
    for (var i = 0, k ; k = el[i] ; i++ ) {
        elK = $cls('div', k, document.body);
        for (var ii = 0, kk ; kk = elK[ii] ; ii++ ) {
            kk.style.cssText = 'position:static;float:left;margin:10px 0px 10px 30px;_display:inline;';
        }
    }
};
// showAbs(['layer_common', 'mod_layer_light', 'layer_zp_wrap']);

// click show
if ($id('testAddress')) {
    $id('testAddress').onclick = function () {
        if (!this.dataStatus || this.dataStatus == 'hide') {
            this.dataStatus = 'show';
            $addClass(this.parentNode, 'send_address_hover');
            var pNode = this.parentNode.parentNode.parentNode;
            pNode.className = pNode.className;
        }else if (this.dataStatus == 'show'){
            this.dataStatus = 'hide';
            $removeClass(this.parentNode, 'send_address_hover');
            var pNode = this.parentNode.parentNode.parentNode;
            pNode.className = pNode.className;
        }
    }
}

// 切换多种风格
var tuneProtal = function () {
    var el = $cls('div', 'main' );
    var portal = ['3c', 'cos', 'sports', 'diamond', 'life', 'fashion'];
    var flag = location.search.split('=')[1] ;
    flag = flag > 5? 0 : (flag || 0);
    el[0].className = 'main page_portal_' + portal[flag];
};
