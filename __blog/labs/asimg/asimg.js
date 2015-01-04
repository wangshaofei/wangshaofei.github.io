// define css template 
var __cssTemplate = '\
.<%=name%> {\n\
    width:<%=w%>px;\n\
    height:<%=h%>px;\n\
    background-position:-<%=x%>px -<%=y%>px;\n\
}\n\
';

function copySuccess (argument) {
    $('#copyRet').fadeIn();
    setTimeout(function () {
        $('#copyRet').fadeOut();
        $('#copyShadow').show();
    }, 1800);
}

$(function () {
    // show copy btn
    var elCopyBtn = $('#copyBtn') ,
        elCopyShadow = $('#copyShadow'),
        tmpCodeStr= '';
        elPre = $('#target_css') ;

    $('body').click(function () {
        elCopyShadow.show();
    });

    elCopyShadow.mouseover(function () {
        tmpCodeStr = elPre.html() ;
        document.copySwf.sendToActionScript(tmpCodeStr);
        elCopyShadow.hide();
    });
    
});

(function(namespace) {
    var namespace = window[namespace] = {};
    var config = {
        //layout
        canvas_width: 860,
        canvas_height: 600,
        //packer
        packer_mode : 'bintree',
        //magnet
        if_magnet : true,
        magnet_distance: 8,
        //zoom
        if_zoom : true,
        zoom_pixel : true,
        zoom: 2,
        zoom_radius: 200,
        //css template
        absolute_path: 'http://static.gtimg.com/icson/img/index/asprite.png',
        relative_path: '',
        template: __cssTemplate
    };
    var picture_height, picture_width;
    var canvas = document.getElementById('canvas');
    var zoom_canvas = document.getElementById("zoom_canvas");
    var zoom_context = zoom_canvas.getContext("2d");
    var context = canvas.getContext("2d");
    var imgObjects = []; //x y w h ix iy iw ih...

    // shadow
    var showModal = function (el) {
        if (!document.getElementById('enixShadow')) {
            var tempShadow = document.createElement('div');
            tempShadow.setAttribute('id', 'enixShadow') ;
            document.body.appendChild(tempShadow) ;
            $('#enixShadow').css({
                'position': 'fixed',
                'display': 'none',
                'top':0,
                'left':0,
                'width':'100%',
                'height':'100%',
                'background':'rgba(0,0,0,.4)'
            })
        }
        $('#enixShadow').css({'z-index': 10000}).show();
        $(el).css({'z-index': 10001}).fadeIn();
    };
    var hideModal = function (el) {
        $(el).hide();
        $('#enixShadow').hide();
    }


    // init func
    $('#setCssTemplate').click(function () {
        var el = $('#css_html_template');
        el.css({ 'margin-top': '-' + el.height()/2 + 'px' });
        showModal(el);
    });
    $('#cssTemplateX').click(function () {
        hideModal($(this).parent());
    });

    $('#retCanvas').click(function () {
        $('#result').fadeOut(function () {
            $('#canvasArea').show();
        });
    });

    //Zoomer
    var zoomer = (function() {
        var l, t; //mouse position
        var init = function() {
            zoom_canvas.style.display = 'block';
        };
        var pixelZoom = function(sx, sy, sw, sh, tx, ty, tw, th) {
            var sdata = context.getImageData(sx, sy, sw, sh).data;
            var target = context.createImageData(tw, th);
            var tdata = target.data;
            var mapx = [];
            var ratiox = sw / tw, px = 0;
            for (var i = 0; i < tw; ++i) {
                mapx[i] = 4 * Math.floor(px);
                px += ratiox;
            }
            var mapy = [];
            var ratioy = sh / th, py = 0;
            for (var i = 0; i < th; ++i) {
                mapy[i] = 4 * sw * Math.floor(py);
                py += ratioy;
            }
            var tp = 0;
            for (py = 0; py < th; ++py) {
                for (px = 0; px < tw; ++px) {
                    var sp = mapx[px] + mapy[py];
                    tdata[tp++] = sdata[sp++];
                    tdata[tp++] = sdata[sp++];
                    tdata[tp++] = sdata[sp++];
                    tdata[tp++] = sdata[sp++];
                }
            }
            zoom_context.putImageData(target, tx, ty);
        }

        var snap = function() {
            if(!mousedown || !config.if_zoom) {
                return;
            }
            var r = config.zoom_radius;
            var z = config.zoom;
            zoomer.clear();
            if(config.zoom_pixel) {
                var sr = Math.floor(r / z);
                var sw = sr * 2;
                var sh = sr * 2;
                var tw = 2 * r; //reduce the target width and target height to make it faster
                var th = 2 * r; //reduce the target width and target height to make it faster
                var shiftX = l - sr;
                var shiftY = t - sr;
                pixelZoom(shiftX, shiftY, sw, sh, l, t, tw, th);//now the loop always be 2R
            }
            zoom_context.globalCompositeOperation = 'destination-in'; //set
            zoom_context.beginPath();
            zoom_context.arc(l + r, t + r, r, 2*Math.PI, false);
            zoom_context.fill();
            zoom_context.globalCompositeOperation = 'source-over'; //restore 

        }
        var clear = function(){
            zoom_context.clearRect(0, 0, config.canvas_width * config.zoom, config.canvas_height * config.zoom);
        };
        var setXY = function(x, y){
            l = parseInt(x);
            t = parseInt(y);
        };
        var destory = function(){
            clear();
            zoom_canvas.style.display = 'none';
            zoom_canvas_bg.style.display = 'none';
        };
        return {
            setXY : setXY,
            snap: snap,
            destory: destory,
            clear: clear,
            init: init
        }
    })();

    var refresh = function() {
        clear();
        imgObjects.map(function(o) {
            context.drawImage(o.el, o.x, o.y);
        });
        if(drawCallBack) {
            drawCallBack();
        }
        zoomer.snap();
    };

    var resetCanvas = function() {
        canvas.height = config.canvas_height;
        canvas.width  = config.canvas_width;
        zoom_canvas.height = config.canvas_height * 2;
        zoom_canvas.width = config.canvas_width * 1;
        refresh();
    }

    var makeImgAndCss = function() {
        if(!imgObjects.length) {
            return;
        }
        canvasSizeCaculate();
        resetCanvasSize();

        refresh();
        dataURL = canvas.toDataURL();
        var img = new Image();
        img.src = dataURL;
        getEl('png_link').href = dataURL.replace('data:image/','data:image/');
        document.getElementById('img').innerHTML = '';
        document.getElementById('img').appendChild(img);
        resetCanvasSize(config.canvas_width, config.canvas_height);
        refresh();
        // add img path str  by enix
        var asimg_path = '',
            asimg_comma = '';
        var css_pices = [];
        imgObjects.map(function(o){
            var css_pice = template(config.template, {w:o.w, h:o.h, x:o.x, y:o.y, absolute_path:config.absolute_path, name:o.name.split('.')[0], relative_path:config.relative_path});
            css_pices.push(css_pice);
            asimg_path += (asimg_comma + '.' + o.name.split('.')[0] );
            asimg_comma = ',\n';
        });
        var css_text = css_pices.join('').split('[enter]').join('\n')
        asimg_path += ' {background-image:url(' + config.absolute_path + ');background-repeat:no-repeat;}\n';
        getEl('css_link').href = 'data:text/css;base64,' + encodeBase64(css_text);
        getEl('target_css').innerHTML = asimg_path + XssDefender(css_text);
    }
    var XssDefender = function(s) {
        s = s.replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
        return s;
    };
    var resetCanvasSize = function(w, h) {
        if (!w && !h) {
            canvas.width = picture_width;
            canvas.height = picture_height;
        }else {
            canvas.width = w;
            canvas.height = h;
        }
    };
    var clear = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    var save = function() {

    };
    var posCaculate = function(){};

    /**
     * bin packer
     *
     * @source https://github.com/jakesgordon/bin-packing
     **/
    var packers = (function(){
        var binPacker = function(w, h) {
            this.init(w, h);
        };
        binPacker.prototype = {
            init: function(w, h) {
                this.root = {x:0, y:0, w:w, h:h};
            },
            fit: function(objs) {
                var node, _this = this;
                var s;
                objs.map(function(o, i){
                    if (node = _this.findNode(_this.root, o.w, o.h)) {
                        var fit = _this.splitNode(node, o.w, o.h);
                        o.x = fit.x;
                        o.y = fit.y;
                    }else {
                        s = true;
                    }
                });
                if(s) {
                    return {error:'notfind'}
                }else {
                    return {};
                }
            },
            findNode: function(node, w, h) {
                if (node.used) {
                    return this.findNode(node.right, w, h) || this.findNode(node.down, w, h);
                }
                else if ((w <= node.w) && (h <= node.h)) {
                    return node;
                }
                else {
                    return null;
                }
            },
            splitNode: function(node, w, h) {
                node.used = true;
                node.down = {x:node.x, y:node.y + h, w:node.w, h:node.h - h};
                node.right = {x:node.x+w, y:node.y, w: node.w-w, h:h};
                return node;
            }
        };
        var binGrowPacker = function() { };
        binGrowPacker.prototype = {
            fit: function(objs) {
                var node, len = objs.length, _this = this;
                var w = len? objs[0].w : 0;
                var h = len? objs[0].h : 0;
                this.root = { x: 0, y: 0, w: w, h: h };
                objs.map(function(o, i){
                    if (node = _this.findNode(_this.root, o.w, o.h)) {
                        var fit = _this.splitNode(node, o.w, o.h);
                        o.x = fit.x;
                        o.y = fit.y;
                    }
                    else {
                        var fit = _this.growNode(o.w, o.h);
                        o.x = fit.x;
                        o.y = fit.y;
                    }
                });
                return this.root;
            },
            findNode: function(node, w, h) {
                if (node.used) {
                    return this.findNode(node.right, w, h) || this.findNode(node.down, w, h);
                }
                else if ((w <= node.w) && (h <= node.h)) {
                    return node;
                }
                else {
                    return null;
                }
            },
            splitNode: function(node, w, h) {
                node.used = true;
                node.down  = { x: node.x,     y: node.y + h, w: node.w,     h: node.h - h };
                node.right = { x: node.x + w, y: node.y,     w: node.w - w, h: h          };
                return node;
            },
            growNode: function(w, h) {
                var canGrowRight = (h <= this.root.h);
                var canGrowDown  = (w <= this.root.w);
                var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w));
                var shouldGrowDown  = canGrowDown  && (this.root.w >= (this.root.h + h)); 
                if (shouldGrowRight) {
                    return this.growRight(w, h);
                }
                else if (shouldGrowDown) {
                    return this.growDown(w, h);
                }
                else if (canGrowRight) {
                    return this.growRight(w, h);
                }
                else if (canGrowDown) {
                    return this.growDown(w, h);
                }
            },
            growRight: function(w, h) {
                this.root = {
                    used: true,
                    x: 0,
                    y: 0,
                    w: this.root.w + w,
                    h: this.root.h,
                    down: this.root.down,
                    right: { x: this.root.w, y: 0, w: w, h: this.root.h }
                };
                node = this.findNode(this.root, w, h);
                return this.splitNode(node, w, h);
            },
            growDown: function(w, h) {
                this.root = {
                    used: true,
                    x: 0,
                    y: 0,
                    w: this.root.w,
                    h: this.root.h + h,
                    down:  { x: 0, y: this.root.h, w: this.root.w, h: h },
                    right: this.root.right
                };
                node = this.findNode(this.root, w, h);
                return this.splitNode(node, w, h);
            }
        };
        return {
            'bintree': function() {
                resetCanvas();
                var packer = new binPacker(config.canvas_width, config.canvas_height);
                imgObjects.sort(function(a,b){
                    if(b.h-a.h!=0) {
                        return b.h-a.h;
                    }else {
                        return a.w-b.w;
                    }
                })
                var ret = packer.fit(imgObjects);
                if(ret.error) {
                    alert('not fit!');
                }
            },
            'vertical': function() {
                resetCanvas();
                var h_diff = 0;
                imgObjects.map(function(o, i, all) {
                    o.y = h_diff;
                    o.x = 0;
                    h_diff += o.h;
                });
                if(h_diff > config.canvas_height) {
                    alert('not fit!');
                }
            },
            'bintreeGrow': function() {
                var packer = new binGrowPacker();
                if(!imgObjects.length) return;
                imgObjects.sort(function(a,b){
                    if(b.h-a.h!=0) {
                        return b.h-a.h;
                    }else {
                        return a.w-b.w;
                    }
                })
                var root = packer.fit(imgObjects);
                config.canvas_width = root.w;
                config.canvas_height = root.h;
                resetCanvas();
                getEl('canvas_width').value = config.canvas_width;
                getEl('canvas_height').value = config.canvas_height;
            },
            'Minimize': function() {
                resetCanvas();
                var autoPacker = new binGrowPacker();
                if(!imgObjects.length) return;
                imgObjects.sort(function(a,b){
                    if(b.h-a.h!=0) {
                        return b.h-a.h;
                    }else {
                        return a.w-b.w;
                    }
                });
                var maxWidth = imgObjects.reduce(function(a, b){ 
                    if(a.w > b.w) {
                        return a;
                    }
                    return b;
                }).w;
                var firstTry = autoPacker.fit(imgObjects);
                var totalWidth = firstTry.w;
                var totalHeight = firstTry.h;
                var area = totalHeight * totalWidth;
                var tw, th;
                var p, ret;
                while(totalWidth-- > maxWidth) {
                    p = new binPacker(totalWidth, totalHeight);
                    ret = p.fit(imgObjects);
                    if(ret.error) {
                        while(ret.error) {
                            p = new binPacker(totalWidth, totalHeight);
                            ret = p.fit(imgObjects);
                            totalHeight++;
                        }
                    }
                    if(totalWidth * totalHeight < area) {
                        area = totalHeight * totalWidth;
                        tw = totalWidth;
                        th = totalHeight;
                    }
                }
                (new binPacker(tw, th)).fit(imgObjects);
                config.canvas_width = tw;
                config.canvas_height = th;
                resetCanvas();
                getEl('canvas_width').value = config.canvas_width;
                getEl('canvas_height').value = config.canvas_height;
            }
        }
    })();

    var canvasSizeCaculate = function() {
        var max_width = imgObjects.reduce(function(a, b) {
            return a.w + a.x > b.w + b.x ? a : b;
        });
        var max_height = imgObjects.reduce(function(a, b) {
            return a.h + a.y > b.h + b.y ? a : b;
        });
        picture_height = max_height.h + max_height.y;
        picture_width = max_width.w + max_width.x;
    }
    
    zoom_canvas.ondragenter = canvas.ondragenter = function() {
        return false;
    };

    zoom_canvas.ondragover= canvas.ondragover = function() {
        return false;
    };

    zoom_canvas.ondrop = canvas.ondrop = function(e) {
        var files = e.dataTransfer.files;
        for(var i=0;i<files.length;i++) {
            var f = files[i];
            var numbers = files.length;
            if(f.type.indexOf('image') == 0) {
                (function(f) {
                    var name = f.name,
                        type = f.type;
                    if(typeof FileReader == 'undefined') {
                        alert('Sorry, FileReader() not supported, switch to Chrome and try again.')
                    }
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var dataURL = e.target.result;
                        var imgEL = new Image();
                        imgEL.onload = function(e) {
                            var w,h;
                            // add gap 
                            w = parseInt(imgEL.width) + 10;
                            h = parseInt(imgEL.height) + 10;
                            imgObjects.push({el: imgEL, w: w, h: h, x:0, y:0, name:name, type:type, base64:dataURL});
                            --numbers;
                            if(numbers === 0) {
                                posCaculate();
                                refresh();
                            }
                        }
                        imgEL.src = dataURL;
                    };
                    reader.readAsDataURL(f);
                })(f);
            }else {
                var reader = new FileReader();
                reader.readAsText(f);
                reader.onload = function(e) { 
                    try{
                        var infile = JSON.parse(e.target.result);
                    }catch(e) {
                        alert('wrong file!');
                    }
                    if(infile.config) {
                        config = infile.config;
                        initialActionsMenu();
                        resetCanvas();
                    }
                    if(infile.objects) {
                        imgObjects = [];
                        infile.objects.map(function(o){
                            var img = new Image();
                            img.onload = (function(o) {
                                getEl('img').appendChild(img);
                                imgObjects.push({x:o.x, y:o.y, h:o.h, w:o.w, base64:o.base64, el:img, name:o.name});
                            })(o);
                            img.src = o.base64;
                        });
                        refresh();
                    }

                }
            }
        }
        e.stopPropagation();
        e.preventDefault();
    };
    var ifhit = function(movex, movey, width, height, name) {
        if(arguments.length == 2) {
            return imgObjects.filter(function(o) {
                return movex > o.x && movex < o.x + o.w && movey > o.y && movey < o.y + o.h;
            })[0];
        }else if(arguments.length == 5) {
            return imgObjects.some(function(o) {
                if(o.name == name) {
                    return false;
                }
                return Math.abs(Math.min(o.x, movex) - Math.max(o.x+o.w, movex+width)) < o.w + width &&
                    Math.abs(Math.min(o.y, movey) - Math.max(o.y+o.h, movey+height)) < o.h + height
            });
        }
    };
    var ifMagnet = function(movex, movey, width, height, name) {
        if(!config.if_magnet) {
            return false;
        }
        var d = config.magnet_distance;
        var objects = imgObjects.filter(function(o){
            return o.name != name;
        });
        var magnetLinesX = [];
        var magnetLinesY = [];
        //create magnetLines...
        objects.map(function(o){
            magnetLinesX.push({x:o.x});
            magnetLinesX.push({x:o.x+o.w});
        });
        objects.map(function(o){
            magnetLinesY.push({y:o.y});
            magnetLinesY.push({y:o.y+o.h});
        });
        magnetLinesX.map(function(o) {
            Math.abs(o.x - movex) - Math.abs(o.x - movex - width) <= 0 ?
                 o.setx = o.x : o.setx = o.x - width;
            o.distance = Math.min(Math.abs(o.x - movex), Math.abs(o.x - movex - width));
        });
        magnetLinesY.map(function(o) {
            Math.abs(o.y - movey) - Math.abs(o.y - movey - height) <= 0 ?
                 o.sety = o.y : o.sety = o.y - height;
            o.distance = Math.min(Math.abs(o.y - movey), Math.abs(o.y - movey - height));
        });

        var nearx = magnetLinesX.reduce(function(a, b){
            return a.distance<=b.distance?a:b;
        });
        var neary = magnetLinesY.reduce(function(a, b){
            return a.distance<=b.distance?a:b;
        });
        if( nearx.distance<d || neary.distance<d ) {
            return {
                nearx : nearx.distance<d && nearx,
                neary : neary.distance<d && neary
            };
        }
    };
    var drawCallBack = null;
    var drawLines = function(m) {
        drawCallBack = null;
        drawCallBack = function() {
            if(m.nearx !== false) {
                context.beginPath();
                context.moveTo(m.nearx.x, 0);
                context.lineTo(m.nearx.x, config.canvas_height);
                context.stroke();
            }
            if(m.neary !== false) {
                context.beginPath();
                context.moveTo(0, m.neary.y);
                context.lineTo(config.canvas_width, m.neary.y);
                context.stroke();
            }
            context.fillStyle = "red";
            if(m.nearx !== false && m.neary !== false) {
                context.fillText([m.nearx.x, m.neary.y].join(','), m.nearx.x + 3, m.neary.y - 3);
                context.beginPath();
                context.arc(m.nearx.x, m.neary.y, 3, 2*Math.PI, false);
                context.fill();
            }else if(m.nearx !== false) {
                context.fillText([m.nearx.x, target.y].join(','), m.nearx.x + 3, target.y - 3);
                context.beginPath();
                context.arc(m.nearx.x, target.y, 3, 2*Math.PI, false);
                context.fill();
            }else if(m.neary !== false) {
                context.fillText([target.x, m.neary.y].join(','), target.x + 3, m.neary.y - 3);
                context.beginPath();
                context.arc(target.x, m.neary.y, 3, 2*Math.PI, false);
                context.fill();
            }
        }
    };
    var emptyLines = function() {
        drawCallBack = null;
    }

    var target;
    var mousedown = 0;
    var lastmovex, lastmovey;
    zoom_canvas.onmousemove = canvas.onmousemove = function(e) {
        var movex = e.offsetX || e.layerX;
        var movey = e.offsetY || e.layerY;
        if(target) {
            zoomer.setXY(movex, movey);
            var newx = target.x + (movex-lastmovex);
            var newy = target.y + (movey-lastmovey);
            if(ifhit(newx, newy, target.w, target.h, target.name)) {
                return;
            }
            target.x = newx;
            target.y = newy;
            lastmovex = movex;
            lastmovey = movey;
            var m = ifMagnet(newx, newy, target.w, target.h, target.name);
            if(m) {
                //draw lines...
                drawLines(m);
            }else {
                emptyLines();
            }
            refresh();
        }else {
            var mouseOverTarget = ifhit(movex, movey);
            if(mouseOverTarget) {
                // by enix
                //document.body.style.cursor = 'pointer';
            }else {
                document.body.style.cursor = '';
            }
        }
    };
    zoom_canvas.onmousedown = canvas.onmousedown = function(e) {
        // disabled it by enix
        return false ;
        mousedown = 1;
        lastmovex = e.offsetX || e.layerX;
        lastmovey = e.offsetY || e.layerY;
        target = ifhit(lastmovex, lastmovey);
        zoomer.setXY(lastmovex, lastmovey);
        refresh();
        // by enix
        //document.body.style.cursor = 'pointer';
    };
    zoom_canvas.onmouseup = canvas.onmouseup = function(e) {
        mousedown = 0;
        document.body.style.cursor = 'normal';
        zoomer.clear();
        if(target) {
            var m = ifMagnet(target.x, target.y, target.w, target.h, target.name);
            if(m) {
                m.nearx !== false ? (target.x = m.nearx.setx) : null;
                m.neary !== false ? (target.y = m.neary.sety) : null;
            }
            emptyLines();
            refresh();
            target = null;
        }

    };

    var hasClass = function(el, className) {
        var reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
        return el.className.match(reg);
    }
    var addClass = function(el, className) {
        if(hasClass(el, className)) {
            return;
        }
        el.className += ' '+className;
    };
    var removeClass = function(el, className) {
        var reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, '');
    };
    var getEl = function(id_or_class) {
        if(id_or_class.substring(0,1) == '.') {
            return document.getElementsByClassName(id_or_class.substring(1));
        }else if (id_or_class.substring(0,1) == '#') {
            return document.getElementById(id_or_class.substring(1));
        }else {
            return document.getElementById(id_or_class);
        }
    };

    var nodeList2Array = function(nodelist) {
        return Array.prototype.concat.apply([], nodelist);
    };

    var loadConfigFromLocal = function() {}; //later
    var saveConfigToLocal = function() {}; //later
    var initialActionsMenu = function() {
        //canvas sizes
        getEl('canvas_width').placeholder = config.canvas_width;
        getEl('canvas_height').placeholder = config.canvas_height;
        //packer mode
        nodeList2Array(getEl('.js_packer_btn')).map(function(o){
            removeClass(o, 'active');
        });
        switch(config.packer_mode) {
            case 'bintree':
            case 'vertical':
            case 'bintreeGrow':
            case 'Minimize':
                posCaculate = packers[config.packer_mode];
                addClass(getEl(config.packer_mode), 'active');
        }
        //zoom setting
        nodeList2Array(getEl('zoom_factors').getElementsByTagName('button')).map(function(o){
            removeClass(o, 'active');
        });
        if(!config.if_zoom) {
            addClass(getEl('1x'), 'active');
        }else if(config.zoom == 2) {
            addClass(getEl('2x'), 'active');
        }else if(config.zoom == 4) {
            addClass(getEl('4x'), 'active');
        }
        getEl('zoom_setting_value').placeholder = config.zoom_radius;
        //magnet
        if(config.if_magnet) {
            addClass(getEl('magnet'), 'active');
        }else {
            removeClass(getEl('magnet'), 'active');
        }
        getEl('magnet_setting_value').placeholder = config.magnet_distance;
        //template
        getEl('absolute_path').placeholder = config.absolute_path;
        getEl('css_template').value = config.template;
    };
    var binddingDoms = (function() {
        var bindNav = function(id_or_class, callback) {
            var nav = getEl(id_or_class) ;
            var lis = nav.getElementsByTagName('li');
            var toggles = [];
            var lastActiveNav = lis[0];
            var lastActiveToggle = getEl(lastActiveNav.getAttribute('data-toggle'));
            for(var i=0;i<lis.length;i++) {
                var li = lis[i];
                li.onclick = (function(li) {
                    return function(e) {
                        if(lastActiveNav == li) {
                            return;
                        }else {
                            lastActiveNav.className = '';
                            lastActiveToggle.style.display = 'none';
                            lastActiveNav = li;
                            lastActiveToggle = getEl(lastActiveNav.getAttribute('data-toggle'));
                            lastActiveNav.className = 'active';
                            lastActiveToggle.style.display = 'block';
                        }
                        if(callback) {
                            callback(lastActiveNav.getAttribute('data-toggle'));
                        }
                    };
                })(li);
            }
        };
        var bindToggle = function(id_or_class, on, off) {
            var toggle = getEl(id_or_class);
            toggle.onclick = function(e) {
                e.preventDefault();
                if(hasClass(toggle, 'active')) {
                    removeClass(toggle, 'active');
                    if(off) {
                        off(toggle);
                    }
                }else{
                    addClass(toggle, 'active');
                    if(on) {
                        on(toggle);
                    }
                }
            };

        };
        var bindClose = function (id_or_class) {
            var el = getEl(id_or_class);
            el.onclick = function (e) {
                el.onclick = null;
                el.parentNode.parentNode.removeChild(el.parentNode);
            };
        };
        var bindRadio = function(id_or_class, callback) {
            if(typeof id_or_class == 'string') {
                var buttons = getEl(id_or_class).getElementsByTagName('button');
            }else{
                var buttons = id_or_class;
            }
            for(var i=0;i<buttons.length;i++) {
                var b = buttons[i];
                b.onclick = (function(b){
                    return function(e) {
                        e.preventDefault();
                        addClass(b, 'active');
                        for(var i=0;i<buttons.length;i++) {
                            var liter = buttons[i];
                            if(liter != b) {
                                removeClass(liter, 'active');
                            }
                        }
                        if(callback) {
                            callback(b);
                        }
                    };
                })(b);
            }

        };
        return function(){
            bindRadio(nodeList2Array(getEl('.js_packer_btn')), function(el){
                var id = el.id;
                switch(id) {
                    case 'vertical':
                    case 'bintree':
                    case 'bintreeGrow':
                    case 'Minimize':
                        posCaculate = packers[id];
                }
                config.packer_mode = id;
                posCaculate();
                refresh();
            });
            bindRadio('zoom_factors', function(el){
                var id = el.id;
                switch(id) {
                    case '1x':
                        config.if_zoom = false;
                        break;
                    case '2x':
                        config.if_zoom = true;
                        config.zoom = 2;
                        break;
                    case '4x':
                        config.if_zoom = true;
                        config.zoom = 4;
                        break;
                }
            });
            getEl('zoom_setting_apply').onclick = function(e) {
                e.preventDefault();
                var value = getEl('zoom_setting_value').value;
                if(value) {
                    config.zoom_radius = parseInt(value);
                }
            };

            bindToggle('magnet', function(){
                config.if_magnet = true;
            }, function(){
                config.if_magnet = false;
            });

            getEl('magnet_setting_apply').onclick = function(e) {
                e.preventDefault();
                var value = getEl('magnet_setting_value').value;
                if(value) {
                    config.magnet_distance = parseInt(value);
                }
            };
            getEl('make').onclick = function() {
                makeImgAndCss();
                // show result by enix
                $('#canvasArea').hide();
                $('#result').fadeIn(800);
            };
            getEl('canvas_sizes_apply').onclick = function(e) {
                e.preventDefault();
                config.canvas_width = getEl('canvas_width').value || config.canvas_width;
                config.canvas_height = getEl('canvas_height').value || config.canvas_height;
                resetCanvas();
            };
            getEl('css_template_apply').onclick = function(e) {
                e.preventDefault();
                config.template = getEl('css_template').value;
                config.absolute_path = getEl('absolute_path').value;
                $('#cssTemplateX').click();
            };
            getEl('css_template_reset').onclick = function(e) {
                e.preventDefault();
                initialActionsMenu();
            };
            getEl('export_workspace').onclick = function(e) {
                //e.preventDefault();
                e.stopPropagation();
                var outfile = {};
                outfile.config = config;
                outfile.objects = imgObjects.map(function(o){
                    return {x:o.x, y:o.y, w:o.w, h:o.h, base64:o.base64, name:o.name};
                });
                var base64 = encodeBase64(JSON.stringify(outfile));
                getEl('export_workspace').href = 'data:text/json;base64,' + base64;
                //window.open('data:application/duwei-data;base64,' + base64);
            };
        };
    })();
    
    function encodeBase64(str){
        var chr1, chr2, chr3, rez = '', arr = [], i = 0, j = 0, code = 0;
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');

        while(code = str.charCodeAt(j++)){
            if(code < 128){
                arr[arr.length] = code;
            }
            else if(code < 2048){
                arr[arr.length] = 192 | (code >> 6);
                arr[arr.length] = 128 | (code & 63);
            }
            else if(code < 65536){
                arr[arr.length] = 224 | (code >> 12);
                arr[arr.length] = 128 | ((code >> 6) & 63);
                arr[arr.length] = 128 | (code & 63);
            }
            else{
                arr[arr.length] = 240 | (code >> 18);
                arr[arr.length] = 128 | ((code >> 12) & 63);
                arr[arr.length] = 128 | ((code >> 6) & 63);
                arr[arr.length] = 128 | (code & 63);
            }
        };

        while(i < arr.length){
            chr1 = arr[i++];
            chr2 = arr[i++];
            chr3 = arr[i++];

            rez += chars[chr1 >> 2];
            rez += chars[((chr1 & 3) << 4) | (chr2 >> 4)];
            rez += chars[chr2 === undefined ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6)];
            rez += chars[chr3 === undefined ? 64 : chr3 & 63];
        };
        return rez;
    };
    var template = function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
        cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t]/g, " ")
          .replace(/[\n]/g, "[enter]")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
        + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
    //loadConfigFromLocal();
    initialActionsMenu();
    binddingDoms();
    resetCanvas();
    zoomer.init();
    context.font = '20pt Verdana';
    context.fillText("Drop Images or an export file here.", config.canvas_width/2 - 260, config.canvas_height/2 - 20);
    context.font = '10pt tahoma';
})('Asimg');
