/**
 * canvas.js
 *
 * @author alextang<colinvivy#gmail.com>
 * @date 2012-12-10
 * @link http://colinvivy.github.com
 */

/* lib */
function $extend(){
    // copy reference to target object
    var target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        options;
    if ( typeof target != "object" && typeof target != "function" ) {
        target = {};
    }
    for ( ; i < length; i++ ) {
        if ( (options = arguments[ i ]) != null ) {
            for ( var name in options ) {
                var copy = options[ name ];
                if ( target === copy ) {
                    continue;
                }
                if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }
    return target;
}

// debug switch
var DebugMode = 0 ;

/**
 * i18n: you know that, internationalization
 *
 **/
var i18n = {
    dressName: {
        nagasa: '衣长',
        shoulder: '肩长',
        sleeve: '袖长',
        bust: '胸围',
        waist: '腰围',
        hip: '臀围',
        dang: '裆位'
    },

    compareMsg: {
        nagasa: '这件衣服的长度$ret了$valuecm哦',
        shoulder: '这件衣服的肩长$ret了$valuecm哦',
        sleeve: '这件衣服的袖长$ret了$valuecm哦',
        waist: '这件衣服的腰围$ret了$valuecm哦'
    },

    hintMsg: {
    }
};

// 存储比较结果的数据
var compareRet = {} ;

// 动态创建容器展现详细的比较信息(解决canvas里的图形元素无法响应鼠标事件)
var canvasMouseEvt = {
    createBox: function (id ,desp, pos) {
        var el = document.getElementById(id);
        if (!el) {
            el = document.createElement('i');
            el.setAttribute('id', id) ;
            document.getElementById('canvasWrap').appendChild(el) ;
        }
        el.setAttribute('title', desp) ;
        pos.x += $('#dressCanvas')[0].offsetLeft ;
        el.style.cssText = 'position:absolute;z-index:3;cursor:help;top:' + pos.y + 'px;left:' + pos.x + 'px;width:' + pos.w + 'px;height:' + pos.h + 'px;' ;
    },

    init: function (el) {
        var me = this ;

        for (var i in compareRet) {
            me.createBox('canvas_desp_'+ i, compareRet[i].msg , compareRet[i]);
        }

        //el.onmouseover = function () {
            //me.createBox();
        //};
    }
};

/**
 * 服饰数据模型
 *
 * @method {Function} init 初始化服饰数据，转换服饰尺寸数据为座标系数据，并构造绘图路径,返回路径
 * @author alextang
 **/
var dressData = {
    // 上衣的衣袖和水平方向的夹角为PI/4
    upperBody: {
        // TODO 根据canvas尺寸计算
        center: [330 , 50],
        path: [],
        pathCompare: [],

        size: {
            // for save user base data
            base: { },
            max: {
                nagasa: 100,
                shoulder:50,
                waist: 45,
                sleeve: 80
            },
            // default user data
            custom: {
                nagasa: 100,
                shoulder:50,
                sleeveWidth: 30,
                waist: 45,
                sleeve: 80
            }
        },

        /**
         * 翻转x轴坐标
         *
         * @param {Number} v 指定点的x坐标
         * @return 返回以竖直中心轴对称的x坐标
         **/
        flipX: function (v) {
            return 2*this.center[0] - v ;
        },

        transform: function (type) {
            var crood = {},
                sizeBase = this.size.base ,
                size = this.size.custom ,
                center = this.center ,
                path = this.path = [] ,
                pathCompare = this.pathCompare = [] ;

            var compareLineHeight = 10 ;

            /**
             * Msin 简单包装下正弦函数
             *
             * @param {Number} v 角度，如果为空就使用PI/4弧度
             * @return 返回正弦值
             **/
            var Msin = function (v) {
                return Math.sin((v && v*Math.PI/180) || Math.PI/4 ) ;  
            };

            crood.A = [center[0]-size.shoulder/2, center[1]];
            // todo 10 衣领固定大小
            crood.F = [center[0] - 22, crood.A[1]];
            path.push({type: 'moveTo', v: crood.F}) ;

            // todo 
            crood.A1 = [crood.A[0] + 10, crood.A[1]];
            path.push({type: 'lineTo', v: crood.A1}) ;

            crood.A2 = [crood.A[0] - 20, crood.A[1] + 20];
            crood.C4 = [crood.A1[0] - 10, crood.A1[1], crood.A2[0], crood.A2[1], crood.A2[0], crood.A2[1]];
            path.push({type: 'bezierCurveTo', v: crood.C4}) ;

            //path.push({type: 'lineTo', v: crood.A}) ;

            crood.D = [crood.A[0] - size.sleeve*Msin(), crood.A[1] + size.sleeve*Msin()] ;
            path.push({type: 'lineTo', v: crood.D}) ;

            crood.E = [crood.D[0] + size.sleeveWidth*Msin() , crood.D[1] + size.sleeveWidth*Msin() ] ;
            //path.push({type: 'lineTo', v: crood.D}) ;

            // sleeve曲线控制点偏移量
            var bcSleeve = 5
            crood.C1 = [crood.D[0]-bcSleeve, crood.D[1] + bcSleeve, crood.E[0]-bcSleeve, crood.E[1] + bcSleeve , crood.E[0], crood.E[1]];
            path.push({type: 'bezierCurveTo', v: crood.C1});
             
            crood.B = [crood.A[0], crood.A[1] + size.sleeveWidth/Msin()];
            path.push({type: 'lineTo', v: crood.B}) ;

            // 上衣不考虑hip
            //crood.C = [center[0] - size.hip/2, center[1] + size.nagasa];

            // todo 
            crood.G = [center[0] - size.waist/2, center[1] + size.nagasa];
            path.push({type: 'lineTo', v: crood.G}) ;


            //crood.C2 = [crood.G[0], crood.G[1] + 12, crood.C[0], crood.C[1], crood.C[0], crood.C[1]];
            //path.push({type: 'bezierCurveTo', v: crood.C2}) ;

            //path.push({type: 'lineTo', v: crood.C}) ;

            // 反转中心对称的坐标
            var pathFlip = [] ,
                tempCrood ;
            for (var i = path.length - 1, k; i >= 0; i--) {
                k = path[i] ;
                // 绘制衣服底边曲线
                if (i === path.length -1) {
                    tempCrood = [center[0], k.v[1]+10 ,this.flipX(k.v[0]), k.v[1]] ;
                    pathFlip.push({type: 'quadraticCurveTo', v: tempCrood}) ;
                }else {

                    // 如果是bezire曲线，则将第三个点（5，6个参数）设置为当前点坐标，交换两个控制点坐标，并获取下一个点的坐标作为终点坐标。
                    if (k.type === 'bezierCurveTo') {
                        // 1. 将第三点设置为当前坐标
                        tempCrood = [this.flipX(k.v[4]), k.v[5]] ;
                        pathFlip.push({type: 'lineTo', v: tempCrood});

                        // 2. 重新设置bezier坐标,交换两个控制点坐标
                        tempCrood = [this.flipX(k.v[2]), k.v[3], this.flipX(k.v[0]), k.v[1]] ;
                        
                        // 3. 并获取下一个点的坐标作为终点坐标
                        var tempNextPoint = path[--i];
                        if (tempNextPoint.type === 'lineTo') {
                            tempCrood[4] = this.flipX(tempNextPoint.v[0]) ;
                            tempCrood[5] = tempNextPoint.v[1] ;
                        }else {
                            console.log('Orz.连续两个bezier哥还没开始研究') ;
                        }
                        pathFlip.push({type: k.type, v: tempCrood});

                    }else if (k.type === 'moveTo'){
                        tempCrood = [this.flipX(k.v[0]), k.v[1]] ;
                        pathFlip.push({type: 'lineTo', v: tempCrood});
                    }else {
                        tempCrood = [this.flipX(k.v[0]), k.v[1]] ;
                        pathFlip.push({type: k.type, v: tempCrood});
                    }
                }
            };

            // concat path.  concat方法不会改变现有数组，只会返回一个合并后数组的副本
            path = this.path = path.concat(pathFlip);

            // 曲线
            crood.C3 = [center[0], crood.F[1] + 15, crood.F[0], crood.F[1]]
            path.push({type: 'quadraticCurveTo', v: crood.C3}) ;

            //默认服饰时不计算比较路径
            if (type === 'base') {
                return  ;
            }

            var drawAndBegin = function () {
                pathCompare.push({type: 'stroke'}, {type: 'beginPath'});
            };

            // compare path 
            var getCompare = function (attr) {
                return dressData.calCompare('upperBody', attr) ;
            };

            // compare length
            crood.compareLong1 = [this.flipX(crood.D[0]) + 12 , center[1]] ;
            pathCompare.push({type: 'moveTo', v: crood.compareLong1});

            crood.compareLong2 = [crood.compareLong1[0] + compareLineHeight, crood.compareLong1[1]] ;
            pathCompare.push({type: 'lineTo', v: crood.compareLong2});

            drawAndBegin();

            crood.compareLong3 = [crood.compareLong1[0] + compareLineHeight/2, crood.compareLong1[1]] ;
            pathCompare.push({type: 'moveTo', v: crood.compareLong3});
            crood.compareLong4 = [crood.compareLong3[0], crood.compareLong1[1] + size.nagasa] ;
            pathCompare.push({type: 'lineTo', v: crood.compareLong4});
            drawAndBegin();

            // to fix 
            pathCompare.push({type: 'moveTo', v: crood.compareLong3});
            pathCompare.push({type: 'lineTo', v: crood.compareLong4});
            drawAndBegin();

            crood.compareLong5 = [crood.compareLong1[0] , crood.compareLong4[1] ] ;
            pathCompare.push({type: 'moveTo', v: crood.compareLong5});
            crood.compareLong6 = [crood.compareLong2[0], crood.compareLong4[1] ] ;
            pathCompare.push({type: 'lineTo', v: crood.compareLong6});

            // show compare text
            pathCompare.push({type: 'fillText', v: [i18n.dressName.nagasa + getCompare('nagasa'), crood.compareLong3[0] + 10, crood.compareLong3[1] + size.nagasa/2]});

            // TODO OPT code
            // save compare result
            var compareObj = {
                ret: Number(getCompare('nagasa')) > 0 ? '长' : '短',
                value: Math.abs(getCompare('nagasa'))
            };
            compareRet.nagasa = {
                msg: compareObj.value == 0 ? i18n.dressName.nagasa + '刚好合适, Nice' : i18n.compareMsg.nagasa.replace('$ret', compareObj.ret).replace('$value', compareObj.value) ,
                x: crood.compareLong3[0] + 10 ,
                y: crood.compareLong3[1] + size.nagasa/2 - 12,
                w: 60,
                h: 18
            } ;

            // compare shoulder
            // todo 12 compareLine和衣服的距离
            crood.compareShoulder1 = [crood.A[0], center[1] - compareLineHeight - 12] ;
            pathCompare.push({type: 'moveTo', v: crood.compareShoulder1});

            crood.compareShoulder2 = [crood.A[0], center[1] - 12] ;
            pathCompare.push({type: 'lineTo', v: crood.compareShoulder2});

            drawAndBegin();

            crood.compareShoulder3 = [crood.A[0], center[1] - compareLineHeight/2 - 12] ;
            pathCompare.push({type: 'moveTo', v: crood.compareShoulder3});

            crood.compareShoulder4 = [this.flipX(crood.A[0]), crood.compareShoulder3[1]] ;
            pathCompare.push({type: 'lineTo', v: crood.compareShoulder4});

            drawAndBegin();

            crood.compareShoulder5 = [crood.compareShoulder4[0], crood.compareShoulder1[1]] ;
            pathCompare.push({type: 'moveTo', v: crood.compareShoulder5});

            crood.compareShoulder6 = [crood.compareShoulder4[0], crood.compareShoulder2[1]] ;
            pathCompare.push({type: 'lineTo', v: crood.compareShoulder6});

            // show compare text
            pathCompare.push({type: 'fillText', v: [i18n.dressName.shoulder + getCompare('shoulder'), crood.compareShoulder3[0] + 5, crood.compareShoulder3[1] - 10]});

            // save compare result
            compareObj = {
                ret: Number(getCompare('shoulder')) > 0 ? '长' : '短',
                value: Math.abs(getCompare('shoulder'))
            };
            compareRet.shoulder = {
                msg: compareObj.value == 0 ? i18n.dressName.shoulder + '刚好合适, Nice' : i18n.compareMsg.shoulder.replace('$ret', compareObj.ret).replace('$value', compareObj.value) ,
                x: crood.compareShoulder3[0] + 5 ,
                y: crood.compareShoulder3[1] - 22 ,
                w: 60,
                h: 18
            } ;

            // todo interval:12
            // compare sleeve
            crood.compareSleeve1 = [crood.D[0] - 12, crood.D[1] - 12] ;
            pathCompare.push({type: 'moveTo', v: crood.compareSleeve1});

            crood.compareSleeve2 = [crood.compareSleeve1[0] - compareLineHeight*Msin(), crood.compareSleeve1[1] - compareLineHeight*Msin()] ;
            pathCompare.push({type: 'lineTo', v: crood.compareSleeve2});

            drawAndBegin();

            crood.compareSleeve3 = [crood.compareSleeve1[0] - compareLineHeight*Msin()/2, crood.compareSleeve1[1] - compareLineHeight*Msin()/2] ;
            pathCompare.push({type: 'moveTo', v: crood.compareSleeve3});

            crood.compareSleeve5 = [crood.A[0] - 12, crood.A[1] - 12] ;
            crood.compareSleeve6 = [crood.compareSleeve5[0] - compareLineHeight*Msin(), crood.compareSleeve5[1] - compareLineHeight*Msin()] ;

            crood.compareSleeve4 = [crood.compareSleeve5[0] - compareLineHeight*Msin()/2, crood.compareSleeve5[1] - compareLineHeight*Msin()/2] ;
            pathCompare.push({type: 'lineTo', v: crood.compareSleeve4});

            drawAndBegin();

            pathCompare.push({type: 'moveTo', v: crood.compareSleeve5});
            pathCompare.push({type: 'lineTo', v: crood.compareSleeve6});

            //pathCompare.push({type: 'transform', v: [1,0,0,1,0,0]});
            //pathCompare.push({type: 'rotate', v: [-Math.PI/4]});
            pathCompare.push({type: 'fillText', v: [i18n.dressName.sleeve + getCompare('sleeve'), crood.compareSleeve3[0] - 0, crood.compareSleeve3[1] - 70]});

            // save compare result
            compareObj = {
                ret: Number(getCompare('sleeve')) > 0 ? '长' : '短',
                value: Math.abs(getCompare('sleeve'))
            };
            compareRet.sleeve = {
                msg: compareObj.value == 0 ? i18n.dressName.sleeve + '刚好合适, Nice' : i18n.compareMsg.sleeve.replace('$ret', compareObj.ret).replace('$value', compareObj.value) ,
                x: crood.compareSleeve3[0] ,
                y: crood.compareSleeve3[1] - 82 ,
                w: 60,
                h: 18
            } ;

            //compare waist
            crood.compareWaist1 = [crood.G[0] , crood.G[1] + 12] ;
            pathCompare.push({type: 'moveTo', v: crood.compareWaist1});

            crood.compareWaist2 = [crood.compareWaist1[0] , crood.compareWaist1[1] + 12] ;
            pathCompare.push({type: 'lineTo', v: crood.compareWaist2});

            drawAndBegin();

            crood.compareWaist3 = [crood.compareWaist1[0] , crood.compareWaist1[1] + 6] ;
            pathCompare.push({type: 'moveTo', v: crood.compareWaist3});
            crood.compareWaist4 = [this.flipX(crood.G[0]) , crood.compareWaist3[1] ] ;
            pathCompare.push({type: 'lineTo', v: crood.compareWaist4});

            drawAndBegin();

            crood.compareWaist5 = [crood.compareWaist4[0] , crood.compareWaist1[1]] ;
            pathCompare.push({type: 'moveTo', v: crood.compareWaist5});
            crood.compareWaist6 = [crood.compareWaist4[0] , crood.compareWaist2[1]] ;
            pathCompare.push({type: 'lineTo', v: crood.compareWaist6});

            pathCompare.push({type: 'fillText', v: [i18n.dressName.waist + getCompare('waistOrigin'), crood.compareWaist1[0] + 5, crood.compareWaist2[1] + 10]});

            // save compare result
            compareObj = {
                ret: Number(getCompare('waistOrigin')) > 0 ? '大' : '小',
                value: Math.abs(getCompare('waistOrigin'))
            };
            compareRet.waist = {
                msg: compareObj.value == 0 ? i18n.dressName.waist + '刚好合适, Nice' : i18n.compareMsg.waist.replace('$ret', compareObj.ret).replace('$value', compareObj.value) ,
                x: crood.compareWaist1[0] ,
                y: crood.compareWaist1[1] + 8 ,
                w: 60,
                h: 18
            } ;

        }
    },

    // 实际尺寸和像素比例 
    ratio: 4,

    calCompare: function (type, attr) {
        var ret = ((this[type].size.custom[attr] - this[type].size.base[attr])/this.ratio).toFixed(1) ;
        return ret > 0 ? ' +' + ret : ' ' + ret ;
    },

    handle: function (D) {
        if (!D) {
            return  ;
        }
        var data = $extend({}, D) ;

        // 保留原始数据，方便对比
        data['waistOrigin'] = data['waist'] ;
        //TODO  默认身体厚度10cm 扔到dressData对象中
        data['waist'] = (data['waist']/2 - 10) ;
        // 指定默认袖围 10
        data['sleeveWidth'] = 10 ;
        for (var i in data) {
            data[i] = data[i]* this.ratio ;
        }


        return data ;
    },

    // init 
    init: function (canvasType, dressType, oData) {
        var me = this; 

        // handle data
        var data = me.handle(oData);

        $extend(me[dressType].size.custom, data);
        me[dressType].transform(canvasType);

        // 如果是用户合适的衣服参数，则保存到base属性中
        if (canvasType === 'base') {
            $extend(me[dressType].size.base, me[dressType].size.custom);
        }
        return {
            canvasType: canvasType,
            path: me[dressType].path,
            pathCompare: me[dressType].pathCompare
        };
    }
};


/**
 * 建模内核-Dv
 *
 * @params
 **/

var Dv = {
    el: null ,
    c: null , 

    setCanvas: function () {
        this.el.setAttribute('width', this.config.width) ;
        this.el.setAttribute('height', this.config.height) ;
    },

    config:  {
        id: 'c',
        width: 500,
        height: 500,
        cap: 'round',
        join: 'round',
        lineWidth: 2
    },

    styleConfig: {
        base: {
            fillStyle: '#C2C2C2',
            strokeStyle: '#C2C2C2'
        },
        custom: {
            fillStyle: 'rgba(0, 153, 238, 0.2)',
            strokeStyle: '#0099EE'
        },
        compare: {
            lineWidth: 2,
            fillStyle: '#0099EE',
            strokeStyle: '#0099EE'
        }
    },

    render: function (oPath) {
        var c = this.c ,
            me = this ,
            config = me.config ;

        me.initDraw(oPath.canvasType);
        c.save();
        c.beginPath();  

        // render custom path
        for (i = 0, k = null; k = oPath.path[i] ; i++ ) {
            c[k.type] && (c[k.type].apply(c, k.v || []));
        }
        c.closePath();
        c.fill();         
        c.stroke();         
        
        c.restore();

        // show compare
        if (oPath.canvasType ==='custom') {
            me.compare(oPath, 'compare');
        }
    },

    compare: function (oPath, canvasType) {
        var c = this.c ,
            me = this ,
            config = me.config ;

        me.initDraw(canvasType);

        c.font = '12px Arial' ;
        c.save();
        c.beginPath();  

        // render compare path
        for (i = 0, k = null; k = oPath.pathCompare[i] ; i++ ) {
            c[k.type] && (c[k.type].apply(c, k.v || []));
        }

        c.stroke();         
        c.restore();
    },

    clear: function () {
        this.c.clearRect(0,0, this.config.width, this.config.height);
    },

    initDraw: function (style) {
        var c = this.c ,
            config = this.config ;
        $extend(this.config, this.styleConfig[style]);

        c.lineCap = config.cap;
        c.lineJoin = config.join;
        c.lineWidth = config.lineWidth;
        c.fillStyle = config.fillStyle ;
        c.strokeStyle = config.strokeStyle ;
    },

    init: function (v) {
        $extend(this.config, v) ;

        this.el = document.getElementById(this.config.id);
        if (!this.el) {
            return false ;
        }
        this.c = this.el.getContext('2d');
        this.setCanvas();
    }
}; 

// init Model
var Model = {
    configRendered: {
        base:null,
        custom:null
    },
    render: function (v) {
        this.configRendered[v['renderType']] = v ;
        Dv.clear();

        function draw(v) {
            var p = dressData.init(v['renderType'], v['dressType'], v['data']) ;
            Dv.render(p, v['renderType']) ;
        }
        this.configRendered.base && draw(this.configRendered.base) ;
        this.configRendered.custom && draw(this.configRendered.custom) ;

        // show compare description
        canvasMouseEvt.init() ;
    }
}

if (DebugMode) {
    Dv.init({
        id: 'c',
        width:450,
        height:300
    });
    Model.render({
        renderType: 'base',
        dressType: 'upperBody',
        data: {
            nagasa: 60,
            shoulder:37,
            waist: 80,
            sleeve: 59
        }
    });

    Model.render({
        renderType: 'custom',
        dressType: 'upperBody',
        data: {
            nagasa: 62,
            shoulder:42,
            waist: 85,
            sleeve: 59
        }
    });
}

