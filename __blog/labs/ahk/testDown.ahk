;s_period_num:=191
;period_num:=s_period_num
;max_period_num:=199

;s_list_num:=1
;list_num:=s_list_num
;max_list_num:=30

list_num:=1
max_list_num:=14

FileCreateDir,F:\testM\
TrayTip,, 已创建文件夹F:\testM\ ,3000

Loop
{
    If(list_num > max_list_num)
    {
        MsgBox,亲，Done~
        Break
    }
    If(list_num < 10)
    {
        UrlDownloadToFile, http://www.m.com/t0%list_num%.jpg, F:\testM\%list_num%.jpg
        ;TrayTip,, 已下载 ,2000
        list_num:=list_num+1
        MsgBox, Stop
    }
    If(list_num >= 10)
    {
        UrlDownloadToFile, http://www.m.com/t%list_num%.jpg, F:\testM\%list_num%.jpg
        ;TrayTip,, 已下载%list_num%.jpg ,2000
        list_num:=list_num+1
    }

}
