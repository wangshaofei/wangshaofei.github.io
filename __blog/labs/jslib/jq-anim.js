$.fn.extend(
    animate: function( prop, speed, easing, callback ) {
        var optall = jQuery.speed(speed, easing, callback);

        if ( jQuery.isEmptyObject( prop ) ) {
            return this.each( optall.complete );
        }

        return this[ optall.queue === false ? "each" : "queue" ](function() {
            // XXX 'this' does not always have a nodeName when running the
            // test suite

            var opt = jQuery.extend({}, optall), p,
                isElement = this.nodeType === 1,
                hidden = isElement && jQuery(this).is(":hidden"),
                self = this;

            for ( p in prop ) {
                var name = jQuery.camelCase( p );

                if ( p !== name ) {
                    prop[ name ] = prop[ p ];
                    delete prop[ p ];
                    p = name;
                }

                if ( prop[p] === "hide" && hidden || prop[p] === "show" && !hidden ) {
                    return opt.complete.call(this);
                }

                if ( isElement && ( p === "height" || p === "width" ) ) {
                    opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

                    // Set display property to inline-block for height/width
                    // animations on inline elements that are having width/height
                    // animated
                    if ( jQuery.css( this, "display" ) === "inline" &&
                            jQuery.css( this, "float" ) === "none" ) {
                        if ( !jQuery.support.inlineBlockNeedsLayout ) {
                            this.style.display = "inline-block";

                        } else {
                            var display = defaultDisplay(this.nodeName);

                            // inline-level elements accept inline-block;
                            // block-level elements need to be inline with layout
                            if ( display === "inline" ) {
                                this.style.display = "inline-block";

                            } else {
                                this.style.display = "inline";
                                this.style.zoom = 1;
                            }
                        }
                    }
                }

                if ( jQuery.isArray( prop[p] ) ) {
                    // Create (if needed) and add to specialEasing
                    // colin 不知道他怎么处理数组属性
                    (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
                    prop[p] = prop[p][0];
                }
            }

            if ( opt.overflow != null ) {
                this.style.overflow = "hidden";
            }

            // colin 不明白这样的扩展有什么意义
            opt.curAnim = jQuery.extend({}, prop);

            jQuery.each( prop, function( name, val ) {
                // colin 这里得到了什么
                // DOM , 属性集合, 属性名
                var e = new jQuery.fx( self, opt, name );

                if ( rfxtypes.test(val) ) {
                    e[ val === "toggle" ? hidden ? "show" : "hide" : val ]( prop );

                } else {
                    var parts = rfxnum.exec(val),
                        start = e.cur() || 0;

                    if ( parts ) {
                        var end = parseFloat( parts[2] ),
                            unit = parts[3] || "px";

                        // We need to compute starting value
                        if ( unit !== "px" ) {
                            jQuery.style( self, name, (end || 1) + unit);
                            start = ((end || 1) / e.cur()) * start;
                            jQuery.style( self, name, start + unit);
                        }

                        // If a +=/-= token was provided, we're doing a relative animation
                        if ( parts[1] ) {
                            end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                        }

                        e.custom( start, end, unit );

                    } else {
                        e.custom( start, val, "" );
                    }
                }
            });

            // For JS strict compliance
            return true;
        });
    },

    stop: function( clearQueue, gotoEnd ) {
        var timers = jQuery.timers;

        if ( clearQueue ) {
            this.queue([]);
        }

        this.each(function() {
            // go in reverse order so anything added to the queue during the loop is ignored
            for ( var i = timers.length - 1; i >= 0; i-- ) {
                if ( timers[i].elem === this ) {
                    if (gotoEnd) {
                        // force the next step to be the last
                        timers[i](true);
                    }

                    timers.splice(i, 1);
                }
            }
        });

        // start the next in the queue if the last step wasn't forced
        if ( !gotoEnd ) {
            this.dequeue();
        }

        return this;
    }
);

// 扩展
jQuery.extend({
    // @param speed {string,number,object} 速度 
    // @param easing {function}  缓冲函数
    // @param fn {function} callback
    // @return opt{object} 对象中有callbakc， duration， easing
    speed: function( speed, easing, fn ) {
        var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
            complete: fn || !fn && easing || jQuery.isFunction( speed ) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
        };

        opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
            opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

        // 是否用队列机制
        // Queueing
        opt.old = opt.complete;
        opt.complete = function() {
            if ( opt.queue !== false ) {
                jQuery(this).dequeue();
            }
            if ( jQuery.isFunction( opt.old ) ) {
                opt.old.call( this );
            }
        };

        return opt;
    },

    // @return {function} 一个缓冲函数
    easing: {
        linear: function( p, n, firstNum, diff ) {
            return firstNum + diff * p;
        },
        swing: function( p, n, firstNum, diff ) {
            return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
        }
    },

    // {array} 定时器
    timers: [],

    // 把DOM， 属性，其他选项都放到fx中 
    // 为了这一句 var e = new jQuery.fx( self, opt, name );
    fx: function( elem, options, prop ) {
        this.options = options;
        this.elem = elem;
        this.prop = prop;

        if ( !options.orig ) {
            options.orig = {};
        }
    }

});

jQuery.fx.prototype = {
    // Simple function for setting a style value
    update: function() {
        if ( this.options.step ) {
            this.options.step.call( this.elem, this.now, this );
        }

        (jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
    },

    // Get the current size
    cur: function() {
        if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
            return this.elem[ this.prop ];
        }

        var r = parseFloat( jQuery.css( this.elem, this.prop ) );
        return r && r > -10000 ? r : 0;
    },

    // Start an animation from one number to another
    custom: function( from, to, unit ) {
        var self = this,
            fx = jQuery.fx;

        this.startTime = jQuery.now();
        this.start = from;
        this.end = to;
        this.unit = unit || this.unit || "px";
        this.now = this.start;
        this.pos = this.state = 0;

        function t( gotoEnd ) {
            return self.step(gotoEnd);
        }

        t.elem = this.elem;

        if ( t() && jQuery.timers.push(t) && !timerId ) {
            timerId = setInterval(fx.tick, fx.interval);
        }
    },
    // Each step of an animation
    step: function( gotoEnd ) {
        var t = jQuery.now(), done = true;

        if ( gotoEnd || t >= this.options.duration + this.startTime ) {
            this.now = this.end;
            this.pos = this.state = 1;
            this.update();

            this.options.curAnim[ this.prop ] = true;

            for ( var i in this.options.curAnim ) {
                if ( this.options.curAnim[i] !== true ) {
                    done = false;
                }
            }

            if ( done ) {
                // Reset the overflow
                if ( this.options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {
                    var elem = this.elem,
                        options = this.options;

                    jQuery.each( [ "", "X", "Y" ], function (index, value) {
                        elem.style[ "overflow" + value ] = options.overflow[index];
                    } );
                }

                // Hide the element if the "hide" operation was done
                if ( this.options.hide ) {
                    jQuery(this.elem).hide();
                }

                // Reset the properties, if the item has been hidden or shown
                if ( this.options.hide || this.options.show ) {
                    for ( var p in this.options.curAnim ) {
                        jQuery.style( this.elem, p, this.options.orig[p] );
                    }
                }

                // Execute the complete function
                this.options.complete.call( this.elem );
            }

            return false;

        } else {
            var n = t - this.startTime;
            this.state = n / this.options.duration;

            // Perform the easing function, defaults to swing
            var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
            var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
            // very important
            this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
            this.now = this.start + ((this.end - this.start) * this.pos);
            


            // Perform the next step of the animation
            this.update();
        }

        return true;
    }
};

jQuery.extend( jQuery.fx, {
    tick: function() {
        var timers = jQuery.timers;

        for ( var i = 0; i < timers.length; i++ ) {
            if ( !timers[i]() ) {
                timers.splice(i--, 1);
            }
        }

        if ( !timers.length ) {
            jQuery.fx.stop();
        }
    },

    interval: 13,

    stop: function() {
        clearInterval( timerId );
        timerId = null;
    },

    speeds: {
        slow: 600,
        fast: 200,
        // Default speed
        _default: 400
    },

    step: {
        opacity: function( fx ) {
            jQuery.style( fx.elem, "opacity", fx.now );
        },

        _default: function( fx ) {
            if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
                fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
            } else {
                fx.elem[ fx.prop ] = fx.now;
            }
        }
    }
});