---
layout: post
title: 鼠标跟随特效解读
tags: [  Javascript ]
category: Frontend
description: 鼠标跟随特效
---

[mouseEnter]: /images/mouse-direction-1.png
[coord]: /images/mouse-direction-coord.png
[tan]: /images/mouse-direction-tan.png

之前看到Jb分享了一个“鼠标跟随”的特效Demo，研究了下。里面用到了JavaScript和CSS3的动画技术。该特效的核心在于如何判断鼠标进入图片区域的方向，该代码的精华都蕴含在下面这一句中：

    var direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180 ) / 90 ) + 3 )  % 4;

利用了高数中的三角函数来判断鼠标进入的方向。下面将上述代码拆开分析：

    var w = box.offsetWidth;
    var h = box.offsetHeight;
    // 将鼠标进入时和矩形的切入点在平面直角坐标平面中表示出来, x和y分别是切入点的x轴坐标和y轴坐标。这样鼠标切入点和矩形中点的连线与X轴会形成一个夹角。
    // (w > h ? (h/w): 1) 用来将矩形修正为正方形，以避免矩形宽高不一致影响到角度
    var x=(e.clientX - box.offsetLeft - (w / 2)) * (w > h ? (h / w) : 1);
    var y=(e.clientY - box.offsetTop - (h / 2)) * (h > w ? (w / h) : 1);

比如鼠标从左侧进入到矩形区域，对应的切入点坐标。图中鼠标切入的点和真实计算出点的坐标是基于x轴对称的，但是依然会在同一个角度区域。

![mouse enter][mouseEnter]

计算切入点坐标的反正切值，并将所得结果转换成角度

    var direction ;
    direction = Math.atan2(y, x) * (180 / Math.PI);

加上180度，将结果转化为正值。由于正切函数是周期函数，其最小正周期是π rad (180度)，所以加上180度不会影响结果。

    direction = direction + 180;

下图是正切函数曲线：

![tangent][tan]

将度数转换为象限标识

    direction = direction / 90;

顺带一提，平面直角座标系的四个象限是这样的：

![quadrant][coord]

通过前面的计算已经得到了象限的标识，再通过加3，并对4取余，以将结果修正为我们期待的结果：{Top:0, Right: 1, Bottom: 2, Left: 3}

    direction = Math.round(direction + 3) % 4 ;

后来发现一种更为简单的方法来，如：

    var direction =  Math.round( Math.atan2(y, x) / (Math.PI/2) + 5 ) % 4 ; 

    // 拆开说明下
    // 计算输入切入点在平面坐标系中的角度
    var D =  Math.atan2(y, x) ;

    // 获取该角度对应的象限（和标准坐标系中的象限有区别）标识
    D = Math.round(D / (Math.PI/2));

    // 通过取余等元素将结果优化符合顺时针递增的结果top,right,bottom,left (0，1，2，3)
    D = ( D + 5 )% 4

以上就是获取鼠标方向的全过程解析。有了该方法，只需要监控鼠标在矩形区域上的mouseenter/mouselveave事件，并实时的把半透明浮层的跟随动画添加上即可，这部分交给css3来搞定即可。

<a target="_blank" href="/labs/mouseDirection.html">查看Demo</a>
