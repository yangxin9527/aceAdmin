/*
 * description：公用函数JS
 * author：yuxuemei
 * Date: 2016-01-07T15:00Z
 */
var tokenVal = "";
var ORGID = "";
var ORGOBJ = "";
/**
 * @description 数据增，查询（表格），查询（自定义），删
 */

Data = {
    open:function (data) {
        if(!data.title){
            data.title = "提示"
        }

        if(!data.size){
            data.size = null
        }

        $.ajax({url:data.url,
            type:"GET",
            data:"",
            cache:false,
            dataType:'html',
            success:function(html){
                bootbox.dialog({
                    title:data.title,
                    size:  data.size,
                    message: html,
                    buttons: data.buttons
                });
            }
        });
    },
    getToken:function(){
        tokenVal = $.cookies.get("t");
        if(tokenVal){
            tokenVal = "t="+tokenVal;
            return tokenVal;
        }else{
            return "";
        }
    },
    getUser:function(){
        var userObj = $.cookies.get("user");
        return userObj;
    },
    /**
     * @description 异步提交表单
     * @param reguestType 请求服务器的方式 get/post
     * @param remind 是否需要提示信息 0：需要；1：不需要
     * @param requestUrl 请求服务器url地址
     * @param callback 表单提交成功之后的回调函数
     * @author yuxuemei
     * @date 2016-01-14
     */
    dataSubmit : function (reguestType,requestUrl,remind,formName,needToken,callback){
        Data.dataSubmitToken(reguestType,requestUrl,remind,formName,needToken,callback);
    },
    checkUrlHasParam:function(url,needToken){
        if(needToken){
            var t = Data.getToken();
            if(t){
                url = Data.pingUrl(url,t);
            }else{
                delSession();
            }
        }
        return url;
    },
    //拼接url
    pingUrl:function(url,newParam){
        if(url.indexOf("?") >= 0){
            if(url.substring(url.length-1,url.length) == "&"){
                url += newParam;
            }else{
                url += ("&"+newParam);
            }
        }else{
            url += ("?"+newParam);
        }
        return url;
    },
    dataSubmitToken : function (reguestType,requestUrl,remind,formName,needToken,callback) {
        var _form = $("form[name='"+formName+"']");

                if(needToken == null){
                    needToken = false;
                }
                var url = Data.checkUrlHasParam(BASEURL + requestUrl,needToken);
                var urlIe = url+"&"+_form.serialize();

                    var options = {
                        type:reguestType,
                        url: url,
                        async:false,
                        beforeSubmit:showLoad,//加载loading
                        success: function(data) { // data 保存提交后返回的数据，一般为 json 数据
                            hideLoad();//清除lodaing
                            data = DataDeal.parseString(data);
                            // 此处可对 data 作相关处理
                            if(!data.code){
                                if(!remind){
                                    //若需要特殊提示则isRemind设置1后再相应请求的回调函数中处理提示信息
                                    ui.success(data.msg);
                                }

                                if(callback != undefined){
                                    callback(data);
                                }
                            }else{

                                getErrorMess(data.code,data.msg);
                            }
                        },
                        error: function(data) {

                            hideLoad();//清除lodaing
                        }
                    };
                    _form.ajaxSubmit(options);
                    return false; // 阻止表单自动提交事件



    },
    /**
     * @description ajax获取数据-表格插件(含分页)
     * @param reguestType 请求服务器的方式 get/post
     * @param requestUrl 请求服务器url地址
     * @param requestParams 传给服务器的参数 例：name=zhang&password=123456
     * @param current 当前是第几页 默认给1
     * @param tableId 添加表格数据的ID
     * @param columns 表格显示列为对象数组 例：[{"data": "id" },{"data": "name" }]
     * @param dataNode 服务器返回数据需要显示数据的节点名称
     * @param series 服务器返回的json级数，目前有3和2
     * @param pagesize 每页显示多少条
     * @care 要被dataTable处理的table对象，必须有thead与tbody,且用元素包含table
     * @author yuxuemei
     * @date 2016-01-14
     */
    getDataTable : function (reguestType,requestUrl,requestParams,current,tableId,columns,dataNode,series,pagesize,callback){
        Data.getDataTableToken(reguestType,requestUrl,requestParams,current,tableId,columns,dataNode,series,true,pagesize,callback);
    },
    getDataTableToken : function(reguestType,requestUrl,requestParams,current,tableId,columns,dataNode,series,needToken,pagesize,callback){
        //查询时显示加载中...
        var tdLen = $("#"+tableId+" td").length;
         $("#"+tableId+ " tbody").html('<tr role="row" class="odd"><td colspan="'+tdLen+'">加载中···</td></tr>');

        var dataJson,dataAll;
        var pageParam = "";
        if(pagesize == undefined){
            pagesize = pageSize;
        }
        if(current){
            var pageP = "pageNum="+current+"&pageSize="+pagesize;
            if(requestParams == ""){
                if(requestUrl.indexOf("?") >= 0){
                    pageParam = "&"+pageP;
                }else{
                    pageParam = pageP;
                }
            }else{
                pageParam = "&"+pageP;
            }
        }
        if(needToken == null){
            needToken = false;
        }
        var param = requestParams + pageParam;
        var url = Data.checkUrlHasParam(BASEURL + requestUrl,needToken);
        if(needToken){
            var paramCommon = requestParams + pageParam;
            if(requestParams!=""){
                param = "&" + paramCommon;
            }else{
                param = paramCommon;
            }
        }

        //传入返回的总条数
        $('#'+tableId).dataTable({
            "bLengthChange":false, //关闭每页显示多少条数据
            "bAutoWidth":false,
            "bInfo": false,//页脚信息
            "bServerSide": true,
            "bPaginate":false,
            "destroy":true, //解决翻页提示不能重新初始化问题
            "bSort":false,
            "searching":false,
            "sAjaxDataProp":dataNode,
            "sAjaxSource": url,
            "fnServerData": function(sSource,aoData,fnCallback){
                //根据当前表格查找总条数的元素元素进行复制,解决其他页面结果没有返回又点新页面总条数覆盖显示成了其他页面的结果
                var _totalEle = $("#"+tableId + "_wrapper").prev().find("#datatable_total");
                var jsonStr = DataDeal.formToJson(param);
                jsonStr = JSON.parse(jsonStr);
                $.ajax({
                    dataType: 'json',
                    type: reguestType,
                    url: sSource,
                    data: jsonStr,
                    success: function(data){
                        data = DataDeal.parseString(data);
                        dataAll = data;
                        if (!data.code) {
                            //显示总条数

                            if(series == 3){
                                dataJson = data.data;
                            }else if(series == 2){
                                dataJson = data;
                                var total = data.data.total;
                                if(total != undefined){
                                    _totalEle.text(total);
                                }

                            }
                            fnCallback(dataJson);
                        }else {
                            getErrorMess(data.code,data.msg);
                        }
                    }
                })

            },
            "columns": columns,
            fnInitComplete : function(){

                //0
                if(current){
                    Data.dataPaginationTable(reguestType,requestUrl,requestParams,dataJson.pages,tableId,current,columns,dataNode,series,needToken,pagesize,callback);
                }
                if(callback !=undefined){
                    callback(dataAll);
                }
            }
        });
    },
    /**
     * @description ajax获取数据--拼接html显示(需要分页时在回调中使用dataPagination函数)
     * @param reguestType 请求服务器的方式 get/post
     * @param requestUrl 请求服务器url地址
     * @param requestParams 传给服务器的参数 例：name=zhang&password=123456
     * @param remind 是否需要弹出提示信息 0:需要弹出；1：不需要弹出
     * @param callback 回调函数
     * @author yuxuemei
     * @date 2016-01-15
     *
     * 用法举例
     * var requestUrl="train/gettrain";
     * var requestParams="userId=userid&username=username"
     * data.dataJson(requestUrl,requestParams,function(trainJsonArray){
     *   var length=trainJsonArray.length;
     *   var html=""
     *   //循环显示数据并显示在相应的区域
     *   for (var i = 0; i < length; i++) {
     *       html+='<div>'+trainJsonArray[i]['username']+'</div>';
     *       var _divId=$('#trainId');
     *       _divId.empty();
     *       _divId.html(html);
     *   };
     *  });
     */
    getDataComb : function (reguestType,requestUrl,requestParams,remind,callback) {
        //IE请求处理
        Data.getDataCombToken(reguestType,requestUrl,requestParams,remind,true,callback);
    },
    getDataCombToken : function(reguestType,requestUrl,requestParams,remind,needToken,callback){
        var urlCommon = Data.checkUrlHasParam(BASEURL + requestUrl,needToken);
        var urlIe ="";
        if(requestParams != ""){
            urlIe = urlCommon + "&" + requestParams;
        }else{
            urlIe = urlCommon;
        }
        var url = requestParams;

        $.ajax({
            type:reguestType,
            dataType:'json',
            url:urlCommon,
            //序列化转化为JSON对象
            data:JSON.parse(DataDeal.formToJson(url)),
            success:function (data) {
                data = DataDeal.parseString(data);
                //执行回调函数
                callback(data);
                if (data.code == 0) {
                    //弹出成功提示信息
                    if(!remind){
                        ui.success(data.msg);
                    }
                }else{
                    //判断用户权限的接口不提示错误信息
                    if(requestUrl == "/user/v1/verifyAdmin"  || requestUrl == "/user/v1/queryOrder"){

                    }else{
                        getErrorMess(data.code,data.msg);
                    }
                }
            }
        }, 'json');

    },
    /**
     * @description 支持数据以模板显示
     * @param templateId 模板id  命名规则 temp_(相应页面名称)
     * @param data 服务器返回的json数据
     * @param nodeId html元素Id  命名规则 (相应页面名称)
     * @param current 当前在第几页,默认传1,传0为没有翻页
     * @author yuxuemei
     * @date 2016-03-02
     */
    showDataTemplate : function(requestUrl,requestParams,reguestType,remind,templateId,data,elementId,current,needToken,callback){
        core.loadFile(THEME_URL + 'js/public/nodetpl.client.min.js',function(){
            //模板id的内容
            var content = $("#"+templateId).html();
            //执行渲染
            nodetpl.render(content, data, function(dom){
                //将数据显示在html页面上
                $("#"+elementId).html(dom);
                if(callback != undefined){
                    callback(data);
                }
                //传入0为不翻页
                if(current){
                    Data.dataPaginationTemplate(requestUrl,requestParams,reguestType,remind,templateId,data.data.pages,elementId,current,needToken,callback);
                }
            });
        })
    },
    /**
     * @description ajax获取数据--使用模板引擎显示(含分页)
     * @param reguestType 请求服务器的方式 get/post
     * @param remind 是否需要弹出提示信息 0:需要弹出；1：不需要弹出
     * @param requestUrl 请求服务器url地址
     * @param requestParams 传给服务器的参数json 例：name=zhang&password=123456
     * @param templateId 模板id  命名规则 temp_(相应页面名称)
     * @param nodeId html元素Id  命名规则 (相应页面名称)
     * @author yuxuemei
     * @date 2016-01-21
     *
     * 用法举例
     * var requestUrl="train/gettrain";
     * var requestParams={userId:userid}
     * data.getDataTemplate(requestUrl,requestParams,'temp_trainList','trainList');
     *
     * 模板(与html一致，js代码加到<?...?>中间)
     * <script id="temp_trainList" type="text/template">
     * <ul>
     * <? var len=data.orgs.length?>
     * <?for(var i=0; i<len; i++){?>
     *  <li><?=data.orgs[i].id?>：<?=data.orgs[i].name?></li>
     * <?}?>
     * </ul>
     * </script>
     */
    getDataTemplate : function (reguestType,requestUrl,requestParams,remind,templateId,elementId,current,callback) {
        Data.getDataTemplateToken(reguestType,requestUrl,requestParams,remind,templateId,elementId,current,true,callback);
    },
    /**
     * @description ajax删除数据
     * @param reguestType 请求服务器的方式 get/post
     * @param requestUrl 请求服务器url地址
     * @param requestParams 传给服务器的参数json 例：name=zhang&password=123456
     * @param isSure 是否需要弹出确定删除的对话框 0:需要弹出；1：不需要弹出
     * @param sureMess 若需要确认询问需要给予提示语句
     * @author yuxuemei
     * @date 2016-01-14
     */
    getDataTemplateToken : function (reguestType,requestUrl,requestParams,remind,templateId,elementId,current,needToken,callback){
        //培训班和课程，每页显示20条
        if(elementId == "trainTotallist" || elementId == "trainclassList"|| elementId == "data_list"){
            pageSize=12;
        }
        var pageParam = "";
        var pageUrl="";
        if(current){
            pageUrl = "pageNum="+current+"&pageSize="+pageSize;
            if(requestParams == ""){
                pageParam = pageUrl;
            }else{
                pageParam = "&"+pageUrl;
            }
        }
        var url = Data.checkUrlHasParam(BASEURL + requestUrl,needToken);
        //console.log(url);
        if(requestParams == ""){
            var urlIe = url + "&" + pageUrl;
        }else{
            var urlIe = url + "&" + requestParams + pageParam;
        }

        $.ajax({
            type:reguestType,
            url:url,
            data:JSON.parse(DataDeal.formToJson(requestParams + pageParam)),
            success:function (data) {
                data = DataDeal.parseString(data);
                if (!data.code) {
                    //弹出成功提示信息
                    if(!remind){
                        ui.success(data.msg);
                    }
                    //引用nodetpl.client.min.js支持模板显示
                    Data.showDataTemplate(requestUrl,requestParams,reguestType,remind,templateId,data,elementId,current,needToken,callback);
                } else {
                    getErrorMess(data.code,data.msg);
                }
            }
        }, 'json');

    },
    deleteData : function (requestType,requestUrl,requestParams,isSure,sureMess,callback) {


        if(!isSure){
            ui.confirmBox(REMIND_TIT, sureMess, function () {
                Data.deleteRequest(requestType,requestUrl,requestParams,callback);
            })
        }else{
            Data.deleteRequest(requestType,requestUrl,requestParams,callback);
        }

    },
    deleteRequest : function(requestType,requestUrl,requestParams,callback){
        $.ajax({
            type:requestType,
            url:Data.checkUrlHasParam(BASEURL + requestUrl,true),
            data:JSON.parse(DataDeal.formToJson(requestParams)),
            success:function (data) {
                data = DataDeal.parseString(data);
                if (!data.code) {
                    if(callback != undefined){
                        callback(data);
                    }
                    //统一弹出删除成功
                    ui.success(data.msg);
                } else {
                    getErrorMess(data.code,data.msg);
                }
            }
        }, 'json');
    },
    deleteRequestIe : function(requestType,requestUrl,requestParams,callback){
        var xdr = new XDomainRequest();
        xdr.open(requestType,Data.checkUrlHasParam(BASEURL + requestUrl,true) + requestParams);
        xdr.send();
        xdr.onload=function(){
            var data=jQuery.parseJSON(xdr.responseText);
            if (!data.code) {
                if(callback != undefined){
                    callback(data);
                }
                //统一弹出删除成功
                ui.success(data.msg);
            } else {
                getErrorMess(txt.code,txt.msg);
            }
        }
    },
    /**
     * @description 分页函数
     * @param totalData 总条数
     * @param elementId 显示数据的父元素id
     * @param type 0:表格；1：模板
     * @author yuxuemei
     * @date 2016-03-02
     */
    dataPaginationTable : function(reguestType,requestUrl,requestParams,totalData,elementId,current,columns,dataNode,series,needToken,pagesize,callback){
        var _table = elementId +"_wrapper";
        Data.dataPagination(totalData,_table,function(){
            $("#" + _table).parent().find('.pagination').pagination({
                pageCount: totalData,    //总页数
                current:current,        //当前为第几页
                jump:true,              //是否开启跳转到指定页数
                coping:true,            //是否开启首页和末页
                homePage:FIRST_PAGE,        //首页节点内容
                endPage:LAST_PAGE,         //末页节点内容
                prevContent:PREV_PAGE,     //上页节点内容
                nextContent:NEXR_PAGE,     //下页节点内容
                callback:function(index){
                    Data.getDataTableToken(reguestType,requestUrl,requestParams,index,elementId,columns,dataNode,series,needToken,pagesize,callback);
                }
            })
        })
    },
    dataPaginationTemplate : function(requestUrl,requestParams,reguestType,remind,templateId,totalData,elementId,current,needToken,callback){
        Data.dataPagination(totalData,elementId,function(){
            $('.pagination').pagination({
                pageCount: totalData,    //总页数
                current:current,        //当前为第几页
                jump:true,              //是否开启跳转到指定页数
                coping:true,            //是否开启首页和末页
                homePage:FIRST_PAGE,        //首页节点内容
                endPage:LAST_PAGE,         //末页节点内容
                prevContent:PREV_PAGE,     //上页节点内容
                nextContent:NEXR_PAGE,     //下页节点内容
                jumpBtn:'GO',   //跳转节点内容
                callback:function(index){
                    Data.getDataTemplateToken(reguestType,requestUrl,requestParams,remind,templateId,elementId,index,needToken,callback);
                }
            })
        })
    },
    dataPagination : function(totalData,elementId,callback){
        $("#" + elementId).parent().find(".pagination").remove();
        if(totalData != null && totalData != "" && totalData > 0){
            //#example_wrapper table数据生成后自动产生的父div的id
            $("#" + elementId).parent().append("<ul class='pagination'></ul>");
            callback();
        }
    },
    /* description 用户上传图片和文件
     * param 表单id 表单的id值
     * param requestUrl 请求地址
     * param requestParam 请求参数
     * param type 图片："imgage" 文件："file"
     * param callback 回调函数
     * author yuxuemei
     * date 2016-3-15
     */
    upload : function(formId,requestUrl,requestParam,fileId,type,callback){
        if(fileId !=""){
            var fileVal = $("#"+fileId).val();
            var mime = fileVal.toLowerCase().substr(fileVal.lastIndexOf("."));
            if( type == "image"){
                if($.trim(fileVal) == ""){
                    ui.error(SELECT_FILE);
                }else{
                    if(mime == ".jpg" || mime == ".png" || mime == ".gif"){
                        Data.submitData(formId,requestUrl,requestParam,fileId,type,callback);
                    }else{
                        ui.error(SELECT_PNG);
                    }
                }
            }else if(type == "mp4"){
                if($.trim(fileVal) == ""){
                    ui.error(SELECT_FILE);
                }else{
                    if(mime == ".mp4"){
                        Data.submitData(formId,requestUrl,requestParam,type,callback);
                    }else{
                        ui.error(SELECT_MP4);
                    }
                }
            }else if(type == "file"){
                if($.trim(fileVal) == ""){
                    ui.error(SELECT_FILE);
                }else{
                    Data.submitData(formId,requestUrl,requestParam,type,callback);
                }
            }else{
                if($.trim(fileVal) == ""){
                    ui.error(SELECT_FILE);
                }else{
                    Data.submitData(formId,requestUrl,requestParam,fileId,type,callback);
                }
            }
        }else{
            Data.submitData(formId,requestUrl,requestParam,fileId,type,callback);
        }
    },
    submitData : function(formId,requestUrl,requestParam,fileId,type,callback){
        //console.log(Data.checkUrlHasParam(BASEURL + requestUrl));
        core.loadFile(THEME_URL + 'js/public/jquery-form.js',function () {
            $("#"+formId).ajaxSubmit({
                type: "POST",//提交类型
                dataType: 'text',
                url: Data.checkUrlHasParam(BASEURL + requestUrl,true),//请求地址
                data:  JSON.parse(DataDeal.formToJson(requestParam)),//请求数据
                success: function (data) {//请求成功后的函数
                    data = DataDeal.parseString(data);
                    if (data.code) {//返回警告
                        ui.error(data.msg);
                    } else {//返回成功
                        if(callback != undefined){
                            callback(data);
                        }
                        ui.success("上传成功！");
                    }
                }
            });
        })
    }
};
/**
 * @description 获取宽高
 * @author from 付
 * @date 2016-01-14
 */
var _w,_h,_top,_left;
var getWh = function(){
    _w = $(window).width();
    _h = $(window).height();
    _top = Math.floor((_h-100)/2);
    _left = Math.floor((_w-100)/2);
};

/**
 * @description 提交之后成功之前加载loading
 * @author  from 付
 * @date 2016-01-14
 * @editor yxm 2016-04-07
 */
var showLoad = function(){
    // getWh();
    // window.onresize = function () {
    //     getWh();
    //     $('#loading').css({'width':_w,'height':_h});
    // };
    // //查找有没有正在加载的元素 ，没有再追加
    // if($('body').find("#loading").length == 0 && $('body').find("#loading_img").length == 0){
    //     $('body').append('<div id="loading" class="boxy-modal-blackout" style="opacity: 0.1; height: '+_h+'px; width: '+_w+'px; z-index: 991;"></div>\n\
    //                   <img id="loading_img" style="position:absolute;z-index: 992;top:'+_top+'px;left:'+_left+'px;" src="'+THEME_URL+'/images/public/loadings.gif">');
    // }
};

/**
 * @description 提交成功之后清除loading
 * @author  from 付
 * @date 2016-01-14
 */
var hideLoad = function(){
    // $('#loading').remove();
    // $('#loading_img').remove();
};

/*
 * @description获取url地址的参数
 * @param name 需要获取的url参数
 * @author  yuxuemei
 * @date 2016-01-14
 */
var getUrlParam = function(name) {
    //构造一个含有目标参数的正则表达式对象
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //匹配目标参数
    var r = window.location.search.substr(1).match(reg);
    //返回参数值
    if (r != null) return unescape(r[2]);
    return null;
};

/*
 * @description表格的全选功能
 * @param id 包含所有复选框的元素id
 * @param self 单击的全选复选框的id
 * @author  yuxuemei
 * @date 2016-01-19
 */
var checkAll = function(id,self){
    var checked = ($("#" + self).attr('checked') == 'checked') ? true : false;
    $("#" + id).find('input[type="checkbox"]').not($("#"+self)).attr('checked', checked);
};

/*
 * @description获取选择的juqery对象
 * @param elementId:元素id ;
 * @param selectAllId:单击的全选id;
 */
function getCheckedObject(elementId,selectAllId){
    var checkedObject=$('#'+elementId).find('input[type="checkbox"]:checked').not($("#"+selectAllId));
    return checkedObject;
}

/**
 * @description 数据转换函数集
 */
DataDeal = {
    /**
     * @description 将表单序列化数据转为JSON
     * @param data 序列化数据
     * @return json数据
     * @author yuxuemei
     * @date 2016-01-14
     */
    formToJson: function (data) {
        if(data!=""){
            //通过&符号将参数分隔为数组
            var array = data.split("&");
            var len = array.length;
            var obj="";
            //循环将各数组元素的第一个=号替换为：
            for (var i = 0; i <len; i++) {
                //去掉多余的&符号
                if(array[i] !=""){
                    var p = "\"" + array[i].replace("=","\":\"")+"\"";
                    if(i == len-1){
                        obj += p;
                    }else{
                        obj += p +",";
                    }
                }
            };
            data = "{" + obj + "}";
            /* 2016-7-4 注释原因：含多个==号时出错
             data = data.replace(/&/g,"\",\"");
             data = data.replace(/=/g,"\":\"");
             //console.log(data);
             data = "{\"" + data+"\"}";*/
            return data;
        }else{
            return "{}";
        }
    },
    parseString:function(str){
        if(typeof str == "string"){
            var json = JSON.parse(str);
            return json;
        }else{
            return str;
        }
    },
    /**
     * @description 将JSON对象转化为二维数组
     * @param json json对象
     * @return 二维数组
     * @author yuxuemei
     * @date 2016-03-04
     */
    jsonTo2DArray: function(json){
        //将第一级转化为数组
        var arrayData = _.values(json);
        var newArray=[];
        ////console.log(typeof arrayData[0]);
        //子节点判断：非数组并且是对象
        if(!Array.isArray(arrayData[0]) && typeof arrayData[0] == "object"){
            for (var i = 0; i < arrayData.length; i++) {
                newArray.push(_.values(arrayData[i]));
            }
            //数组
        }else if(Array.isArray(arrayData[0])){
            newArray = txt.data;
            //字符串
        }else if(!Array.isArray(arrayData[0]) && typeof arrayData[0] != "object"){
            newArray.push(arrayData);
        }
        return newArray;
    },
    /**
     * @description 将日期转化为时间戳
     * @param time 时间 如2015-12-20
     * @return 时间戳
     * @author yuxuemei
     * @date 2016-03-14
     */
    toTimeStamp: function(time){
        if(time!=undefined){
            var newTime;
            time = time.replace(/\-/g, "/");

            //var time = Date.parse(new Date(time));
            //毫秒数
            newTime= Math.round(new Date(time).getTime());
            return newTime;
        }
    },
    /**
     * @description 获取URL的app名称
     * @param time 时间 如2015-12-20
     * @return 时间戳
     * @author yuxuemei
     * @date 2016-03-14
     */
    getApp: function(url,index){
        var urlArray = url.split("/");
        ////console.log(urlArray)
        return urlArray[urlArray.length-2];
    },

    tableFirsrt:function(){
        var _tableHead = $("table.dataTable thead td");
        _tableHead.eq(0).css("border-right",0);
        _tableHead.eq(-1).css("border-right",0);
        if(_tableHead.eq(-1).text() == "操作"){
            _tableHead.eq(-1).width(150);
        }
    }
};
/**
 * @description 将时间戳转化为日期格式显示
 * @param format 需要显示的日期格式
 * @return 需要的日期格式
 * @author yuxuemei
 * @date 2016-03-07
 */
Date.prototype.format = function(format) {
    var date = {
        "Y+": this.getYear(),
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}


//日期获取
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
    var y = dd.getFullYear();
    var m = dd.getMonth()+1;//获取当前月份的日期 
    var d = dd.getDate();
    if(m<10){
        m="0"+m;
    }
    if(d<10){
        d="0"+d;
    }
    return y+""+m+""+d;
}

//重新查询用户并设置session
// function getUserSession(){
//     Data.getDataComb("get","/user/v1/user?m=q","",1,function(userData){
//         $.cookies.set('user',userData.data);
//     })
// }


function getErrorMess(code,error){
    //返回404切为权限过期时才返回登录页面
    if(code == 404){
        if(error == "Authentication expired" || error == "Organization is not exist"){
            ui.error(RELOGIN);
            setTimeout(function(){
                delSession();
            },2000)
        }else{
            ui.error(error);
        }
    }else if(code == 1130){
        ui.error(RELOGIN);
        setTimeout(function(){
            delSession();
        },2000)
    }else{
        ui.error(error);
    }
}

function delSession(){
    $.cookies.del('t');
    $.cookies.del('user');
    location.href ="./login.html";

}

function caclDataW(){
    var newMar;
    //单个数据框的默认宽度
    var _pNormalW=240;
    //单个数据框的默认margin值
    var _pNormalMar=10;
    //获取数据区域的width();
    var contentWidth=$("#childPage").width();
    //每个数据框的margin和border值总和，使用默认值计算;
    var mar=_pNormalMar+parseInt(1);
    //每一个数据框的宽度
    var pWidth=mar*2+_pNormalW;
    //计算剩余宽度 
    var remainder=contentWidth%pWidth;
    //计算个数 
    var count=parseInt(contentWidth/pWidth);

    //剩余宽度不够放一个时增加每个数据框之间的间距
    if(remainder!=0){
        //计算新增加的margin值
        var m=remainder/count/2;
        //获取新的margin值并赋值
        var newMar=m+_pNormalMar;
        $(".data").css({"margin-left":newMar,"margin-right":newMar});
    }
}

function isEmptyObject(e) {
    var t;
    for (t in e)
        return !1;
    return !0
}


