var socket = io();
$('#btnAdd').click(function () {
    socket.emit('grid', $('txtSymbol').val);
});

socket.on('grid', function (msg) {
    $('#messages').append($('<p>').text(msg));
});