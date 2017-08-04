/**
 * Created by admin on 2017/8/4.
 */
$(function () {
    //读取cookie
    var userObj = Data.getUser();
    $("#welcome-info small").html(userObj.name);
    if(userObj.avatars)
    $("#welcome-info .nav-user-photo").attr("src",IMGURL+userObj.avatars);

    //注销登录
    $("#loginout").on("click",function () {
        delSession();
        e.preventDefault();
    })
})