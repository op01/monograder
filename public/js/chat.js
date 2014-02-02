$(function(){
    console.debug("chat load");
    var log = function (text) {
        $('#chat-output').html( $('#chat-output').html() + text + "<br>");
    };
    //log('<div class="alert alert-warning">Chat under construction</div>');
    //$('#chat-input').attr('disabled','disabled');
    //return;
    var ws = new WebSocket(chaturl);
    ws.onopen = function () {
        log('Connection opened');
    };

    ws.onmessage = function (msg) {
        console.debug('recv',msg);
        var res = JSON.parse(msg.data);
        log('[' + res.hms + '] ['+res.name+']' + res.text); 
    };
    
    ws.onclose =  function()
    {
        log('Connection closed');
    }

    $('#chat-input').keydown(function (e) {
        if (e.keyCode == 13 && $('#chat-input').val()) {
            ws.send($('#chat-input').val());
            $('#chat-input').val('');
        }
    });
});