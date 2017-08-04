/**
 * Created by admin on 2017/8/3.
 */
var scripts = [null,
    "../resource/js/jquery.dataTables.js",
    //弹出框
    "../../components/bootbox.js/bootbox.js",
    null];
$('.page-content-area').ace_ajax('loadScripts', scripts, function () {


    $(function () {
        getData("");
    });
    function getData(requestParams) {
        var reguestUrl = "test.json";
        if (!requestParams) {
            requestParams = "";
        }
        var columns = [
            {
                "data": "id",
                render: function (data, type, full, meta) {
                    return '<label ><input type="checkbox" class="ace"> <span class="lbl"></span> </label>'

                }
            },
            {
                "data": "username",
                render: function (data, type, full, meta) {
                    return "<span onclick='editUserInfo(" + full.id + ")'>" + data + "</span>"
                }
            },
            {
                "data": "email"
            },
            {
                "data": "phone"
            },
            {
                "data": "null",
                "render": function (data, type, full, meta) {
                    return ' <span class="blue js-edit" flag="'+full.id+'"  href="#"> <i class="ace-icon fa fa-search-plus bigger-150"></i> </span> ' +
                        '<span class="green" href="#"> <i class="ace-icon fa fa-pencil bigger-150"></i> </span> ' +
                        '<span class="red js-delete" href="#"> <i class="ace-icon fa fa-trash-o bigger-150"></i> </span>'

                        ;
                }
            }


            ];
        Data.getDataTable("get", reguestUrl, requestParams, 1, "advertList", columns, "data", 2, 10, function () {

        });

    }
    $("#advertList").on("click",".js-edit",function () {
        Data.open({
            url:"./admin/menu3.html",
            title:"hello",
            size: 'large',
            buttons: {
                "success": {
                    "label": "<i class='ace-icon fa fa-check'></i> Success!",
                    "className": "btn-sm btn-success",
                    "callback": function () {
                        Data.open({
                            url: "./admin/menu3.html",
                            title: "hello",
                            size: 'large',
                            buttons: {

                            }
                        })



                    }
                },
                "danger": {
                    "label": "Danger!",
                    "className": "btn-sm btn-danger",
                    "callback": function () {
                        console.log("uh oh, look out!");
                    }
                },
                "click": {
                    "label": "Click ME!",
                    "className": "btn-sm btn-primary",
                    "callback": function () {
                        console.log("Primary button");
                    }
                },
                "button": {
                    "label": "Just a button...",
                    "className": "btn-sm",
                    "callback":function () {
                        console.log($("#name").val())
                    }
                }
            }
        });


    })
    $("#advertList").on("click",".js-delete",function () {
        console.log($(this).attr("flag"))
        bootbox.dialog(
            {
                message:"hello",
                closeButton:false,
                size:"small"
            }

        );
        setTimeout(function () {
            bootbox.hideAll()
        },1000)



    })

});