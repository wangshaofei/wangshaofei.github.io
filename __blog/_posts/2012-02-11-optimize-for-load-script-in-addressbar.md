---
layout: post
title: "用javascript协议在地址栏载入脚本的优化"
description: "相信大家都在地址栏里用javascript:的形式执行过脚本。这种方法简单实用，测试比较短的脚本时经常用到。并且可以添加到收藏夹里，随时点击调用。不过脚本比较长的时候，需要复制密密麻麻一大段到地址栏里，显得很不美观，而且脚本修改起来也很不容易。因此一般先把脚本写在单独一个文件里，然后用javascript: 的形式动态载入脚本到页面中。不少网页插件都是用这个方法载入。"
category: 
tags: []
---
{% include JB/setup %}

相信大家都在地址栏里用javascript:的形式执行过脚本。这种方法简单实用，测试比较短的脚本时经常用到。并且可以添加到收藏夹里，随时点击调用。不过脚本比较长的时候，需要复制密密麻麻一大段到地址栏里，显得很不美观，而且脚本修改起来也很不容易。因此一般先把脚本写在单独一个文件里，然后用javascript: 的形式动态载入脚本到页面中。不少网页插件都是用这个方法载入。

平时，我们用最简单的代码实现动态载入：

    javascript:var o=document.createElement('script');o.src='...';document.body.appendChild(o);void(0)

当然，这对于载入插件来说足够OK了。但是不久前看到一个稍有修改的方法，让我开始琢磨这段代码究竟可以压缩到多短！他的代码大致相同，只是更严谨： 

    javascript:(function(o){o.src='...';document.body.appendChild(o)})(document.createElement('script'));void(0)

虽然代码比先前的还长，但是将变量置于函数内部，避免潜在的冲突。并且将`document.createElement`作为函数的参数，巧妙的节省了一个`var`单词。

这代码能否精简再精简? 当然，首先默认了几个地址栏载入脚本要遵循的规则：

1. 不引入全局变量
2. 兼容主流浏览器
3. 载入过程不影响页面 
　　
@1 不影响全局变量，我们需要使用匿名函数来隐藏我们的私有变量；
@2 兼容主流浏览器，就必须使用标准的方法，兼容性判断只会增加代码长度；
@3 如果简单的使用innerHTML添加元素，就有可能导致存在的元素刷新；

于是我们开始逐步分析。显然，最先想到的就是匿名函数的调用。

通常我们都是用：`(function(){})()`的形式调用一个匿名函数。但也可以使用另一种形式：`+function(){}()`前面的+号可以换成-!~等等一元操作符。不过这仅仅是1字节之差。

另一个显然的，就是可以把void(0)的参数替换成函数调用的表达式。void虽然只是个关键字，但有类似函数的功能，对于任何参数都返回undefined。如果没有void，在地址栏执行了javascript:后，页面就变成了脚本表达式返回值，大家应该都见过。

于是经过显而易见的观察，略微减少了3个字符。

    javascript:void(+function(o){o.src='...';document.body.appendChild(o)}(document.createElement('script')))

不过上面都是浅层次的观察。现在我们来仔细的分析。

我们为什么要使用函数，就是为了防止我们的变量和页面里的冲突。那么可以不使用变量吗？想要不出现变量，唯一办法就是使用链式的连等操作：利用上个操作的返回值作为下个操作的参数。这段代码共有3个操作：创建脚本元素/脚本元素src赋值/添加脚本元素。仔细参考下W3C的手册，DOM.appendChild不仅可以添加元素，并且返回值也是此元素。而src赋值和元素添加的顺序可以互换。因此我们可以用链式操作，从而彻底告别函数和变量：

    javascript:void(document.body.appendChild(document.createElement('script')).src='...')

这一步，我们精简了19个字符！
　　
我们继续观察。上面的代码里出现了2个`document`。我们如果用一个短变量代替的话又可以减少字数。但使用了变量的话又会出现冲突的问题，于是又要用到匿名函数。。。仔细的回忆下，js里有个我们平时不推荐使用的东西：with。没错，使用他就可以解决这个问题。我是只需`with(document){...}`即可。因为只有一行代码，所以那对大括号也可以去掉。于是又减少了4个字符：

    javascript:with(document)void(body.appendChild(createElement('script')).src='...')

值得注意的是，void不再套在最外层了，因为with和if, for他们一样，不再是表达式，而是语句了。

此时，代码里的每句都是各司其责，连重复的单词都找不到了。我们还能否再精简？如果硬要找，那也只得从void这家伙身上找了。如果去掉它，那地址栏执行后，页面就变成了脚本元素的src字符了。显然删不得。但我们可以尝试换个，比如alert。在对话框过后，页面仍保留着。

先前说了，void的功能仅仅是返回一个undefined，而alert没有返回值。这里就不得不说javascript与其他语言的不同之处了。在其他的语言里，几乎都有函数/过程这么两概念，过程就是没有返回值的函数。不过js可不同，在js里任何函数都有一个返回值，即使“ 没有返回值 ”也是一种返回值，他就是undefined。所以alert和void有着相同的返回值：undefined。只要地址栏执行后结果是它，页面就不会转跳，而其他诸如false,0,null,NaN等等都不行。

于是我们只需让表达式返回的是undefined就可以了，但必须比void()这几个字符短。要产生一个undefined，除了它字面常量外，另外就是调用没有返回值的函数，或者访问一个对象不存在的属性。我们要尽可能简短。如果页面里使用了jQuery的话，我们用$.X就可以得到一个undefined。但没用jq的话，就不能保证是否存在变量$了。既然找不到足够简短的全局变量，我们可以用json创造个匿名的，比如[]或{}，然后访问他的不存在属性，比如[].X。于是，我们可以告别void了：

    javascript:with(document)body.appendChild(createElement('script')).src='...';[].X
　　
这样就减少了1个字节。我们还可以合并下代码，用表达式替换X：

    javascript:with(document)[][body.appendChild(createElement('script')).src='...']

这样又减少了1个字节。

事实上，js里的任何一个变量都是继承于Object的，即使数字也不例外。所以，我们完全可以用一个数字替换[]，这样更进一步减少1个字符：

    javascript:with(document)0[body.appendChild(createElement('script')).src='...']

到此，代码里除了src字符外，缩短到76字节。

当然，最终的极限仍在探索中。。。

配合短域名服务，我们可以缩短脚本的URL，例如：

    javascript:with(document)0[body.appendChild(createElement('script')).src='http://t.cn/xxxxx']

这里的协议类型也可以省略,再次节省

    javascript:with(document)0[body.appendChild(createElement('script')).src='//t.cn/xxxxx']
