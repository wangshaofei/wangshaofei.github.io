#!/bin/sh
#download design resource
echo start

#define
baseUrl="http://my.68design.net"
designerUrl=${baseUrl}"/search/personal?rc=true&p=1"
#target structure
#./designer/albumName/[imgList]

if [ -f ./log/dFinal.txt ] ; then
    echo "Success: Read desginer list"
else
    #get designer
    #curl -s ${designerUrl} | grep "oneleft" | iconv -f gb2312 -t utf-8 > ./log/d1.txt
    curl -s ${designerUrl} | grep "oneleft" > ./log/d1.txt
    awk -F'[ ]' '{for(i=1;i<=NF;i++){if($i~/href="\//){print $i}}}' ./log/d1.txt > ./log/d2.txt
    awk -F'["]' '{print $2}' ./log/d2.txt > ./log/d3.txt

    #add baseUrl
    index=1
    while read line ; do
        #lineFix=`echo $line | awk -F'[/]' '{print $2}'`

        echo "${baseUrl}"$line"/works" >> ./log/dFinal.txt
        index=`expr $index + 1`
    done < ./log/d3.txt
    rm ./log/d1.txt ./log/d2.txt ./log/d3.txt
    echo "Success: Got designer list ;clear"
fi

#get albums
for i in `cat ./log/dFinal.txt` ;do
    designer=`echo $i | awk -F '[/]' '{print $4}'`
    curl -s $i | grep 'class="linkpv"' > ./log/a1.txt
    awk -F'[ ]' '{for(i=1;i<=NF;i++){if($i~/href="\//){print $i}}}' ./log/a1.txt > ./log/a2.txt
    awk -F'["]' '{print $2}' ./log/a2.txt > ./log/a3.txt
    #add baseUrl
    index=1
    while read line ; do
        #lineFix=`echo $line | awk -F'[/]' '{print $4}' | awk -F'[.]' '{print $1}'`
        echo ${baseUrl}$line >> ./log/aFinal.txt
        index=`expr $index + 1`
    done < ./log/a3.txt
    rm ./log/a1.txt ./log/a2.txt ./log/a3.txt
    echo "Got album data ; clear"

    #get image list of album
    for ii in `cat ./log/aFinal.txt` ; do
        album=`echo $ii | awk -F '[/]' '{print $6}' | awk -F '[.]' '{print $1}'` 
        curl -s $ii | grep 'id="dvImagesBar"' > ./log/i1.txt
        awk -F'[ ]' '{for(i=1;i<=NF;i++){if($i~/src="http/){print $i}}}' ./log/i1.txt > ./log/i2.txt
        awk -F'["]' '{print $2}' ./log/i2.txt >> ./log/iFinal.txt
        rm ./log/i1.txt ./log/i2.txt

        #loop download
        iii_index=1
        for iii in `cat ./log/iFinal.txt`; do
            localFixUrl="./${designer}/${album}-${iii_index}.jpg"
            echo $localFixUrl
            curl -s -m 5000 -o $localFixUrl --create-dirs `echo ${iii/pic\./pic2\.}`
            iii_index=`expr $iii_index + 1 `
        done
        rm ./log/iFinal.txt
        #clear done row

    done
    rm ./log/aFinal.txt
    echo "LoopEnd album data ; clear "

    #clear done row
    sed '1d' ./log/dFinal.txt > ./log/dFinal_tmp.txt
    cp ./log/dFinal_tmp.txt ./log/dFinal.txt
    echo "cleared done row"
done
rm ./log/dFinal.txt
echo "Loop designer end ; clear"

echo complete 
