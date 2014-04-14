#!/bin/sh
#用/bin/sh来执行本程序
echo start

#数字不足指定位数（默认为3），则在前面自动补0
fixNum()
{
    if [ -z $2 ];then
        niceLength=3
    else
        niceLength=$2
    fi

    numofchar=`expr "$1" : '.*'`  
    restNum=`expr $niceLength - $numofchar`
    rval=$1
    while [ $restNum -gt 0 ] ;do
        rval="0"$rval
        restNum=`expr $restNum - 1`
    done
    echo $rval
}

#define
baseUrl="http://www.umei.cc/tags/Vicni.htm"

#分析page获取gallery，写入gallery.txt。所有gallery的url 
#gallery: $url

#分析每条gallery，写入every.txt。图片url 总数 当前下载到的顺序 期数
#every: $imgUrl $count $currentCount $period

#get gallery
gallery_key='class=title'
if [ -f ./log/logGallery.txt ] ; then
    echo "Success: Read gallery list."
else
    curl -s ${baseUrl} | grep "msy" > ./log/d1.txt
    awk -F'[ ]' '{for(i=1;i<=NF;i++){if($i~/'$gallery_key'/){print $i}}}' ./log/d1.txt > ./log/d2.txt
    awk -F'["]' '{print $2}' ./log/d2.txt > ./log/d3.txt

    #add baseUrl
    index=1
    while read line ; do
        #lineFix=`echo $line | awk -F'[/]' '{print $2}'`

        echo "${baseUrl}"$line"/works" >> ./log/logGallery.txt
        index=`expr $index + 1`
    done < ./log/d3.txt
    rm ./log/d1.txt ./log/d2.txt ./log/d3.txt
    echo "Success: Got designer list ;clear"
fi


#获取单图记录
eachBaseUrl=`cat ./logEvery.txt | awk '{print $1;}'`
totalCount=`cat ./logEvery.txt | awk '{print $2;}'`
currentCount=`cat ./logEvery.txt | awk '{print $3;}'`
period=`cat ./logEvery.txt | awk '{print $4;}'`

#downLogK=`cat ./downLog.txt | awk '{print $1;}'`
#downLogJ=`cat ./downLog.txt | awk '{print $2;}'`
#isStartDown=0

#if [ -z $downLogK ];then
    #kLog=1
#else
    #kLog=$downLogK
#fi

for((k=$currentCount;k<$totalCount;k++));do
    kFix=`fixNum $k 4`

    eachUrl="${eachBaseUrl}${kFix}.jpg"
    #opt set gallery parent dir
    localUrl="./${period}/${kFix}.jpg"

    curl -s -w %{http_code} -m 5000 -o $localUrl --create-dirs $eachUrl

    #record downloaded
    echo "${eachBaseUrl} ${count} ${k} $period" > ./logEvery.txt

    #这里用while 循环不好 不能很好的自增加和初始化变量
    #当httpCode不为200时终止循环
    #while [ `curl -s -w %{http_code} -m 5000 -o $localUrl --create-dirs $eachUrl` = 200 ];do
        #echo ${eachUrl}

        #k=`expr $k + 1`
        #eachUrl="${eachBaseUrl}${kFix}.jpg"
        #localUrl="./${period}/${kFix}.jpg"
    #done

done

#todo 下载耗时
rm downLog.txt
echo complete 

#curl http://202.103.180.61:83/mmonly/2012/\[201209-201210\]/\[039-040\]/\[1-20\].jpg -o ./#1/#2/#3.jpg --create-dirs
#/202.103.180.61:83/mmonly/2012/201209/040/1.jpg

#赋值时等号左右不要有空格
#baseUrl="http://202.103.180.61:83/mmonly/2012/201203/"
#尼玛这里一定要空格
#i=`expr $i + 1`
#numofchar=`echo -n "$1" | wc -c | sed 's/ //g' `
# fuckyou -111 > 0 returned true
#语法好贱啊，for两个括号
#http://61.146.178.120:8012/img2012/2013/08/01/012BT853/0060.jpg
#http://www.umei.cc/tags/Vicni.htm
#http://i8.umei.cc//img2012/2013/04/15/017BT813/0000.jpg

#structure Role > gallery(table) > every(table)
#gallery.log
    #get gallery
    #div#msy .t .title a.herf.title 
    #save url and title // 813 83

#every.log
    #img_box a img.src
    #save current count totalCount
