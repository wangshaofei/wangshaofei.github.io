/**
 * localStorage package
 *
 * @author alextang
 * @date 2013-10-08 
 * @method update , read,  delete , clear
 **/

(function (window) {
    if (window.localStorage) {
        var LS = window.localStorage;
    }else {
        alert('Your browser does not support localStorage');
    }

    var lsPackage = (function () {
        var getJson = function (ns, k) {
            var lsv = LS.getItem(ns) || '{}';
            lsv = JSON.parse(lsv);
            return lsv ;
        };

        var mC = function (ns, k, v) {
            var lsdata = getJson(ns, k);
            lsdata[k] = v ;
            LS.setItem(ns, JSON.stringify(lsdata));
        };

        var mR = function (ns, k) {
            var lsdata = getJson(ns, k);
            return lsdata[k] || '' ;
        };

        var mD = function (ns, k) {
            var lsdata = getJson(ns, k);
            delete lsdata[k];
            LS.setItem(ns, JSON.stringify(lsdata));
        };

        return {
            // original method
            'setItem': function (ns, v) {
                if (Object.prototype.toString.call(v).slice(8, -1) === 'Object') {
                    LS.setItem(ns, JSON.stringify(v));
                }else {
                    LS.setItem(ns, v);
                }
            },
            'getItem': function (ns, parseObj) {
                var _temp = LS.getItem(ns);
                if (_temp) {
                    return parseObj ? JSON.parse(_temp)  : _temp ;
                }else {
                    return parseObj ? {} : '' ;
                }
            },
            'clear': function (ns) {
                LS.removeItem(ns);
            },
            // extend method
            'set': function (ns, k, v) {
                mC(ns, k,v);
            },
            'get': function (ns, k) {
                return mR(ns, k);
            },
            'delete': function (ns, k) {
                mD(ns, k);
            }
        } ;
    })();

    window.Ls = lsPackage ;

})(window);

