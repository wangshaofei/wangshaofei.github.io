---
layout: post
title: "浏览器F5刷新和地址栏按回车的区别"
description: "Cache是把双刃剑，利用得好，能很好进行资源重利用，提升页面性能，用的不好就是坑。有时候，我们会接到一些吐嘈说页面偶尔坏掉之类的，细细一问原来是用户刷新页面的方式还真不同，并且各种刷新页面的方式导致的结果也不一样。"
category: other
tags: []
---
{% include JB/setup %}

Cache是把双刃剑，利用得好，能很好进行资源重利用，提升页面性能，用的不好就是坑。有时候，我们会接到一些吐嘈说页面偶尔坏掉之类的，细细一问原来是用户刷新页面的方式还真不同，并且各种刷新页面的方式导致的结果也不一样。

在浏览器中，我们可以按F5刷新，还可以在地址栏按下回车来刷新。其中，在地址栏按回车又分为两种情况。一是请求的URI在浏览器缓存中未过期，此时，使用Firefox的firebug插件在浏览器里显示的HTTP请求消息头如下：

	Host                       192.168.3.174:8080
	User-Agent                 Mozilla/5.0 (WindowsNT5.1;rv:5.0)Gecko/20100101Firefox/5.0
	Accept                     text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
	Accept-Language            zh-cn,zh;q=0.5
	Accept-Encoding            gzip,deflate
	Accept-Charset             GB2312,utf-8;q=0.7,*;q=0.7
	Connection                 keep-alive

HTTP返回状态显示200 OK，但是，后台Nginx服务器的access.log并没有找到该请求的记录，说明请求并没有真正提交到HTTP服务器。而是被浏览器发现缓存中还有未过期的文件，直接把请求拦截了，firebug里面显示所谓的“请求头消息”、“响应头消息”都是浏览器“伪造”的。这种刷新，使用的网络流量是最小的，可以说完全没有，时间消耗也是最少的。就像你找到一盒没有过期的牛奶，觉得肯定没有问题，谁都没告诉就喝了。

二是请求的URI在浏览器缓存中已过期，此时，firebug显示的HTTP请求消息头如下：

	Host                         192.168.3.174:8080
	User-Agent                   Mozilla/5.0(WindowsNT5.1; rv:5.0)Gecko/20100101 Firefox/5.0
	Accept                       text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
	Accept-Language              zh-cn,zh;q=0.5
	Accept-Encoding              gzip,deflate
	Accept-Charset               GB2312,utf-8;q=0.7,*;q=0.7
	Connection                   keep-alive
	If-Modified-Since            Mon,04Jul201110:12:40GMT

多了一行If-Modified-Since，后台Nginx服务器的access.log也找到了该请求的记录，说明浏览器对这种情况的处理方法是：再问一下服务器，请求的URI在某个时间之后有没有被修改过，而这个时间是由上次HTTP响应的Last-Modified决定的。服务器鉴定之后，没有修改的话，返回304 Not Modified，浏览器收到后，从缓存里读出内容；有修改的话，返回200 OK，并返回新的内容。这种情况，就像你找到一盒已经过期的牛奶，于是问别人，还能不能喝，如果别人说可以，你就把它喝了，如果别人说不行，那你得就另外找一盒新鲜的牛奶。

至于F5刷新，其HTTP请求消息头如下：

	Host                  192.168.3.174:8080
	User-Agent            Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0
	Accept                text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
	Accept-Language       zh-cn,zh;q=0.5
	Accept-Encoding       gzip, deflate
	Accept-Charset        GB2312,utf-8;q=0.7,*;q=0.7
	Connection            keep-alive
	If-Modified-Since     Mon, 04 Jul 2011 10:12:40 GMT
	Cache-Control         max-age=0

又多了一行Cache-Control: max-age=0，意思是说，我不管浏览器缓存中的文件过期没有，都去服务器询问一下，相当于上次HTTP响应的Expires暂时失效。服务器的响应处理流程同上。这种情况，就像你找到一盒牛奶，没有看它的有效期，直接就问别人能不能喝。

最后是Ctrl+F5刷新，其HTTP请求消息头如下：

	Host                192.168.3.174:8080
	User-Agent          Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0
	Accept              text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
	Accept-Language     zh-cn,zh;q=0.5
	Accept-Encoding     gzip, deflate
	Accept-Charset      GB2312,utf-8;q=0.7,*;q=0.7
	Connection          keep-alive
	Pragma              no-cache
	Cache-Control       no-cache

If-Modified-Since没有了成了，Cache-Control换no-cache，此外Pragma行是为了兼容HTTP1.0，作用与Cache-Control: no-cache是一样的。意思是，我不要缓存中的文件了，强制刷新，直接到服务器上重新下载，于是服务器的响应处理与首次请求这个URI一样，返回200 OK和新的内容。这种刷新，使用的网络流量是最大的，也是最耗时的。这就像你虽然发现了一盒牛奶，但是把它扔掉了，直接去买一盒新的。


Firefox中， 按F5刷新：HTTP请求中有一个 Cache-Control: max-age=0。而在地址栏回车：没有这个Cache-Control 头

