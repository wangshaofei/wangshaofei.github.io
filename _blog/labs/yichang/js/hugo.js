$(function(){
	tabEvent();
	imgSelectEvent();
	nextPreEvent();
	inputEvent('#tab2');
    inputEvent('#js_user');

    // init canvas
    Dv.init({id: 'dressCanvas', width: 700, height: 400});

    uiInit();
});

/**
 * tab切换事件 
 */
var tabEvent = function(){
	$('#js_tabs a').on('click',function(){
		var $a = $(this),
			id = $a.attr('href');
		$('#js_tabs a').removeClass('selected');	
		$a.addClass('selected')
		
		$(id).show().siblings('div').hide();
		return false;	
	});
};

/* UI init */
var uiInit = function () {
    /* 展开收起衣柜 */
    $('#triggerFav').on('click', function () {
        $('#contFav').fadeToggle('fast', 'linear');
    });

    /* type range control */
    $('input[type=range]').on('change', function () {
        $(this).next('input').val(this.value);
    });

    // init base dress
    var c_data = {
        renderType: 'base',
        dressType: 'upperBody',
        data: getData('#tab2')
    };
    Model.render(c_data);
};

/**
 * 选中衣柜衣服事件 符合用户身材的衣服数据
 */
var imgSelectEvent = function(){
	$('li','#contFav').on('click',function(){
		var $this = $(this),
			data = getCustomModel($this.find('img'), 'base');
		$this.addClass('selected').siblings('li').removeClass('selected');

        // render it by Alex
        Model.render(data);
		return false;
	});
};

/**
 * 上一步 下一步 事件 
 */
var nextPreEvent = function(){
	$('#js_next').on('click',function(){
		if($('#js_content').is(":animated")){return;}
		$('#js_content').animate({left: '-=900px'}, "slow");
		$('#js_next,#js_pre,#js_done').toggle();
		$('#stepNumber span').toggleClass('on');

		
		// var container_id = '#tab2';
		// var type = $(container_id).attr('data-type');
		// var c_data = {
			// renderType: type,
		    // dressType: 'upperBody',
		    // data: getData(container_id)
		// };
        // // 一起render就好了
        // Model.render(c_data);
		
		return false;
	});
	
	$('#js_pre').on('click',function(){
		if($('#js_content').is(":animated")){return;}
		$('#js_content').animate({left: '+=900px'}, "slow");
		$('#js_next,#js_pre,#js_done').toggle();
		$('#stepNumber span').toggleClass('on');
		
		return false;
	});
	
	$('#js_done').on('click',function(){
		var container_id = '#js_user';
		var type = $(container_id).attr('data-type');
		var c_data = {
			renderType: type,
		    dressType: 'upperBody',
		    data: getData(container_id)
		};
        // 一起render就好了
        Model.render(c_data);
	});
	
	//上一步 下一步 同步事件
	$('#stepNumber span').on('click',function(){
		var $this = $(this),
			index = $this.index(),
			hason = $this.hasClass('on');
		
		if(hason) return;
		//上一步
		if(index == 0){
			$('#js_pre').trigger('click');
			console.info(index,'0');
		}else{
			$('#js_next').trigger('click');
			console.info(index,'1');
		}
	})
};

/**
 * 容器事件 
 */
var inputEvent = function(container_id){
	$(':input',container_id).on('input',function(){
		var draw = true;
		$(container_id).find(':input').each(function(){
			var $input = $(this),
				val = $input.val();
			if(!val){
				draw = false;
				return false;
			};
		});
		//如果都存在值
		if(draw){
			var type = $(container_id).attr('data-type');
			var c_data = {
				renderType: type,
			    dressType: 'upperBody',
			    data: getData(container_id)
			};
			

			if(type === 'base'){
				//以前的衣服
			}else{
				//想购买的的衣服
			}
            // 一起render就好了
            Model.render(c_data);

		};//if
		
	});
};

/**
 * 获取衣柜内选中的衣服 数据
 * @param {Jquery object} $img 选中的衣服
 */
var getCustomModel = function($img, type){
	var c_data = {
		renderType: type,
	    dressType: 'upperBody',
	    data: {
	        nagasa: Number($img.attr('data-nagasa')),
	        shoulder: Number($img.attr('data-shoulder')),
	        waist: Number($img.attr('data-waist')),
	        sleeve: Number($img.attr('data-sleeve'))
	    }
	};
	return c_data;
};


/**
 * 根据表单对象 遍历获取数据 
 */
var getData = function(form_id){
	var obj = {};
	$(':input[data-name]',form_id).each(function(){
		var $this = $(this),
			key = $this.attr('data-name'),
			val = $this.val();
		obj[key] = val;	
	});
	return obj;
};

/**
 * 通过 容器获取数据
 * @param {string} container
 */
var getInputData = function(container){
	
};
