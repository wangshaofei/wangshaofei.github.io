/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
}));

/**
 * xParallax 
 *
 * @author alextang
 * @date 2013-11-13
 **/
(function (window,$) {
    var xParallax = {} ;
    window.xParallax = xParallax ;

    var config = {
        // 暂时没用到
        direction: 'horizontal',
        speed: 1000,
        curStage: 1 ,
        nextStage: null ,
        maxStage: 3,
        //xParallax的状态，1表示可用，0表示禁用
        status: 1,
        loaded: 0,
        //xParallax容器
        parallaxBox: 'parallaxWrap',

        // 状态栏参数
        statusId: 'parallaxStatus',
        statusChildNodeName: 'li'
    };
    var _cache = {} ;

    /**
     * autoHeight
     *
     * @params
     **/
    function parallaxAutoHeight() {
        $('#' + config.parallaxBox).css({
            //todo 
            // get height of head and foot
            height: $(window).height() - 67 - 100 + 'px'
        })
    }

    // init
    xParallax.init = function () {
        //parallaxAutoHeight();

        // 重新动态计算元素位置（基于百分比）
        var elBg = $('div[data-pstage=' + config.curStage + ']');

        elBg.find('img[data-pchild]').each(function (i ,el) {
            $(el).css({
                left: $(window).width()/2 - $(this).data('pos') + 'px'
            })
        }).end().show() ;


        $(window).load(function () {
            config.loaded = 1;
        });
    };

    // 检查是否有动画在执行
    function checkAnimated() {
        if (!_cache['xParallaxAnimated']) {
            _cache['xParallaxAnimated'] = $('img[data-pchild]') ;
        }
        return _cache['xParallaxAnimated'].filter(':animated').length > 0 ? 1 : 0 ;
    }

    $(window).mousewheel(function (evt, delta, deltaX, deltaY) {
        // 如果有动画正在进行，则不响应
        if (checkAnimated() || config.loaded == 0) {
            return  ;
        }

        doneScroll(deltaY);
    });

    /**
     * 响应键盘按键事件
     *
     * @param {String} name theNameOfPerson
     * @return return something
     **/
    (function () {
        $(window).keyup(function (e) {
            if (checkAnimated() || config.loaded == 0) {
                return ;
            }

            var keyCode = e.keyCode ;
            if (keyCode == 37) {
                doneScroll(1);
            }else if (keyCode == 39 || keyCode == 32){
                doneScroll(-1);
            }
        });
    })();
    
    // wheel
    config.wheelStep = $(window).width()/10 ;
    // canvas
    config.canvasId = 'xCanvas';
    _cache.canvas = $('#' + config.canvasId) ;

    // mousewheel and run canvasMove
    function canvasMove(dir) {
        _cache.canvas.animate({
            left: '+=' + dir * config.wheelStep
        });
    }

    // slice
    function triggerSlice (dir) {
        var curStage = Math.ceil(Math.abs(_cache.canvas.css('left')) / $(window).width() );
        sliceMove(dir ,curStage, curStage +1);
    }
    // slice move
    function sliceMove (dir, curStage, nextStage) {
        // init pos
        // get speed

        // todo cache els
        els.animate({
            left: '+=' + dir * singleSpeed
        })
    }
    // 根据相对位置参数计算slice位置
    function getSlicePos (n) {
        // body...
        return  ;
    }

    /**
     * done mousewheel scroll event 
     *
     * @param {String} deltaY mouse direction arg
     **/
    function doneScroll(deltaY) {
        var mouseDir = deltaY > 0 ? 'backward' : 'forward' ;
        if (mouseDir == 'forward') {
            config.nextStage = config.curStage + 1 ;
        }else {
            config.nextStage = config.curStage - 1 ;
        }

        // 不能超过指定场景
        // todo 到最后一个场景后继续forward时是否要回到第一个场景
        if (config.nextStage < 1 || config.nextStage > config.maxStage) {
            config.status = 0 ;
        }else {
            config.status = 1 ;
        }

        if (config.status) {
            stageChange(mouseDir);
            console.debug('current stage : ' + config.curStage, 'next stage : '  + config.nextStage);

            // update status bar
            updateStatus(config.nextStage);

            config.curStage = config.nextStage ;
            config.nextStage = null;
        }else {
            console.log('overflowed') ;
        }
    };

    /**
     * get stage animation and then invoke them
     *
     * @param {String} dir mouse direction
     **/
    function stageChange(dir) {
        var stageAnim = getStageAnim(dir);

        stageAnim[0]();

        setTimeout(function () {
            stageAnim[1]();
        }, 200);
    }

    /**
     * get stage change animation function
     *
     * @param {String} dir mouse direction
     * @return {Array} return animations
     **/
    function getStageAnim(dir) {
        var elOut = 'stage' + config.curStage + '_out_' + (dir == 'forward' ? 'L' : 'R') ,
            elIn = 'stage' + config.nextStage + '_in_' + (dir == 'forward' ? 'R' : 'L') ;

        if (!_cache[elOut]) {
            // 根据dir选择不同的动作
            var flagOut = dir == 'forward' ? '-' : '' ;
            _cache[elOut] = (function (curStage) {
                return function () {
                    var elBg = $('div[data-pstage=' + curStage + ']');
                    var elLength = elBg.find('img[data-pchild]').length ;

                    elBg.find('img[data-pchild]').each(function (i ,el) {
                        $(el).animate({
                            left: flagOut + '100%'
                        }, config.speed * $(this).data('deep'), '', function () {
                            if (i == elLength - 1) {
                                elBg.hide();
                            }
                        });
                    });
                } ;
            })(config.curStage);
        }
        if (!_cache[elIn]) {
            var flagIn = dir == 'forward' ? '' : '-' ;

            _cache[elIn] = (function (nextStage) {
                return function () {
                    var elBg = $('div[data-pstage=' + nextStage + ']');
                    // init position and then display them
                    elBg.find('img[data-pchild]').css({
                        left: flagIn + '100%'
                    }).end().show();

                    elBg.find('img[data-pchild]').each(function (i ,el) {
                        $(el).animate({
                            left: $(window).width()/2 - $(this).data('pos') + 'px'
                        }, config.speed * $(this).data('deep'));
                    });
                } ;
            })(config.nextStage);
        }

        return [_cache[elOut], _cache[elIn]] ;
    }

    var st ;
    $(window).resize(function () {
        // todo opt
        if (st) {
            clearTimeout(st);
        }
        
        st = setTimeout(function () {
            resizeLoad();
        }, 100);
    })

    function resizeLoad() {
        // console.log('resize invoked');

        parallaxAutoHeight();

        var elBg = $('div[data-pstage=' + config.curStage + ']');
            
        elBg.find('img[data-pchild]').each(function (i ,el) {
            $(el).animate({
                left: $(window).width()/2 - $(this).data('pos') + 'px'
            }, 300);
        });
    }

    /**
     * update status bar
     *
     * @param {String} name theNameOfPerson
     **/
    function updateStatus(index) {
        $('#' +config.statusId + ' ' + config.statusChildNodeName).removeClass('on').eq(--index).addClass('on');
    }
    
})(window, window.jQuery);
