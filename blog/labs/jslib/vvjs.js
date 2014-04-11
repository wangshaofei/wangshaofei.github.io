/*
 * colin js library
 * Version: 0.1
 * Author: colin(alextang)
 * Site: http://icolin.org
 * desc: 满足日常需求。命名空间，DOM操作，事件，方法扩展，常用组件/工具,给自己用，所以取消了很多容错处理
 */

// namespace
// DOM
    // add className 
    // remove className
    // toggle className
    // get/set style
    // showHidden
// event
    // evtListen: VV.on()
    // function: bind

// string: trim, hasStr
// arrayExtra:  inArray, each
// module：
    /*
    ua
    load
    cookie
    animation

    ajax, 
        request
        handle
    form
        post
        post/get
    */

// namespace
if (typeof VV == 'undefined' || !VV){
    var VV = {} ;
}
VV.NS = function () {
     var arg = arguments ,
         G = null ,
         a; 
     for (var i = 0, k ; k = arg[i] ; i++ ) {
        G = VV ;
        a = k.split('.') ;
        for (var ii = (a[0] == 'VV')? 1: 0, kk ; kk = a[ii] ; ii++ ) {
            //G[KK] || (G[KK] = {})
            G[kk] = G[kk] || {} ;
            G = G[kk] ;
        }
     }
     return G ;
} ; 

$CN = function (name) {
    for (var i = 0 , k , name = name.split('.'), root = window; k = name[i] ; i++ ) {
        root = root[k] = root [k] || {} ;
    }
    return root ;
}

// DOM
var VD = VV.NS('dom') ;
VD.$ = function (v, tagName, pNode) {
    if (v.indexOf('.') != -1){ //.clsName
        v = v.substring(1) ;
        var tags = (pNode || document).getElementsByTagName(tagName || '*') ,
            a = [] ;
        for (var i = 0, k ; k = tags[i] ; i++ ) {
            if (VD.hasClass(k, v)){
                a.push(k);
            }
        }
        return a ;
    }else if (v.indexOf('=') != -1){ //type=text
        v = v.split('=') ;
        var tags = (pNode || document).getElementsByTagName(tagName || '*') ,
            a = [] ;
        for (var i = 0, k ; k = tags[i] ; i++ ) {
            if (k.getAttribute(v[0]) == v[1]){
                a.push(k);
            }
        }
        return a ;
    }else {
        return document.getElementById(v) ;
    }
} ;

// change to array
VD.$A = function () {
    if (!arguments[0].length){
        return [] ;
    }else {
        var a = [] ;
        for (var i = 0, k ; k = arguments[0][i] ; i++ ) {
            a.push(k);
        }
        return a ;
    }
} ;

VD.$$ = function () {
    var arg = arguments[0] ;
    if (arg.indexOf(',') != -1){
        var a = arg.split(',') ;
        var R  = [];
        for (var i = 0, k ; k = a[i] ; i++ ) {
            R = R.concat(VD.$A(VD.$$(k.trim()))) ;
        }
        return R ;
    }else if (arg.indexOf(' ')){
        var a = arg.trim().replace(/\s+/g, ' ').split(' ') ;
        var pid = (a[0].indexOf('#') != -1)? a[0].substring(1): a[0] ;
        var R = [] ;
        var aTemp = [] ;
        for (var i = 1, k ; k = a[i] ; i++ ) {
            if (i == 1){
                if (k.indexOf('.') != -1){
                    R = VD.$('.' + k.split('.')[1], k.split('.')[0], VD.$(pid));
                }else {
                    R = VD.$(pid).getElementsByTagName(k) ;
                }
            }else {
                for (var ii = 0, kk ; kk = R[ii] ; ii++ ) {
                    if (k.indexOf('.') != -1){
                        aTemp = aTemp.concat(VD.$A(VD.$('.'+(k.split('.')[1]), k.split('.')[0], kk))) ;
                    }else {
                        aTemp = aTemp.concat(VD.$A(kk.getElementsByTagName(k))) ;
                    }
                }
                R = aTemp ;
                aTemp = [] ;
            }
        }
        return R ;
    }
} ;

VD.hasClass = function (el, cls) {
    return el.className.hasStr(cls, ' ') ;
} ;
VD.addClass = function (el, cls) {
    if (!VD.hasClass(el, cls)){
        el.className = el.className.trim() + ' ' + cls ;
    }
} ;
VD.removeClass = function (el, cls) {
    if (VD.hasClass(el, cls)){
        var s = ' ' ;
        el.className = ((s + el.className + s).replace((s + cls + s), s)).trim() ;
    }
} ;
VD.replaceClass = function (el, cls, clsNew) {
    if (VD.hasClass(el, cls)){
        var s = ' ' ;
        el.className = ((s + el.className + s).replace((s + cls + s), s + clsNew + s)).trim() ;
    }
} ;
VD.show = function (el, type) {
    el.style.display = type || '' ;
} ;
VD.hide = function (el) {
    el.style.display = 'none' ;
} ;

VD.$C = function (v) {
    if (v.indexOf('-') == -1){
        return v ;
    }else {
        v = v.split('-') ;
        return v[0] + v[1].substring(0, 1).toUpperCase() + v[1].substring(1) ;
    }
} ;

VD.getStyle = function (el, v) {
    if (v =="float"){
        return VM.ua.isIE()? el.style['styleFloat']: el.style['cssFloat'] ;
    }
    if (el.currentStyle){
        return el.currentStyle[VD.$C(v)];
    }else if (document.defaultView && document.defaultView.getComputedStyle){
        var css = document.defaultView.getComputedStyle(el, null);
        return css ? css.getPropertyValue(v) : null;
    }
} ;
VD.setStyle = function(el, v){
    v = v.split(";");
    for (var i = 0, k ; k = v[i] ; i++ ) {
        var a = k.split(/:(?!\/\/)/g);
        var key = a[0].trim();
        key = (key=="float")?(VM.ua.isIE()? "styleFloat": "cssFloat"): VD.$C(a[0]);
        el.style[key] = a[1].trim();
    }
};

// event
var VE = VV.NS('evt') ;
VE.ae = function (el, type, func) {
    if (window.addEventListener){
        el.addEventListener(type, func, false);
    }else if (window.attachEvent){
        el.attachEvent('on' + type, func) ;
    }
} ;
VE.de = function (el, type, func) {
    if (window.addEventListener){
        el.removeEventListener(type, func, false);
    }else if (window.attachEvent){
        el.detachEvent('on' + type, func) ;
    }
} ;

// string expand
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, '') ;
    //return   this.replace(/^\s+|\s+$/g,""); 
} ;
String.prototype.hasStr = function (v, s) {
    s = s || '';
    return (s + this + s).indexOf(s+v+s) != -1;
} ;

// array expand
Array.prototype.indexOf = function (v) {
    for (var i = 0, le = this.length ; i < le; i++ ) {
        if (this[i] === v){
            return i ;
        }
    }
    return -1 ;
} ;
Array.prototype.each = function (func) {
    for (var i = 0, le = this.length ; i < le; i++ ) {
        func.apply(this[i], [i]);
    }
} ;

// module
// ua
var VM = VV.NS('module') ;

VM.load = function (type, url) {
    var d ;
    if (type == 'js'){
        d = document.createElement('script') ;
        d.setAttribute('type', 'text/javascript') ;
        d.src = url ;
    }else if (type == 'css'){
        d = document.createElement('link') ;
        d.setAttribute('type', 'text/css') ;
        d.setAttribute('media', 'screen') ;
        d.setAttribute('rel', 'stylesheet') ;
        d.href = url ;
    }
    document.getElementsByTagName('head')[0].appendChild(d) ;
} ;

VM.setCookie = function (name,value,expires,path,domain,secure) {
    var expDays = expires*24*60*60*1000;
    var expDate = new Date();
    expDate.setTime(expDate.getTime()+expDays);
    var expString = expires ? "; expires="+expDate.toGMTString() : "";
    var pathString = "; path="+(path||"/");
    var domain = domain ? "; domain="+domain : "";
    document.cookie = name + "=" + escape(value) + expString + domain + pathString + (secure?"; secure":"");
} ;
VM.getCookie = function (n) {
    var dc = "; "+document.cookie+"; ";
    var coo = dc.indexOf("; "+n+"=");
    if (coo!=-1){
        var s = dc.substring(coo+n.length+3,dc.length);
        return unescape(s.substring(0, s.indexOf("; ")));
    }else{
        return null;
    }
} ;

/**
 * 动画组件，支持同时改变多个属性(同时改变多个属性时，传递给自定义函数fnChange的值是数组)
 * @Module animAlex
 * @Author Alex (ex-name:Colin)
 * @param fnChange {function} 自定义属性变更的函数(比如高度增加，透明度变化等)
 * @param args {array} 属性变更的起始值，比如从1增加到10表示为[1,10](多个属性用二维数组表示)
 * @param d {number} 即duration，整个动画的持续时间 (默认20ms)
 * @param callback {function} 回调函数(可选)
 */
VM.anim = function (fnChange, args, d, callback) {
    d = d? d: 20 ;
    // 缓冲算法
    var tween = function(t,b,c,d){
        //return c*((t=t/d-1)*t*t*t*t + 1) + b;
        //line
        return c*t/d + b;
    } ;
    // 如果是一维数组 转换成二维数组格式
    if (typeof args[0] == 'number'){
        args = [args] ;
    }

    // 获取经过缓冲算法的值 返回值：number 或者 array
    var getTweenValue = function (t) {
        var a = [] ;
        for (var i = 0, le = args.length ; i < le; i++ ) {
            var b = args[i][0] ;
            var c = args[i][1] - b ;
            a.push(Math.ceil(tween(t, b, c, d)));
        }
        return a.length == 1? a[0]: a ;
    } ;

    var t = 0 ;
    var run = function () {
        fnChange(getTweenValue(t));
        if (t++ < d){
            setTimeout(run, 15);
        }else {
            if (typeof callback == 'function'){
                callback();
            }
        }
    } ;
    run();
} ;

/*
 * inArray
 */
VM.inArray = function (target, source) {
    for (var i = 0, le = source.length ; i < le; i++ ) {
        if (source[i] === target ){
            return true ;
        }
    }
    return false ;
} ;

/*debug ajax*/


var __Ajax={
    create:function (){
        var obj = null;	
        try{
            obj = new ActiveXObject('Msxml2.XMLHTTP');
        }catch(e){
            try{
                obj = new ActiveXObject('Microsoft.XMLHTTP');
            }catch(e){
                obj = new XMLHttpRequest();
            }
        }
        return obj;
    },
    Request: function (){
        if(arguments.length<2)return ;
        var _x= this.create(); 
        var para = {asynchronous:true,method:"GET",parameters:""};
        for (var key in arguments[1]){
            para[key] = arguments[1][key];
        }
        var _url=arguments[0];
        if(para["parameters"].length>0) {
            para["parameters"]+='&_=';
        }
        //get
        if(para["method"].toUpperCase()=="GET") {
            _url+=(_url.match(/\?/)?'&':'?')+para["parameters"];
        }
        _x.open(para["method"].toUpperCase(),_url,para["asynchronous"]);
        var _self = this ;
        _x.onreadystatechange = function () {
            _self.onStateChange(this,para);
        }
        //post
        if(para["method"].toUpperCase()=="POST"){
            _x.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        }
        for (var ReqHeader in para["setRequestHeader"]){
            _x.setRequestHeader(ReqHeader,para["setRequestHeader"][ReqHeader]);
        }
        _x.send(para["method"].toUpperCase()=="POST"?(para["postBody"]?para["postBody"]:para["parameters"]):null);
        return _x;
    },
    onStateChange: function(o, para){
        if(o.readyState==4){
            if(o.status==200)
                para["onComplete"]?para["onComplete"](o):"";
            else{
                para["onError"]?para["onError"](o):"";
            }
        }
    },
    q: function (url,_method,para,complete,error){
        return this.Request(url,{method:_method||"get",
            parameters:para||"",
            onComplete:complete,
            onError:error
        });
    }
};

VM.Ajax = {
    get	: function(url,complete,error){ 
        return __Ajax.q(url+(url.indexOf("?")==-1?"?":"&")+Math.random(),"get","",complete,error); 
    },
    post : function(url,para,complete,error){
        return __Ajax.q(url,"post",para,complete,error);
    },
    postXML : function(url,xmlString,complete,error){
        return myAjax = new __Ajax.q(url,{method:"post",postBody:xmlString,setRequestHeader:{"content-Type":"text/xml"},
            onComplete:complete,
            onError:error
        });
    }
};


// VD.get('id') 
// VD.get('.cls') 太耗性能
// VD.get('div.cls') 

// VD.get('#id div')  子级
// VD.get('#id div.cls') 

// VD.get('input[type=radio][classname=cls]') 属性
// VD.get('#id input[type=radio][classname=cls]') 属性

// VD.get('#id1, #id2') group
