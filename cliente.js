var net = require('net');

var client = new net.Socket();
client.connect(9000, '127.0.0.1', () => {
    console.log('Connected');

    let mensagem = {
        versao: 1,
        hora: 1553037555.49,
        tipo: 200,
        origem: "3d0ca315-aff9–4fc2-be61–3b76b9a2d798",
        conteudo: {
            remetente: "VITOR",
        }

    }

    client.write(JSON.stringify(mensagem));

    let mensagem2 = {
        versao: 1,
        hora: 1553037555.49,
        tipo: 201,
        origem: "3d0ca315-aff9–4fc2-be61–3b76b9a2d798",
        conteudo: {
            remetente: "VITOR",
            destinatario: "BARTH",
            texto: "primeira mensagem"
        }

    }

    client.write(JSON.stringify(mensagem2));
});

client.on('data', (data) => {
    data = JSON.parse(data)
    console.log('Received: ' + JSON.stringify(data, null, 4));
    // client.destroy(); // kill client after server's response
});

client.on('close', () => {
    console.log('Connection closed');
});