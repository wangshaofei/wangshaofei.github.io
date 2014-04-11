---
layout: post
title: Javascript 正则表达式
tags: [ regexp, Javascript ]
category: Frontend
description: Javascript 正则表达式笔记
---

关于Javascript正则表达式的知识点的一些笔记：

###元字符

    // 一对括号，半中括号，半大括号，backslash，gapline，Head，End，AnySingleChar，limitedNum
    ( ) [ { \ | ^ $ . ? + *  
    
###优先级

正则表达式从左到右进行计算，并遵循优先级顺序，这与算术表达式非常类似。 下表从最高到最低说明了各种正则表达式运算符的优先级顺序

1. x转义符：\
1. x括号：（）,(?:), \[, \]
1. x限定：\* , + , ?
1. x定位点：^, $, \t
1. x替换： |

字符比替换运算符具有更高的优先级，这样使得“m|food”匹配“m”或者“food”。若要匹配“mood”或“food”，请使用括号创建子表达式，从而产生“(m|f)ood”。

###相关的函数

####相关的函数-test 

    // test 检查字符串中指定值，返回布尔值
    var reg = /a-z/gi;
    reg.test('ikitty blog') && console.log('has letter');

####相关的函数-match

match是string对象的方法，可接受一个正则表达式作为参数。
如果没有g标志，返回的是null或包含第一个匹配项和子表达式的对象,该对象中还返回index和input两个属性,index表示匹配项的位置,input表示原始字符串(和exec一致)。
如果有g标志，则不捕获子表达式;返回的是null或包含所有匹配项的数组;不会返回index和input

    var ua = window.navigator.userAgent ,
        regM  = /(\w)\/(\d+)/i,
        regMG = /(\w)\/(\d+)/gi,
        ret = {} ;
    ret.m = ua.match(regM);
    ret.mg = ua.match(regMG);
    console.log(ret);
    
####相关的函数-exec

和g标志没有关系,每次只会匹配一次，返回匹配项和子表达式。并返回index和input两个属性

    var ua = window.navigator.userAgent ,
        regE  = /(\w)\/(\d+)/i,
        regEG = /(\w)\/(\d+)/gi,
        ret = {} ;
    ret.e = regE.exec(ua);
    ret.eg = regEG.exec(ua);
    console.log(ret);

    // 如果需要全文匹配，则需要循环执行exec
    var temp = '',
        count = 0 ;
    while (temp = regEG.exec(ua)) {
        console.log(temp) ;
    }

    //如果需要每次都是从头检索则需要手动重置正则的lastIndex
    temp = '';
    while ((temp = regEG.exec(ua)) && count < 5) {
        count++;
        // 重置lastIndex以保证每次都会从头开始检索
        regEG.exec('');
        console.log(temp) ;
    }
    

###常用正则
