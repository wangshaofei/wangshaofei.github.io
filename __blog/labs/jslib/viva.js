/**
 * viva-library.js
 *
 * @author alextang<colinvivy#gmail.com>
 * @date 2011-07-13
 * @link http://icolin.org/
 */

// define "Const" and basic method
var ErrorMsg = [],
    Namespace;

var getType = function (v) {
    return v && {}.toString.call(v).slice(8, -1) ;
}
var isNumber = function (v) { return getType(v) == 'Number' && isFinite(v); }
var isArray = function (v) { return getType(v) == 'Array' ; }
var isString = function (v) { return getType(v) == 'String' ; }
var isObject = function (v) { return getType(v) == 'Object' ; }
var isFunction = function (v) { return getType(v) == 'Function' ; }
var isUndefined = function (v) { return typeof v === 'undefined' ; }
var isNull = function (v) { return v === null ; }

/**
 * Namespace
 * 
 * @param {string} key
 * @param {any} value
 * @example Namespace('VIVA.testNS', {});
 */
Namespace = function(key, value) {
	var arr = key.split(".");
	if (arr.length == 1) {
		if (!isUndefined(window[key])) {
			ErrorMsg.push("GlobalError: the global variable " + key + " already exists");
		}
		window[key] = value;
	} else {
		var L = arr.length,
		lastKey = arr[L - 1],
		hash = window;
		for (var i = 0; i < L - 1; i++) {
			hash = hash[arr[i]] = hash[arr[i]] || {};
		}
		hash[lastKey] = value;
	}
};

// Define global object VIVA
Namespace('VIVA');
VIVA = {
    version: 1.0,
    debug: 0,
    console: function (msg) {
        if (!VIVA.debug){ return false ; }
        var elDebug = document.getElementById('layerAlexDebug');
        var strMsg = '' ;
        if (!elDebug){
            var elDiv = document.createElement('div') ;
            elDiv.setAttribute('id', 'layerAlexDebug') ;
            document.body.appendChild(elDiv) ;
            elDebug = document.getElementById('layerAlexDebug');
            var topPos = document.documentElement.clientHeight*0.35 ;
            elDebug.style.cssText = 'zoom:1;position:absolute;top:'+topPos+'px;right:2px;padding:3px 7px;border:1px solid #399309;background:#EDFED1;width:'+(document.body.clientWidth/3)+'px;_height:25px;min-height:25px;word-break:break-all;white-space:normal;font:300 12px\/1.5 Verdana' ;

            var btnPause = document.createElement('div') ;
            var btnClear = document.createElement('div') ;
            btnPause.innerHTML = 'Pause' ;
            btnClear.innerHTML = 'Clear' ;
            var btnStyle = 'position:absolute;top:'+(topPos - 23)+'px;right:2px;width:50px;height:18px;line-height:18px;border-color: #EDFED1 #399309 #399309 #EDFED1;border-style: solid;border-width: 1px;background-color: #dDeEd1;cursor:pointer;text-align: center;' ;
            btnClear.style.cssText = btnStyle ;
            btnPause.style.cssText = btnStyle ;
            btnClear.style.right = '58px' ;
            var _self = this ;
            btnPause.onclick = function () {
                VIVA.debug = VIVA.debug == 1 ? 0 : 1 ;
            } ;
            btnClear.onclick = function () {
                elDebug.innerHTML = '' ;
            } ;
            document.body.appendChild(btnPause) ;
            document.body.appendChild(btnClear) ;
        }
        msg = ErrorMsg.concat(msg) ;
        var tempfrag = document.createDocumentFragment();
        for (var i = 0, le = msg.length ; i < le; i++ ) {
            var temp = document.createElement('p');
            var t = document.createTextNode(msg[i]);
            temp.appendChild(t) ;
            tempfrag.appendChild(temp) ;
        }
        elDebug.appendChild(tempfrag) ;
    },
    each: function (arrObj, fn) {
        arrObj = isArray(arrObj)? arrObj : [arrObj]
        for (var i = 0, le = arrObj.length ; i < le; i++ ) {
            fn.call(arrObj[i], i, arrObj[i]);
        }
    },
    extend: function (child, parent) {
        if (isFunction(parent)) {
            var f = function () {};
            f.prototype = parent.prototype ;
            child.prototype = new f();
            child.prototype.constructor = child ;
        }else if (isObject(parent)){
            VIVA.clone(child.prototype, parent, 1);
        }
    },
    clone: function (reciever, giver, isDeep) {
        isDeep = isDeep || false;
        var gItem ;
        for (var i in giver) {
            gItem = giver[i];
            if (isObject(gItem) || isArray(gItem)) {
                if (isDeep) {
                    reciever[i] = isObject(gItem)? {} : [];
                    VIVA.clone(reciever[i], gItem, isDeep);
                }else {
                    reciever[i] = isObject(gItem)? {} : [];
                }
            }
            reciever[i] = giver[i];
        }
    },
    /**
     * 将指定命名空间下的方法映射到其他命名空间
     *
     * @param {Object} 命名空间对象
     * @param {Function} 可选，别名规则
     * @example VIVA.map(VIVA.tools);
     **/
    map: function (source, fn) {
        fn = isFunction(fn)? fn : function (v) { return '$' + v ; }
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                Namespace(fn(i), source[i]);
            }
        }
    },
    tools: {
        isIE:0,
        isIE6:0,
        isIE7:0,
        isIE8:0,
        isIE9:0,
        isMoz:0,
        isFirefox:0,
        isChrome:0,
        trim: function (v) {
            return v.replace(/^\s+|\s+%/gi, '') ;
        }
    }
    //bind
}

VIVA.plugin = {
    // TODO
    _browser: (function () {
        var _ua = window.navigator.userAgent.replace(/\s+/g, '').toLowerCase();
        if (_ua.indexOf('msie') > -1) {
            VIVA.tools.isIE = true ;
            if (_ua.indexOf('msie6') > -1) {
                VIVA.tools.isIE6 = true ;
            }else if (_ua.indexOf('msie7')>-1){
                VIVA.tools.isIE7 = true ;
            }else if (_ua.indexOf('msie8') > -1){
                VIVA.tools.isIE8 = true ;
            }else if (_ua.indexOf('msie9')>-1){
                VIVA.tools.isIE9 = true ;
            }
        }else if (_ua.indexOf('firefox') > -1){
            VIVA.tools.isFirefox = true ;
            VIVA.tools.isMoz = true ;
        }else if (_ua.indexOf('chrome') > -1){
            VIVA.tools.isChrome = true ;
        }
    })()
}

// Define DOM
VIVA._DOM = {
    Prototype: {
		init: function(selector, context) {
			this.length = 0;
			selector = selector || document;
			if (selector.nodeType) {
				this[0] = selector;
				this.length = 1;
				return this;
			}
			var elements = [],
                matches = [];
			var idReg = /.*#(\w+)$/,
                tagReg = /(:)?(\w+)(?:\[(\w+)(?:=['|"](\w+)['|"])?\])?$/;
			var doc = (context ? context.ownerDocument || context: document);
			if (typeof selector == "string") {
				matches = idReg.exec(selector);
				if (matches && matches[1]) {
					this[0] = doc.getElementById(matches[1]);
					this.length = 1;
				} else {
					matches = tagReg.exec(selector);
					if (matches && matches[2]) {
						elements = (matches[1]) ? doc.getElementsByTagName("input") : doc.getElementsByTagName(matches[2]);
						if (matches[3]) {
							var arr = [];
							if (matches[4]) {
								for (var i = 0, ll = elements.length; i < ll; ++i) { (elements[i].getAttribute(matches[3]) && (elements[i].getAttribute(matches[3]).toLowerCase() === matches[4].toLowerCase())) ? arr.push(elements[i]) : "";
								}
							} else {
								for (var i = 0, ll = elements.length; i < ll; ++i) { (elements[i].getAttribute(matches[3]) === null) ? 0: arr.push(elements[i]);
								}
							}
							this[0] = arr;
							this.length = arr.length;
						} else {
							if (matches[1]) {
								var arr = [];
								for (var i = 0; i < elements.length; ++i) { (elements[i].getAttribute("type") && (elements[i].getAttribute("type").toLowerCase() === matches[2].toLowerCase())) ? arr.push(elements[i]) : "";
								}
								this[0] = arr;
								this.length = arr.length;
							} else {
								this[0] = elements;
								this.length = elements.length;
							}
						}
					}
					else {}
				}
			} else if (isArray(selector)) {
				this[0] = selector;
				this.length = selector.length;
			}
			return this;
		},
        find: function () {
            
        },
        each: function (fn) {
            VIVA.each(this[0], fn);
        },
        show: function (type) {
            type = type || 'block';
            this.each(function (i, item) {
                this.style.display = type ;
            });
            return this ;
        },
        attr: function (key, value) {
            var _a = [] , _isGetter = 0 ;
            this.each(function () {
                if (key == 'class' || key == 'className') {
                    key = ($isIE6 || $isIE7)? 'className': 'class';
                }else if (key == 'for'){
                    key = ($isIE6 || $isIE7)? 'htmlFor': 'for';
                }
                if (isUndefined(value)) {
                    _isGetter = 1;
                    _a.push(this.getAttribute(key)) ;
                }else {
                    this.setAttribute(key, value) ;   
                }
            });
            return _isGetter ? _a: this ;
        },
        getCss: function (key) {
            //float  
        },
        css: function (key, value) {
            var _a = [] , _isGetter = 0 ;
            // opacity
            this.each(function () {
                if (isUndefined(value)) {
                    _isGetter = 1;
                    _a.push(this.getCss(key)) ;
                }else {
                    if (key == 'opacity') {
                        var ieValue , notIeValue;
                        if (value.indexOf('%') > -1) {
                            ieValue = value.replace('%', '');
                            notIeValue = value.replace('%', '')/100 ;
                        }else if (value.indexOf('.') > -1){
                            ieValue = value*100 ;
                            notIeValue =  value ;
                        }else {
                            ieValue = value>100? 100: value ;
                            notIeValue = value/100;
                        }
                        if ($isIE) {
                            this.style.cssText = 'filter:alpha(opacity=50);'
                            this.filters[0].Opacity = ieValue ;
                        }else {
                            this.style[key] = notIeValue;
                        }
                    }else {
                        this.style[key] = value ;
                    }
                }
            });
            return _isGetter ? _a: this ;
        },
        hasClass: function (v) {
            var s = ' ';
            return (s + $trim(this.attr('class')[0]) + s).indexOf(s+$trim(v)+s) + 1 ;
        },
        addClass: function () {
            
        },
        removeClass: function () {
            
        }
    }
};

// Define Event
VIVA._Event = {
    Prototype: {
        arrEvent: {},
        addEvent: function (type, fn) {
            var strFn = fn.toString() ;
            var _self = this ;
            this.each(function (i, item) {
                _self.arrEvent[strFn] = function () {
                    fn.call(item, i, item);
                }
                if (document.addEventListener) {
                    item.addEventListener(type, _self.arrEvent[strFn] , false) ;
                }else if (document.attachEvent){
                    item.attachEvent('on' + type, _self.arrEvent[strFn]);
                }else {
                    item['on'+type] = _self.arrEvent[strFn] ;
                }
            });
        },
        removeEvent: function (type, fn) {
            var strFn = fn.toString() ;
            var _self = this; 
            this.each(function (i, item) {
                // TODO support checked
                if (document.removeEventListener) {
                    item.removeEventListener(type, _self.arrEvent[strFn] , false) ;
                }else if (document.detachEvent){
                    item.detachEvent('on' + type, _self.arrEvent[strFn]);
                }else {
                    item['on'+type] = '' ;
                }
            });
        }
    }
};

// Define Extra
VIVA._Extra = { };

// Config
(function () {
    var Core = function (selector, context) {
        return this.init(selector, context) ;
    };
    VIVA.extend(Core, VIVA._DOM.Prototype, 1);
    VIVA.extend(Core, VIVA._Event.Prototype, 1);
    VIVA.extend(Core, VIVA._Extra, 1);

    VIVA.$ = function (selector, context) {
        return new Core(selector, context) ;
    }

    Namespace('$', VIVA.$);
    Namespace('$console', VIVA.console);
    VIVA.map(VIVA.tools);
})();


//构造基本方法供核心类调用
//通过extend来让最终对象$的构造函数拥有dom和event的方法
//通过extend让用户自定义方法
//Need this
//HOME
//
//extend：让对象从fn、{}继承，让fn从fn、{}继承，可选择性继承
//
// core
// dom
// ajax
// event
// template [optional]
// tools
// config
