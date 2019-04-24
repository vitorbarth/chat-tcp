const net = require('net');
const readline = require('readline');
const id = new require('uuid/v1')();

let client = new net.Socket();

let contatos = []
let user

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


let tratamento = {
    '100': (data) => {
        if (data.conteudo.resultado == 0) {
            console.log('Parabéns, você está liberado para utilizar o sistema')
        } else {
            console.log('Falha na autenticação')
            console.log(data.conteudo.mensagem)
        }
    },

    '101': (data) => {
        //atualiza a lista de contatos
        contatos = data.conteudo.registrados

        console.log('Usuário disponíveis: ')
        console.log(contatos.map(x => { if (x != user) return x }))

    }
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
        let msg = mensagem(200, { remetente: user })
        client.write(JSON.stringify(msg));
    });

});

client.on('data', (data) => {
    data = JSON.parse(data)
    tratamento[data.tipo](data)
});

client.on('close', () => {
    console.log('Connection closed');
});