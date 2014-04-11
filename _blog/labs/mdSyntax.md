#h1
####h4

#MD bug
只有在语句中包含英文字符时，Md才能将1. 开始的语句编译为有序列表
否则会按原样输出

1. 全是中文
    //普通的html
1. 全是中文，还有english
    //ol

如果要让包含英文的语句按原样输出（不输出有序列表）,可如下：
1. 中文引导：
here is English sentence


##blockquote

>引用：Markdown 也允许你偷懒只在整个段落的第一行最前面加上 

>这样也行
>这样也行

>引用也可以嵌套
>>这样也行
>##引用里面还可以使用其他格式

##br
2+个空格再换行=br标签

##list

+ 无序列表（*+-都可以）,符号后面跟1+个空格
+ 无序列表（*+-都可以）

1. 有序列表(数字任意),符号后面跟1+个空格
1. 有序列表

##code
    codeArea,四个空格或者一个制表符即可

##inlineCode
    like this `div`

##gap
你可以在一行中用三个以上的星号、减号、底线来建立一个分隔线，行内不能有其他东西。你也可以在星号或是减号中间插入空格。
***
---

##strong
Markdown 使用星号（*）和底线（_）作为标记强调字词的符号，被 * 或 _ 包围的字词会被转成用 <em> 标签包围，用两个 * 或 _ 包起来的话
，则会被转成 <strong>,使用反斜线来使用本身的符号
_strong_
*strong*

##link
Markdown 支持两种形式的链接语法： 行内式和参考式两种形式。

This is [an example](http://example.com/ "Opt Title") inline link.

See my [About](/about/) page for details.

参考式的链接是在链接文字的括号后面再接上另一个方括号，而在第二个方括号里面要填入用以辨识链接的标记：

This is [an example][id] reference-style link.
[id]: http://example.com/  "Optional Title Here"

隐式链接，链接标记会视为等同于链接文字

[Google][]

[Google]: http://google.com/


##img
Markdown 使用一种和链接很相似的语法来标记图片，同样也允许两种样式： 行内式和参考式。

行内式的图片语法看起来像是：

    ![Alt text](/path/to/img.jpg "Optional title")
    
参考式的图片语法则长得像这样：

    [id]: url/to/image  "Optional title attribute"
    ![Alt text][id]

##换行
普通的换行，不会编译成新的p标签或br

