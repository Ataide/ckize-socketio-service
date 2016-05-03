var server = require('http').createServer(),
    io     = require('socket.io')(server),
    logger = require('winston'),
    port   = 3000;


// Logger config - Ataide Bastos
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true, timestamp: true });
logger.info('SocketIO > listening on port ' + port);

var clients = {};

io.on('connection', function (socket){

    //Regiter a client socket based on userId
    socket.on('register', function(data)
    {
        clients[data.userId] = { sockets: []};
        clients[data.userId].sockets.push(socket.id);
        logger.info('SocketIO > New connection -> userId = ' + data.userId +' socketId = ' + socket.id);

    });


    socket.on('dispara', function(data){
      logger.info('New data was sent = ' + data);
    });

    socket.on('broadcast', function (data) {
        if(clients[data.userId])
        {
            for(var soct in clients[data.userId].sockets){

                //proxy event to all connected sockets
                io.sockets.connected[clients[data.userId].sockets[soct]].emit(data.receiverId, data);

                logger.info('New data was sent = ' + JSON.stringify(data));
            }
        }
        else
        {
          logger.info('UserId is not open for comunication: ' + data.userId);
        }

    });

    socket.on('disconnect', function () {


        for(var name in clients){
            for (var soct in clients[name].sockets){
                if(clients[name].sockets[soct] === socket.id)
                {
                    //remove socket from array of sockets
                    clients[name].sockets.splice(soct, 1);
                    logger.info('socket removed');

                    //if no more sockets are connected
                    //remove user from list of clients
                    if (clients[name].sockets.length === 0)
                    {
                        delete clients[name];

                        logger.info('userId completely removed');
                    }
                    break;
                }
            }
        }
    });

});



server.listen(port);
