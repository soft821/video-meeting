/********************************************************
*
*
*
********************************************************/

// ====================================================== //
$(function(){
	$('#joined-video-container').owlCarousel({
        items: 5,
        // loop: true,
        // autoplayHoverPause: true,
        // autoplay: true,
        responsive: {
            0: {
                items: 1
            },
            455: {
                items: 2
            },            
            768: {
                items: 3,
            },
            991: {
                items: 4,
            },
            1024: {
                items: 5,
            }
        }
    });
    $('#joined-video-container').on('mousewheel', '.owl-stage', function (e) {
	    if (e.deltaY>0) {
	        $('#joined-video-container').trigger('next.owl');
	    } else {
	        $('#joined-video-container').trigger('prev.owl');
	    }
	    e.preventDefault();
	});
	hideVideoControls();
});

function hideVideoControls(){
	var vids = $("video"); 
	$.each(vids, function(){
	       this.controls = false; 
	})
}

// Toggle Chat Area
$(document).on('click', '#btn-chat', function(){
	if ($('body').hasClass('open-chat')) {
		$('body').removeClass('open-chat');
	} else {
		$('body').addClass('open-chat');
	}
});

// End Video Conference
$(document).on('click', '#btn-end-meeting', function(){
	location.href = '/host';
});

var connection = new RTCMultiConnection();

$(document).on('click', '#btn-mute', function(){
	if($(this).hasClass('on')) {
		$(this).removeClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/mic-off.png');
		$(this).find('.ctrl-title').text('Start Audio');
		var localStream = connection.attachStreams[0];
    	localStream.mute('audio');
	} else {
		$(this).addClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/mic-on.png');
		$(this).find('.ctrl-title').text('Stop Audio');
		var localStream = connection.attachStreams[0];
    	localStream.unmute('audio');
	}
});

$(document).on('click', '#btn-vstop', function(){
	if($(this).hasClass('on')) {
		$(this).removeClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/camera-off.png');
		$(this).find('.ctrl-title').text('Start Video');
		var localStream = connection.attachStreams[0];
    	localStream.mute('video');
	} else {
		$(this).addClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/camera-on.png');
		$(this).find('.ctrl-title').text('Stop Video');
		var localStream = connection.attachStreams[0];
    	localStream.unmute('video');
	}
});



















// ======================================================= //
// ======================================================= //
// ======================================================= //

  // ......................................................
// .......................UI Code........................
// ......................................................
$(document).on('click','#open-room',function(){
	$('#cover-img').addClass('hidden');
	$('#loading').removeClass('hidden');
	this.disabled = true;
    console.log('room-id',document.getElementById('room-id').value);
    connection.open(document.getElementById('room-id').value);
});
$(document).on('click','#join-room',function(){
	$('#loading').removeClass('hidden');
	this.disabled = true;
    connection.join(document.getElementById('room-id').value);
});
$(document).on('click','#open-or-join-room',function(){
	this.disabled = true;
    connection.openOrJoin(document.getElementById('room-id').value);
});
// ......................................................
// ................FileSharing/TextChat Code.............
// ......................................................
$(document).on('keyup', '#input-text-chat', function(e){
	if(e.keyCode != 13) return;
    sendMsg();
});
$(document).on('click', '#btn-send-chat', function(e){
	sendMsg();
});
function sendMsg(){
	var chat_input = $('#input-text-chat');
    // removing trailing/leading whitespace
    // chat_input.value = chat_input.value.replace(/^\s+|\s+$/g, '');
    if (!chat_input.val()) return;
	connection.send(chat_input.val());
    // appendDIV(chat_input.val());
    appendOutMsg(chat_input.val());
    chat_input.val('');
}
var chatContainer = document.querySelector('.chat-output');
function appendOutMsg(event) {
	var msg = event.data || event;
	var user_name = 'hobi';
	var OutMsg = '<div class="out-msg">'+
					'<div class="user-info">'+
						'<img src="images/icons/default-user.png" class="user-avatar" />'+
						'<span class="user-name">'+ user_name +'</span>'+
					'</div>'+
					'<div class="msg">'+
						msg +
					'</div>'+
				'</div>';
	var InMsg = '<div class="in-msg">'+
					'<div class="user-info">'+
						'<img src="images/icons/default-user.png" class="user-avatar" />'+
						'<span class="user-name">'+ user_name +'</span>'+
					'</div>'+
					'<div class="msg">'+
						msg +
					'</div>'+
				'</div>';
	if (event.data) {
		chatContainer.append($.parseHTML(InMsg)[0]);
	} else {
		chatContainer.append($.parseHTML(OutMsg)[0]);
	}
    
    document.getElementById('input-text-chat').focus();
}
// function appendDIV(event) {
//     var div = document.createElement('div');
//     div.innerHTML = event.data || event;
//     chatContainer.insertBefore(div, chatContainer.firstChild);
//     div.tabIndex = 0; div.focus();
    
//     document.getElementById('input-text-chat').focus();
// }

$(document).on('click','#share-file',function(){
	var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
    });
});


// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................
var connection = new RTCMultiConnection();
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.enableFileSharing = true; // by default, it is "false".
connection.session = {
    audio: true,
    video: true,
    data : true
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};
connection.onstream = function(event) {
	console.log('11', event);
	console.log('22', event.mediaElement);
    // document.body.appendChild(event.mediaElement);
	$('#loading').addClass('hidden');
	$('#cover-img').addClass('hidden');
    if ($('#video-me video').length == 0) {
    	$('#video-me').append(event.mediaElement);
    } else if ($('#video-focus video').length == 0) {
		$('#video-focus').append(event.mediaElement);
    } else {
    	$('#joined-video-container').trigger('add.owl.carousel', [event.mediaElement]).trigger('refresh.owl.carousel');
    }
    console.log('ok');
};
// connection.onmessage = appendDIV;
connection.onmessage = appendOutMsg;
connection.filesContainer = document.getElementById('file-container');
connection.onopen = function() {
    document.getElementById('share-file').disabled      = false;
    document.getElementById('input-text-chat').disabled = false;
};

$(document).on('click', '.owl-item', function(e){
	var focusObj = $('#video-focus video');
	var carousel = $('.owl-carousel').data('owl.carousel');
	var indexToRemove = $(this).index();
	console.log('indexToRemove',indexToRemove);
	$('#video-focus').html($('.owl-carousel video')[indexToRemove]);
	e.preventDefault();
	// carousel.to(carousel.relative($(this).index()));
	$(".owl-carousel").trigger('remove.owl.carousel', [indexToRemove]).trigger('refresh.owl.carousel');
	$('#joined-video-container').trigger('add.owl.carousel', [focusObj]).trigger('refresh.owl.carousel');
	console.log('change');
});