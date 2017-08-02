require.config({
	baseUrl: '.',
	
	waitSeconds: 600,
    paths: {
        "jquery": "../../components/jquery/dist/jquery",
        "bootstrap": "../../components/bootstrap/dist/js/bootstrap",
        "ace": "../../assets/js/ace",
        "ace-elements": "../../assets/js/ace-elements",
        "extra":'../../assets/js/ace-extra',
        // //canvas画图
        // "easypiechart":"../../components/_mod/easypiechart/jquery.easypiechart",
        // //通知栏
        // "gritter":"../../components/jquery.gritter/js/jquery.gritter",
        // //弹出框
        // "bootbox":"../../components/bootbox.js/bootbox",
        'jquery-dataTables':"../../components/datatables/media/js/jquery.dataTables",
		'dataTables-bootstrap':"../../components/_mod/datatables/jquery.dataTables.bootstrap"

    },
	shim: {

        'bootstrap': {
            deps: ['jquery']
        },
		'ace': {
			deps: ['jquery', 'bootstrap']
		},
		'ace-elements': {
			deps: ['ace']
		},
        // 'easypiechart': {
        //     deps: ['jquery']
        // },
        // 'gritter': {
        //     deps: ['jquery']
        // },
        // 'bootbox': {
        //     deps: ['jquery']
        // }

        'jquery-dataTables': {
            deps: ['jquery']
        },
        'dataTables-bootstrap': {
            deps: ['jquery', 'bootstrap']
        }

	}
});
require(['jquery', 'bootstrap', 'ace', 'extra', 'ace-elements','jquery-dataTables', 'dataTables-bootstrap'], function() {

	//try, to hide possible errors in case ace.demo is not available
	try {
		ace.demo.init(true);//true means the call is not from inside a jQuery document ready event
	} catch(e) {}
	
    //
	// //you can restore state of elements now (ace-extra.js is loaded)
	// $('.ace-save-state').each(function() {
	// 	ace.settings.loadState(this);
	// });
    //
	// //or as soon as you render an element such as sidebar, etc ...
	//   ace.settings.loadState('sidebar');

});