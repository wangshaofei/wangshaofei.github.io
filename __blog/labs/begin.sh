#!/bin/sh

A=$1
B=$2
#这种方式也可以执行逻辑计算。之前是用$(($A+$B))
C=$[$A+$B]

# test get img
cStart=551
cEnd=592

pStart=1
pEnd=60

count=$pStart

parseNum ()
{
   if [ "$1" -ge 0 ] && [ "$1" -lt 10 ]
       then echo '00'$1
   fi

   if [ "$1" -ge 10 ] && [ "$1" -lt 100 ]
       then echo '0'$1
   fi

   if [ "$1" -ge 100 ]
       then echo $1
   fi
}

while [ "$cStart" -lt "$cEnd" ]
do
    #mkdir -p './pic/'`parseNum $cStart`

    while [ "$count" -lt "$pEnd" ]
    do
        URL='http://mm.dulei.si/NO.'`parseNum $cStart`'/rosimm-'`parseNum $cStart`'-'`parseNum $count`'.jpg'
        RETURN=`curl -o /dev/null -s -w "%{http_code}" "$URL"`

        if [ $RETURN == '200' ]
            then curl 'http://mm.dulei.si/NO.'`parseNum $cStart`'/rosimm-'`parseNum $cStart`'-'`parseNum $count`'.jpg' > './pic/rosimm-'`parseNum $cStart`'-'`parseNum $count`'.jpg'
        fi

        count=`expr $count + 1`
    done

    count=$pStart
    cStart=`expr $cStart + 1`
done

echo done!
