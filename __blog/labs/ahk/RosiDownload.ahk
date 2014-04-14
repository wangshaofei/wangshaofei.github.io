

s_period_num:=191
period_num:=s_period_num
max_period_num:=199

s_list_num:=1
list_num:=s_list_num
max_list_num:=30

FileCreateDir,F:\rosi_new\%period_num%\
TrayTip,, 已创建文件夹F:\rosi_new\%period_num%\ ,3000

Loop
{
	If(period_num > max_period_num)
		{
			MsgBox,亲，Done~
			Break
		}
	Loop,%list_num%
    ;loop 后面的参数是循环次数
	{
		If(list_num < 10)
		{
			UrlDownloadToFile, http://mm.dulei.si/%period_num%/rosimm-%period_num%-00%list_num%.jpg, H:\rosi_new\%period_num%\%period_num%-%list_num%.jpg
			;TrayTip,, 已下载%period_num%-%list_num%.jpg ,2000
			list_num:=list_num+1

		}
		If(list_num >= 10)
		{
			UrlDownloadToFile, http://mm.dulei.si/%period_num%/rosimm-%period_num%-0%list_num%.jpg, H:\rosi_new\%period_num%\%period_num%-%list_num%.jpg
			;TrayTip,, 已下载%period_num%-%list_num%.jpg ,2000
			list_num:=list_num+1

		}
		If(list_num > max_list_num)
		{
			list_num:=s_list_num
			period_num:=period_num+1
			FileCreateDir,F:\rosi_new\%period_num%\
			TrayTip,, 已创建文件夹F:\rosi_new\%period_num%\ ,3000
			Continue
		}

	}

}


