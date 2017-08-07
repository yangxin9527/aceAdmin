/**
 * Created by admin on 2017/8/7.
 */
var scripts = [null,

    //提醒插件
    "../../components/jquery.gritter/js/jquery.gritter.js",

    //日期选择
    "../../components/bootstrap-datepicker/dist/js/bootstrap-datepicker.js",
    "../../components/bootstrap-datepicker/dist/locales/bootstrap-datepicker.zh-CN.min.js",

    //快捷键绑定  和 bootstrap-wysiwyg.js同时使用，编辑文本框
    "../../components/jquery.hotkeys/index.js",
    "../../components/_mod/bootstrap-wysiwyg/bootstrap-wysiwyg.js",

    //选择城市
    "../../components/select2/dist/js/select2.js",
    //+-数字框
    "../../components/fuelux/js/spinbox.js",
    //点击编辑
    "../../components/_mod/x-editable/bootstrap-editable.js",
    //ace增加了时间选择
    "../../components/_mod/x-editable/ace-editable.js",

    null];

$('.page-content-area').ace_ajax('loadScripts', scripts, function() {

    //inline scripts related to this page
    jQuery(function($) {
        getProfile();
        //普通ajax请求
        // function getProfile() {
        //     Data.getDataComb ("post","profile.json","",0,function () {
        //
        //     })
        // }
        //使用模板加载数据ajax请求
        function getProfile() {
            Data.getDataTemplate ("post","profile.json","",0,'temp_profileItem','profileItem',0,function (data) {




                //editables on first profile page
                $.fn.editable.defaults.mode = 'inline';
                $.fn.editableform.loading = "<div class='editableform-loading'><i class='ace-icon fa fa-spinner fa-spin fa-2x light-blue'></i></div>";
                $.fn.editableform.buttons = '<button type="submit" class="btn btn-info editable-submit"><i class="ace-icon fa fa-check"></i></button>'+
                    '<button type="button" class="btn editable-cancel"><i class="ace-icon fa fa-times"></i></button>';

                //editables

                //text editable
                $('#username')
                    .editable({
                        type: 'text',
                        name: 'username',
                        success: function(response, newValue) {
                            console.log("newValue="+newValue)
                        }
                    });


                //select2 editable
                var countries = [];
                $.each({ "CA": "Canada", "IN": "India", "NL": "Netherlands", "TR": "Turkey", "US": "United States"}, function(k, v) {
                    countries.push({id: k, text: v});
                });

                var cities = [];
                cities["CA"] = [];
                $.each(["Toronto", "Ottawa", "Calgary", "Vancouver"] , function(k, v){
                    cities["CA"].push({id: v, text: v});
                });
                cities["IN"] = [];
                $.each(["Delhi", "Mumbai", "Bangalore"] , function(k, v){
                    cities["IN"].push({id: v, text: v});
                });
                cities["NL"] = [];
                $.each(["Amsterdam", "Rotterdam", "The Hague"] , function(k, v){
                    cities["NL"].push({id: v, text: v});
                });
                cities["TR"] = [];
                $.each(["Ankara", "Istanbul", "Izmir"] , function(k, v){
                    cities["TR"].push({id: v, text: v});
                });
                cities["US"] = [];
                $.each(["New York", "Miami", "Los Angeles", "Chicago", "Wysconsin"] , function(k, v){
                    cities["US"].push({id: v, text: v});
                });

                var currentValue = "NL";
                $('#country').editable({
                    type: 'select2',
                    value : 'NL',
                    //onblur:'ignore',
                    source: countries,
                    select2: {
                        'width': 140
                    },
                    success: function(response, newValue) {
                        if(currentValue == newValue) return;
                        currentValue = newValue;

                        var new_source = (!newValue || newValue == "") ? [] : cities[newValue];

                        //the destroy method is causing errors in x-editable v1.4.6+
                        //it worked fine in v1.4.5
//				$('#city').editable('destroy').editable({
//					type: 'select2',
//					source: new_source
//				}).editable('setValue', null);


                        //so we remove it altogether and create a new element
                        var city = $('#city').removeAttr('id').get(0);
                        $(city).clone().attr('id', 'city').text('Select City').editable({
                            type: 'select2',
                            value : null,
                            //onblur:'ignore',
                            source: new_source,
                            select2: {
                                'width': 140
                            }
                        }).insertAfter(city);//insert it after previous instance
                        $(city).remove();//remove previous instance

                    }
                });

                $('#city').editable({
                    type: 'select2',
                    value : 'Amsterdam',
                    //onblur:'ignore',
                    source: cities[currentValue],
                    select2: {
                        'width': 140
                    }
                });

                //custom date editable
                $('#signup').editable({
                    type: 'adate',
                    date: {
                        //datepicker plugin options
                        format: 'yyyy/mm/dd',
                        viewformat: 'yyyy/mm/dd',
                        weekStart: 1

                        //,nativeUI: true//if true and browser support input[type=date], native browser control will be used
                        //,format: 'yyyy-mm-dd',
                        //viewformat: 'yyyy-mm-dd'
                    }
                })

                $('#age').editable({
                    type: 'spinner',
                    name : 'age',
                    spinner : {
                        min : 16,
                        max : 99,
                        step: 1,
                        on_sides: true
                        //,nativeUI: true//if true and browser support input[type=number], native browser control will be used
                    }
                });
                //////////////////////////////
                $('#profile-feed-1').ace_scroll({
                    height: '250px',
                    mouseWheelLock: true,
                    alwaysVisible : true
                });

                $('#about').editable({
                    mode: 'inline',
                    type: 'wysiwyg',
                    name : 'about',
                    wysiwyg : {
                        //css : {'max-width':'300px'}
                    },
                    success: function(response, newValue) {
                        console.log(newValue)
                    }
                });



                // 修改头像
                try {//ie8 throws some harmless exceptions, so let's catch'em

                    //first let's add a fake appendChild method for Image element for browsers that have a problem with this
                    //because editable plugin calls appendChild, and it causes errors on IE at unpredicted points
                    try {
                        document.createElement('IMG').appendChild(document.createElement('B'));
                    } catch(e) {
                        Image.prototype.appendChild = function(el){}
                    }

                    var last_gritter;
                    $('#avatar').editable({
                        type: 'image',
                        name: 'avatar',
                        value: null,
                        //onblur: 'ignore',  //don't reset or hide editable onblur?!
                        image: {
                            //specify ace file input plugin's options here
                            btn_choose: 'Change Avatar',
                            droppable: true,
                            maxSize: 1024*1024,//~1M

                            //and a few extra ones here
                            name: 'avatar',//put the field name here as well, will be used inside the custom plugin
                            on_error : function(error_type) {//on_error function will be called when the selected file has a problem
                                if(last_gritter) $.gritter.remove(last_gritter);
                                if(error_type == 1) {//file format error
                                    last_gritter = $.gritter.add({
                                        title: '这不是一个图片文件!',
                                        text: '请选择一个jpg|gif|png文件!',
                                        class_name: 'gritter-error gritter-center',
                                        time:"2000"
                                    });
                                } else if(error_type == 2) {//file size rror
                                    last_gritter = $.gritter.add({
                                        title: '文件太大了!',
                                        text: '不得超过1M',
                                        class_name: 'gritter-error gritter-center',
                                        time:"2000"
                                    });
                                }
                                else {//other error
                                }
                            },
                            on_success : function() {
                                $.gritter.removeAll();
                            }
                        },
                        url: function(params) {
                            // ***UPDATE AVATAR HERE*** //
                            var submit_url = BASEURL+'file-upload.php';//please modify submit_url accordingly
                            var deferred = null;
                            var avatar = '#avatar';

                            //if value is empty (""), it means no valid files were selected
                            //but it may still be submitted by x-editable plugin
                            //because "" (empty string) is different from previous non-empty value whatever it was
                            //so we return just here to prevent problems
                            var value = $(avatar).next().find('input[type=hidden]:eq(0)').val();
                            if(!value || value.length == 0) {
                                deferred = new $.Deferred
                                deferred.resolve();
                                return deferred.promise();
                            }

                            var $form = $(avatar).next().find('.editableform:eq(0)')
                            var file_input = $form.find('input[type=file]:eq(0)');
                            var pk = $(avatar).attr('data-pk');//primary key to be sent to server

                            var ie_timeout = null


                            if( "FormData" in window ) {
                                var formData_object = new FormData();//create empty FormData object

                                //serialize our form (which excludes file inputs)
                                $.each($form.serializeArray(), function(i, item) {
                                    //add them one by one to our FormData
                                    formData_object.append(item.name, item.value);
                                });
                                //and then add files
                                $form.find('input[type=file]').each(function(){
                                    var field_name = $(this).attr('name');
                                    var files = $(this).data('ace_input_files');
                                    if(files && files.length > 0) {
                                        formData_object.append(field_name, files[0]);
                                    }
                                });

                                //append primary key to our formData
                                formData_object.append('pk', pk);

                                deferred = $.ajax({
                                    url: submit_url,
                                    type: 'POST',
                                    processData: false,//important
                                    contentType: false,//important
                                    dataType: 'json',//server response type
                                    data: formData_object
                                })
                            }
                            else {
                                deferred = new $.Deferred

                                var temporary_iframe_id = 'temporary-iframe-'+(new Date()).getTime()+'-'+(parseInt(Math.random()*1000));
                                var temp_iframe =
                                    $('<iframe id="'+temporary_iframe_id+'" name="'+temporary_iframe_id+'" \
									frameborder="0" width="0" height="0" src="about:blank"\
									style="position:absolute; z-index:-1; visibility: hidden;"></iframe>')
                                        .insertAfter($form);

                                $form.append('<input type="hidden" name="temporary-iframe-id" value="'+temporary_iframe_id+'" />');

                                //append primary key (pk) to our form
                                $('<input type="hidden" name="pk" />').val(pk).appendTo($form);

                                temp_iframe.data('deferrer' , deferred);
                                //we save the deferred object to the iframe and in our server side response
                                //we use "temporary-iframe-id" to access iframe and its deferred object

                                $form.attr({
                                    action: submit_url,
                                    method: 'POST',
                                    enctype: 'multipart/form-data',
                                    target: temporary_iframe_id //important
                                });

                                $form.get(0).submit();

                                //if we don't receive any response after 30 seconds, declare it as failed!
                                ie_timeout = setTimeout(function(){
                                    ie_timeout = null;
                                    temp_iframe.attr('src', 'about:blank').remove();
                                    deferred.reject({'status':'fail', 'message':'Timeout!'});
                                } , 30000);
                            }


                            //deferred callbacks, triggered by both ajax and iframe solution
                            deferred
                                .done(function(result) {//success
                                    var res = result[0];//the `result` is formatted by your server side response and is arbitrary
                                    if(res.status == 'OK') $(avatar).get(0).src = res.url;
                                    else alert(res.message);
                                })
                                .fail(function(result) {//failure
                                    alert("There was an error");
                                })
                                .always(function() {//called on both success and failure
                                    if(ie_timeout) clearTimeout(ie_timeout)
                                    ie_timeout = null;
                                });

                            return deferred.promise();
                            // ***END OF UPDATE AVATAR HERE*** //
                        },
                        success: function(response, newValue) {
                        }
                    })
                }catch(e) {}

            })
        }










        $(document).one('ajaxloadstart.page', function(e) {
            // 跳到其他页面，执行一次
            //in ajax mode, remove remaining elements before leaving page
            try {
                $('.editable').editable('destroy');
            } catch(e) {}
            $('[class*=select2]').remove();
        });
    });


});