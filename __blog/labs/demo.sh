#!/bin/sh
#用/bin/sh来执行本程序
#先给文件名加上可执行权限，才能正常运行 chmod +x filename
#运行本脚本时，一定要在脚本名前加 ./file.sh

echo start

#定义变量 notice: 赋值号前后不能有空格
#单引号和双引号的区别，同php，双引号会解析里面的变量
a="string a"
b='string b'
#使用变量时,要用$引用，最好用{}包含变量
echo $a
echo ${b}
echo "the ${b} is test string "

#===加法===
n=1
n=$n+1
#shell中变量默认类型为string
echo $n
#想进行逻辑运算可以用如下方法
y=1
#下面的方法sh下报错
#let "y+=1" 

#1 建议用这种，为什么要套两个括号，你来告诉我.
y=$(($y+1))
#2 这种方法也可以，注意加号左右的空格
y=`expr $y + 1`
#3 这种方式最便于书写
#y=$[$y+1]
echo "y is:$y"
echo $y

#===流程控制===
#普通的if流
if [ -n $n ] ; then
    echo "n exist"
else
    echo "n does not exist"
fi
#大多数情况下，可以使用测试命令来对条件进行测试，比如可以比较字符串、判断文件是否存在及是否可读等等，通常用" [ ] "来表示条件测试，注意这里的空格很重要，要确保方括号前后的空格。

#[ -f "somefile" ] ：判断是否是一个文件
#[ -x "/bin/ls" ] ：判断/bin/ls是否存在并有可执行权限
#[ -n "$var" ] ：判断$var变量是否有值
#[ "$a" = "$b" ] ：判断$a和$b是否相等,这里的不用双等号，等号左右的空格也注意
#[ $a -lt $b ] ：$a < $b
#[ $a -le $b ] ：$a <= $b
#man test 查看更多

#===逻辑与或===
#(case true ) && (then b)
bashPath="/bin/bash"
zshPath="/bin/zsh"
[ $SHELL = $zshPath ] && echo "login shell is zsh"
#(case false ) || (then b)
#[ $SHELL = $bashPath ] || { echo "login shell isnot bash " ; exit ; }
#echo "login shell is $SHELL"

#===循环=== while/for
for testFor in "a" "b" "c"; do
    echo "testFor is $testFor"
done


#======注意======
#变量使用时用$引用
#赋值号左右不能有空格
#条件判断[]左右保留空格
#$1,$2表示穿给脚本的第1，2个参数
#$@，该变量包含有输入的所有命令行参数值。如果你运行showrpm openssh.rpm w3m.rpm webgrep.rpm，那么 "$@"(有引号) 就包含有 3 个字符串，即openssh.rpm, w3m.rpm和 webgrep.rpm。$*的意思是差不多的。但是只有一个字串。如果不加引号，带空格的参数会被截断。
#特殊变量$# 表示包含参数的个数
