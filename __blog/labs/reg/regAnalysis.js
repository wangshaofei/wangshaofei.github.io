/*!
 * JS Regex Analysis 
 * http://pnuts.cc/js-regex-analysis
 *
 * Copyright (c) 2009 Pnuts Cotton Candy
 *
 * Date: 2010/1/11
 * Revision: 0.1
 */
var regexAnalysis = {
	config : {
		// example : [ 
		//	leftwrap [ prefix, color, bgcolor ],
		//	rightwrap [ prefix, color, bgcolor ],
		//	color, bgcolor,
		//	underline [ bgcolor, border-color, border-width, mouse-over-color, height ]
		//  folder [ folder-text, color, bgcolor, bordercolor ] 
		//  folder only be effective when underline is effective.
		// ]
		"paren" : [ 
			[ "(", 0, "skyblue" ], 
			[ ")", 0, "skyblue" ], 
			0, 0,
			[ "skyblue", "blue", "5px", "rgb(255,255,128)", "4px" ], 
			[ "...", 0, "rgb(230, 230, 255)", "gray"] 
		],
		"bracket" : [ 
			[ "[", 0, "lightgreen" ],
			[ "]", 0, "lightgreen" ],
			0, 0,
			[ "lightgreen", "green", "5px", "rgb(255,255,128)", "4px" ],
			[ "...", 0, "rgb(230, 255, 230)" , "gray"]
		],
		"curly" : [
			[ "{", 0, "#FFB7DD" ],
			[ "}", 0, "#FFB7DD" ],
			0, 0,
			[ "#FFB7DD", "#FF3333", "5px", "rgb(255,255,128)", "4px" ],
			[  "...", 0, "rgb(255, 230, 230)", "gray"] 
		],
		"vertical-bar" : [ [ "|", 0, "orange" ],0, 0, 0, 0, 0, 0, ],
		space : "2px"
	},

	getDOM : function(regex){
		try {
			if(typeof regex == "string"){
				eval("var s = "+regex+";");
			}
		} catch(err) {
			return document.createTextNode("Not a valid regex expression : " + err.message);
		}
		var pre = document.createElement("pre");
		pre.appendChild(this.geneDOM(this.analyse(regex)));
		return pre; 
	},

	geneDOM : function(res){
		var domBorder = document.createElement("span");
		var dom = document.createElement("span");
		domBorder.appendChild(dom);
		dom.style.styleFloat = "left"; 
		dom.style.cssFloat = "left"; 
		dom.style.marginBottom = "1px";
		var leftWrap = 0, rightWrap = 1, color = 2, bgcolor = 3, underline = 4, folder = 5;
		var conf = this.config[res.type];
		var addWrap = function(wrap){
			if(conf[wrap]){
				var item;
				if(conf[wrap][1] || conf[wrap][2]){
					item = document.createElement("span");
					item.style.styleFloat = "left";
					item.style.cssFloat = "left";
					item.style.color = conf[wrap][1];
					item.style.backgroundColor = conf[wrap][2];
					item.innerHTML = conf[wrap][0];
				} else {
					item = document.createTextNode(conf[wrap][0]);
				}
				dom.appendChild(item);
			}
		};
				
		if(conf){
			dom.style.color = conf[color] || "";
			dom.style.backgroundColor = conf[bgcolor] || "";
			addWrap(leftWrap);
		}
		if(res.children){
			for(var i = 0; i < res.children.length; i++){
				dom.appendChild(this.geneDOM(res.children[i]));
			}
		}
		if(res.content){
			dom.appendChild(document.createTextNode(res.content));
		}
		if(conf){
			addWrap(rightWrap);
			if(conf[underline]){
				var folderItem;

				if(conf[folder]){
					folderItem = document.createElement("div");
					if(this.isIe6){
						folderItem.innerHTML = conf[folder][0] || "...";
					} else {
						folderItem.innerHTML = "<div style=\"margin-bottom:-1px\">" + (conf[folder][0] || "...") + "</div>";
					}
					folderItem.style.color = conf[folder][1] || "";
					folderItem.style.backgroundColor = conf[folder][2] || "";
					folderItem.style.border = "1px solid " + ( conf[folder][3] || "gray" );
					folderItem.style.display = "none";
					folderItem.style.cssFloat = "left";
					folderItem.style.styleFloat = "left";
					folderItem.style.cursor = "pointer";
					folderItem.style.margin = " 0 3px 0 3px";
					domBorder.appendChild(folderItem);

					folderItem.onmouseup = function(){
						dom.style.display = "inline";
						folderItem.style.display = "none";
					}
				}

				var item = document.createElement("div");
				item.style.clear = "both";
				item.style.backgroundColor = conf[underline][0] || "";
				item.style.borderColor = conf[underline][1] || "";
				item.style.borderStyle = "solid";

				if(this.isIe7 || this.isIe6){
					item.innerHTML = "\255";
					item.style.lineHeight = conf[underline][4];
				}else{
					item.style.height = conf[underline][4] || "3px";
					item.style.overflow = "hidden";
				}

				dom.style.marginBottom = this.config.space;

				item.style.cursor = "pointer";
				item.style.fontSize = "0";
				item.style.borderWidth = "0px " + conf[underline][2];
				dom.appendChild(item);

				item.onmouseover = function() {
					dom.style.backgroundColor = conf[underline][3] || "";
				}

				item.onmouseout = function() {
					dom.style.backgroundColor = conf[bgcolor] || "";
				}

				if(conf[folder]){
					item.onmouseup = function() {
						dom.style.display = "none";
						folderItem.style.display = "inline";
					}
				}
			}
		}
		return domBorder;
	},
	
	geneItem : function(_type, _parent, _len){
		var item = {
			type : _type,
			parent : _parent,
			children : [],
			length : _len
		};
		if(_parent){
			_parent.children.push(item);
		}
		return item;
	},

	caculateLen : function(res){
		var len;
		if(len = res.length){ return len; }
		if(res.content && (len = res.content.length)){ return len; }
		for(var i = 0, len = 2; i < res.children.length; i++){
			len += this.caculateLen(res.children[i]);
		}
		res.length = len;
		return len;
	},	

	analyse : function(regex){
		var	paren = 0, // ( )
			bracket = 0, // [ ]
			curly = 0, // { }
			backslash = 0 , // \
			text = 0;

		if((!this.versionTested) && navigator.appName == "Microsoft Internet Explorer"){
			this.versionTested = true;
			var v = navigator.appVersion;
			v = parseFloat(v.substring(v.indexOf("MSIE")+5,v.lastIndexOf("Windows")));
			if(v < 7.0){
				this.isIe6 = true;
			}else if(v >= 7.0 && v < 8.0){
				this.isIe7 = true;
			}
		}

		var res = this.geneItem("root"), curr = res;
		regex = regex + "";
		for(var i = 0; i < regex.length; i++){
			var c = regex.charAt(i);
			var changed = true; 
			if(!backslash){
				if(!bracket) {
					if( '(' == c ) {
						paren ++; 
						curr = this.geneItem("paren", curr);			
					} else if ( '[' == c ) { 
						bracket++;
						curr = this.geneItem("bracket", curr);
					} else if ( '|' == c ){
						curr = this.geneItem("vertical-bar", curr, 1).parent;
					} else if ( ')' == c) {
						paren --;
						curr = curr.parent;
					} else if ( '{' == c ) {
						curly ++;
						curr = this.geneItem("curly", curr);
					} else if ( '}' == c ) {
						curly --;
						curr = curr.parent;
					} else {
						changed = false;
					}
				} else if( ']' == c ) {
					bracket --;
					curr = curr.parent;	
				} else {
					changed = false;
				}
				if(changed) { text = 0; continue; }
			}	
			if(!text){
				text = { type : "text", content : c };
				curr.children.push(text);
			} else {
				text.content += c;
			}
			if('\\' == c) {
				backslash = !backslash;
				continue;
			}
			if(backslash){ backslash = false; }
		}
		this.caculateLen(res);
		res.length -= 2;
		return res;
	}
}