const net = require('net');
const readline = require('readline');
const id = new require('uuid/v1')();

let client = new net.Socket();

let contatos = []
let user
let contatosString = ''
let cont = 0

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



let questionamento = () => {
    rl.question('Opções disponíveis: \n(1) Atualizar contatos  \n(2) Enviar mensaagem \n', (acao) => {
        switch (acao) {
            case '1':
                console.log('Atualizando contatos...')
                break

            case '2':
                rl.question(`Informe o destintario \n Usuário disponíveis:\n${contatosString}`, (indice) => {
                    let contato = contatos[indice]
                    console.log(contato)
                    rl.question(`Mensagem:\n`, (texto) => {
                        let msg = mensagem(201, { remetente: user, destinatario: contato, texto: texto})
                        client.write(JSON.stringify(msg));
                    })



                })
                break;

        }

    });
}


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

        data.conteudo.registrados.forEach(x => {
            if (x != user) {
                contatos.push(x)
                contatosString += `(${cont++}) ${x} | `

            }
        })

        console.log(`Usuário disponíveis:\n${contatosString}`)
    },

    '102': (data) => {
        //Mensagem recebida
        console.log(`Nova mensagem de ${data.conteudo.remetente}`)
        console.log(`Mensagem: ${data.conteudo.texto}`)

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

    rl.question('', (a) => {
        questionamento()
    });

});

client.on('close', () => {
    console.log('Connection closed');
});