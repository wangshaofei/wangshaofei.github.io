---
layout: post
title: IE总是用兼容模式显示我的网站
tags: [ ie , compatible ]
category: Frontend
description: 在高版本IE中打开我的网站时，浏览器总会自动切换到IE7兼容模式，一直很困扰。。。
---

[img-ie6-type]: /images/compatible-1.png
[img-compatible-set]: /images/compatible-2.png
[img-ie-other-type]: /images/compatible-3.png

最近很多同事我们的产品在反馈IE下有些小bug，细问得知，他们的浏览器都是启动了兼容模式来渲染网页。开始以为是同事自己不小心选择了兼容模式，没有多在意，后来又陆续接到了其他同
事的反馈，都是IE兼容模式下的bug。问题来了：没有人为干预的情况下，为什么IE会用兼容模式来渲染呢？

于是我用IE去浏览公司其他业务的页面，90%的页面，都会齐刷刷的切换到IE兼容模式，当然也有部分是例外（这种页面中是设置了X-UA-Compatible），但是访问其他公司的网站却不会出现这样的情况。百思不得其解。

后来咨询了几位同事，很快便得到了答案：

- IE浏览器默认会勾选“使用兼容模式显示Intarnet站点" ，如图

![ie compatible setting][img-compatible-set]
- 在公司访问内部的网页会被IE识别为Intranet资源（why？可能是由于我们都是用代理上网吧），如图

![ie6 show page type][img-ie6-type]

IE高版本浏览器的开发者工具也有更智能的提醒（感谢鸽子提示），如图

![ie show page type][img-ie-other-type]

小伙伴们，一定记得让你们的测试修改相关设置，不然永远都是在用IE7测试网页了。当然，更好的方式是我们在网页头部使用X-UA-Compatible申明，指定浏览器使用对应的版本显示网页。

最后，非常感谢畅哥，super，鸽子的帮忙。
