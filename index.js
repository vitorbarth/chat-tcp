const net = require("net");
let sockets = [];
let connections = []

let server = net.createServer();

let mensagem = (socket, data, tipo, conteudo) => {
    return {
        socket: socket,
        mensagem: {
            versao: 1,
            hora: data.hora,
            tipo: tipo,
            origem: data.origem,
            conteudo: conteudo
        }
    }
}

let tratamento = {

    '100': () => {
        return sockets
    },

    //login
    '200': (socket, data) => {
        try {
            socket.apelido = data.conteudo.remetente
            socket.uuid = data.origem
            sockets.push(socket)

            console.log(`Usuário "${socket.apelido}" logado com sucesso!`)

            //Retorno de sucesso do login
            let retornoLogin = {
                resultado: 0,
                mensagem: "",
            }

            //Lista de usuários cadastrados 
            let retornoUsuarios = {
                registrados: sockets.map(x => { return x.apelido }),
                entraram: [],
                sairam: [],
            }
            return [
                mensagem(socket, data, 100, retornoLogin),
                mensagem(socket, data, 101, retornoUsuarios)
            ]
        } catch (err) {

            //Retorno de falha do login
            let retornoLoginErr = {
                resultado: 1,
                mensagem: err,
            }
            return [
                mensagem(socket, data, 100, retornoLoginErr),
            ]
        }

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

// Função que prepara um objeto javascript para ser enviado
let content = (obj) => {
    return Buffer.from(JSON.stringify(obj) + '\n');
}

server.on('connection', (socket) => {
    socket.setEncoding('utf8');

    socket.on('data', (data) => {
        let mensagem = JSON.parse(data)

        // console.log(JSON.stringify(mensagem, null, 4))
        let resposta = tratamento[mensagem.tipo](socket, mensagem)

        resposta.forEach(x => {
            x.socket.write(content(x.mensagem))
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