ikitty front-end notes

问题：
1. Q:提交代码后网站不更新（本地jekyll server是正常的）
A:看注册邮箱是否有page build error的错误报告，被折腾多几次了。
markdown 语法注意：不要在正文中插入\[\], \<\> ，一定要使用，请转义;代码块中也请勿使用。。。

2. Q:maruku解析报错
A: 由于maruku引擎对中文支持不友好，所以，建议换成redcarpet、rdiscount等(在config里面指定markdown引擎即可)

3. Q:style标签里面的内容被加上CDATA外壳
A: 当然解决了第二个问题时，这个问题同时也被解决了，刚开始真是百思不得其解。坑爹的maruku

