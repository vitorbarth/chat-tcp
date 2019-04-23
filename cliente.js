const net = require('net');
const readline = require('readline');
const id = new require('uuid/v1')();

var client = new net.Socket();
let user

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lerResultado = (data) => {
    console.log('Received: ')
    console.log(JSON.stringify(data, null, 4));
}

let mensagem = (tipo, conteudo) => {
    return {
        versao: 1,
        hora: Math.floor(new Date().getTime()),
        tipo: tipo,
        origem: id,
        conteudo: conteudo
    }
}

client.connect(9000, '127.0.0.1', () => {
    console.log('Connected');

    // LOGIN
    rl.question('Informe seu usuario: ', (usuario) => {
        user = usuario
        let msg = mensagem(200, {remetente : user})
        client.write(JSON.stringify(msg));
    });

});

client.on('data', (data) => {
    data = JSON.parse(data)
    lerResultado(data)

});

client.on('close', () => {
    console.log('Connection closed');
});