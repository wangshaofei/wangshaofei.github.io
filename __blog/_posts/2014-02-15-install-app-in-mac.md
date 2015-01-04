---
layout: post
title: "Mac下安装application"
description: "之前在Linux下使用Apt-get或Yum命令安装过软件，很是方便。转到Mac后，也想寻找类似apt-get这样的工具来安装和管理系统的软件。经过一番搜索，发现MacPorts和Fink都不错，Homebrew的口碑也是非常好。"
category: other
tags: []
---
{% include JB/setup %}

之前在Linux下使用Apt-get或Yum命令安装过软件，很是方便。转到Mac后，也想寻找类似apt-get这样的工具来安装和管理系统的软件。经过一番搜索，发现MacPorts和Fink都不错，Homebrew的口碑也是非常好。

但MacPorts有个原则，对于软件包之间的依赖，都在MacPorts内部解决，无论系统本身是否包含了需要的库，都不会加以利用。这使得MacPorts过分的庞大臃肿，导致系统出现大量软件包的冗余，占用不小的磁盘空间，同时稍大型一点的软件编译时间都会难以忍受。而Homebrew的原则恰恰相反，它尽可能地利用系统自带的各种库，使得软件包的编译时间大为缩短；同时由于几乎不会造成冗余，软件包的管理也清晰、灵活了许多。Homebrew的另一个特点是使用Ruby定义软件包安装配置（叫做formula），定制非常简单。


###安装Homebrew(Need xCode)

    ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

###Homebrew 常用命令

    man brew            # 完整命令帮助
    brew --help         # 帮助
    brew search wget    # 搜索软件包
    brew install wget   # 安装软件包
    brew uninstall wget # 卸载软件包
    brew list           # 显示已经安装的所有软件包
    brew update         # 同步远程最新更新情况，对本机已经安装并有更新的软件用*标明
    brew outdated       # 查看已安装的哪些软件包需要更新
    brew upgrade wget   # 更新单个软件包
    brew info wget      # 查看软件包信息
    brew home wget      # 访问软件包官方站
    brew cleanup        # 清理所有已安装软件包的历史老版本
    brew cleanup wget   # 清理单个已安装软件包的历史版本

###程序安装路径及文件夹

    -bin          #用于存放所安装程序的启动链接（相当于快捷方式）
    -Cellar       #所有brew安装的程序，都将以[程序名/版本号]存放于本目录下
    -etc          #brew安装程序的配置文件默认存放路径
    -Library      #Homebrew 系统自身文件夹
    +–Formula     #程序的下载路径和编译参数及安装路径等配置文件存放地
    +–Homebrew    #brew程序自身命令集

BTW：ruby的gem也可以用来安装应用程序，当你想用homebrew安装的应用不在列表中，或者对应的资源被墙，不妨试试这个。
