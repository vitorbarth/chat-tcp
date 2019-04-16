const net = require("net");
let sockets = [];
let connections = []

let server = net.createServer();


let tratamento = {

    '100': () => {
        return sockets
    },

    //login
    '200': (socket, data) => {
        socket.apelido = data.conteudo.remetente
        socket.uuid = data.origem
        sockets.push(socket)

        return [
            {
                socket: socket,
                mensagem: {
                    versao: 1,
                    hora: data.hora,
                    tipo: 100,
                    origem: data.origem,
                    conteudo: {
                        resultado: 0,
                        mensagem: "",
                    },
                }
            },
            {
                socket: socket,
                mensagem: {
                    versao: 1,
                    hora: data.hora,
                    tipo: 101,
                    origem: data.origem,
                    conteudo: {
                        registrados: sockets.map(x => { return x.apelido }),
                        entraram: [],
                        sairam: [],
                    },
                }
            }
        ]
    },


    //envio de mensagem
    '201': (socket, data) => {
        let msg = data.conteudo
        let dest = buscarDestinatario(msg.destinatario)

        return [
            {
                socket: socket,
                mensagem: {
                    versao: 1,
                    hora: data.hora,
                    tipo: 100,
                    origem: data.origem,
                    conteudo: {
                        resultado: 0,
                        mensagem: "",
                    },
                }
            },
            {
                socket: dest,
                mensagem: {
                    versao: 1,
                    hora: data.hora,
                    tipo: 102,
                    origem: data.origem,
                    conteudo: {
                        remetente: msg.remetente,
                        destinatario: dest.apelido,
                        texto: msg.texto,
                    },


                }
            }

        ]

    }
}

let buscarDestinatario = (apelido) => {
    let dest
    sockets.forEach(x => {
        if (x.apelido == apelido)
            dest = x
    })
    return dest
}

server.on('connection', (socket) => {
    console.log('connection established');
    socket.setEncoding('utf8');

    socket.on('data', (data) => {
        let mensagem = JSON.parse(data)

        console.log(JSON.stringify(mensagem, null, 4))

        let resposta = tratamento[mensagem.tipo](socket, mensagem)

        resposta.forEach(x => {
            x.socket.write(JSON.stringify(x.mensagem+'/n'))
        });


    });

    socket.on('close', () => {
        console.log('asdasdasdasdsa')
    });

    socket.on('end', () => {
        console.log('aaaaaaa')
    });

});

server.listen(9000);