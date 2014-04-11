---
layout: post
title: "关于IE haslayout的理解"
description: " hasLayout是IE的私有属性，虽然它有很多缺陷，但作为 IE 渲染引擎的重要组成部分(和标准浏览器中的BFC一样重要)，我们在进行web标准设计的s时候仍然好好好的理解并使用它。"
category: 
tags: []
---
{% include JB/setup %}


hasLayout是IE的私有属性，虽然它有很多缺陷，但作为 IE 渲染引擎的重要组成部分(和标准浏览器中的BFC一样重要)，我们在进行web标准设计的s时候仍然好好好的理解并使用它。

###About hasLayout

hasLayout 与 BFC 有很多相似之处，但 hasLayout 的概念会更容易理解。在 Internet Explorer 中，元素使用“布局”概念来控制尺寸和定位，分为拥有布局和没有布局两种情况，拥有布局的元素由它控制本身及其子元素的尺寸和定位，而没有布局的元素则通过父元素（最近的拥有布局的祖先元素）来控制尺寸和定位，而一个元素是否拥有布局则由 hasLayout 属性告知浏览器，它是个布尔型变量，true 代表元素拥有布局，false 代表元素没有布局。简而言之，hasLayout 只是一个 `IE专有属性`，hasLayout 为 true 的元素浏览器会赋予它一系列的效果。

特别注意的是，hasLayout 在 IE 8 及之后的 IE 版本中已经被抛弃，所以在实际开发中只需针对 IE 8 以下的浏览器为某些元素触发 hasLayout 。

一个元素触发 hasLayout 会影响一个元素的尺寸和定位，这样会消耗更多的系统资源，因此 IE 设计者默认只为一部分的元素触发 hasLayout （即默认有部分元素会触发 hasLayout ，这与 BFC 基本完全由开发者通过特定 CSS 触发并不一样），这部分元素如下：

    body and html
    table, tr, th, td
    img
    hr
    input, button, file, select, textarea, fieldset
    marquee
    frameset, frame, iframe
    objects, applets, embed
    
###如何触发 hasLayout

除了 IE 默认会触发 hasLayout 的元素外，Web 开发者还可以使用特定的 CSS 触发元素的 hasLayout 。通过为元素设置以下任一 CSS ，可以触发 hasLayout （即把元素的 hasLayout 属性设置为 true）:

    float: (left 或 right)
    position: absolute
    display: inline-block
    width: (除 auto 外任何值)
    height: (除 auto 外任何值)
    writing-mode: tb-rl
    zoom: (除 normal 外任意数值，包括设置为效果等同于 normal 的 1 也有效)
    另外，一些 CSS 在 IE 7 下亦能触发 hasLayout。

    min-width: (包含 0 在内的任意值)
    max-width: (除 none 外任意值)
    min-height: (包含 0 在内的任意值)
    max-height: (除 none 外任意值)
    overflow 除了 visible 以外的值（hidden，auto，scroll）
    position: fixed

对于内联元素(可以是默认被浏览器认为是内联元素的 span 元素，也可以是设置了 display: inline 的元素)，width 和 height 只在 IE5.x 下和 IE6 或更新版本的 quirks 模式下能触发元素的 hasLayout ，但是对于 IE6，如果浏览器运行于标准兼容模式下，内联元素会忽略 width 或 height 属性，所以设置 width 或 height 不能在此种情况下令该元素触发 hasLayout 。但 zoom 除了在 IE 5.0 中外，总是能触发 hasLayout 。zoom 用于设置或检索元素的缩放比例，为元素设置 zoom: 1 既可以触发元素的 hasLayout 同时不会对元素造成多余的影响。因此综合考虑浏览器之间的兼容和对元素的影响，建议使用 zoom: 1 来触发元素的 hasLayout 。

###触发 hasLayout 的效果

虽然 hasLayout 也会像 BFC 那样影响着元素的尺寸和定位，但它却又不是一套完整的标准，并且由于它默认只为某些元素触发，这导致了 IE 下很多前端开发的 bugs ，触发 hasLayout 更大的意义在于解决一些 IE 下的 bugs ，而不是利用它的一些“副作用”来达到某些效果。另外由于触发 hasLayout 的元素会出现一些跟触发 BFC 的元素相似的效果，因此为了统一元素在 IE 与支持 BFC 的浏览器下的表现，建议为触发了 BFC 的元素同时触发 hasLayout ，当然还需要考虑实际的情况，也有可能只需触发其中一个就可以达到表现统一，下面会举例介绍。

这里首先列出触发 hasLayout 元素的一些效果：

####阻止外边距折叠

两个相连的 div 在垂直上的外边距会发生叠加，而触发 hasLayout 的元素之间则不会有这种情况发生，[demo](/labs/hasLayout.html)。

三个 div 各包含一个 p 元素，三个 div 及其包含的 p 元素都有顶部和底部的外边距，但只有第三个 div 的边距没有与它的子元素 p 的外边距折叠。这是因为第三个 div 使用 zoom: 1 触发了 hasLayout ，阻止了它与它的子元素的外边距折叠。

另外，例子中也使用了 overflow: hidden 触发元素的 BFC ，这利用了 BFC 阻止外边距折叠的特性达到元素在 IE 与现代浏览器下的表现统一。

####可以包含浮动的子元素，即计算高度时包括其浮动子元素

[demo](/labs/hasLayout.html)

上图的例子中，有两个 div ，它们各包含一个设置了浮动的 p 元素，但第一个 div 实际被浏览器判断为没有高度和宽度，即高度为 0 ，上下边框重叠在一起。而第二个 div 使用 zoom: 1 触发了 hasLayout ，可以包含浮动元素，因此能正确表现出高度，其边框位置也正常了。

本例子中也使用了 overflow: hidden 触发 BFC ，跟上例相似，这利用了 BFC 可以包含浮动子元素的特性达到元素在 IE 与现代浏览器下的表现统一。

####背景图像显示问题
元素背景图不能正确显示是网页重构中最常见的问题之一了，在 IE 7 及以下的 IE 版本中，没有设置高度、宽度的元素往往不能显示出背景图（背景色则显示正常），这实际上与 hasLayout 有关。实际的情况是，没有触发 hasLayout 的元素不能显示背景图，上面有说过，触发 hasLayout 也就是使到元素拥有布局，换句话说，拥有布局的元素才能正确显示背景图。


[Demo](/labs/hasLayout.html) (在 IE 7 或更低版本的 IE 下查看以观察背景图问题)。

上图两个 div 都设置了背景图，但只有使用 zoom: 1 触发了 hasLayout 的第二个 div 才能正确显示背景图。本例子中没有触发元素的 BFC ，这是因为在现代浏览器中，元素本身并没有背景图显示问题。

可以看出，上面的第一、二个例子中，为了使到元素在 IE (包括低版本 IE 以及较新版本的 IE)和现代浏览器中表现尽量统一同时触发了 hasLayout 和 BFC ，而第三个例子中的问题因为只在低版本 IE 中出现，所以只需为低版本 IE 触发 hasLayout ，这些技巧在实际项目中需要特别注意。

上面也有说道，hasLayout 与很多 IE 下的显示 bugs 都有关，实际上很多莫名奇妙的 bugs 都因 hasLayout 而起，因此只要适当的触发元素的 hasLayout ，很多 IE bugs 往往就能解决。如：

- IE 6 及更低版本下浮动元素双倍 margin bug - 为元素设置 display: inline 可以解决
- IE 5-6 的 3 像素偏移 bug - 为元素设置 _height: 1% 可以解决

