#!/usr/bin/node

// Carrega módulo Net
const net = require('net');

// Carrega módulo readline
// const readline = require('readline');

// Constante que define a porta padrão do servidor
const port = 9000;

const server = net.createServer();

// Evento nova conexão TCP
server.on('connection', (socket) => {

  // Exibição das informações sobre o cliente
  const addr = socket.address();
  consoleSocketCliente(socket, `+ nova conexão`);

  // Configura timeout do socket
  socket.setTimeout(5000);

  // Adiciona propriedade usuário ao objeto socket
  socket['usuario'] = null;

  // Adiciona propriedade uuid ao objeto socket
  socket['uuid'] = null;

  // Configurações do no novo socket criado

  // Configura a codificação de caracteres padrão para o socket
  socket.setEncoding('utf-8');

  // Evento dados recebidos no socket
  socket.on('data', (data) => {
    consoleSocketCliente(socket, `> ${data.length} Bytes`)
    interpretaMensagem(socket, data);
  });

  // Evento encerramento da conexão do socket
  socket.on('close', () => {
    consoleSocketCliente(socket, '- conexão encerrada');
  });

  socket.on('timeout', () => {
    if (! socket.usuario) {
      consoleSocketCliente(socket, '! timeout do cliente');

      // Cria resposta para o cliente informando que ocorreu um erro
      var resposta = novaMensagem(100);
      resposta['conteudo'] = {
            resultado: 1,
            mensagem: "Desconectado por timeout!"
          };

      // Envia resposta e desconecta o cliente
      socket.write(JSON.stringify(resposta));
      socket.destroy();
    }
  });
});

// Coloca o socket do servidor em escuta
server.listen(port, () => {
  const addr = server.address();
  console.log(`! aguardando mensagens em ${addr.address}:${addr.port}`);
});


// Função para interpretar uma mensagem recebida de um socket
function interpretaMensagem(socket, data) {

  mensagem = null;

  // Tenta interpretar os dados recebidos como um JSON
  try {
    mensagem = JSON.parse(data.toString());

  } catch (e) {
    // Se deu erro...

    consoleSocketCliente(socket,'! JSON invalido recebido');

    // Cria resposta para o cliente informando que ocorreu um erro
    var resposta = novaMensagem(100);
    resposta['conteudo'] = {
          resultado: 1,
          mensagem: "JSON incompleto ou corrompido!"
        };

    // Envia resposta e desconecta o cliente
    socket.write(JSON.stringify(resposta));
    socket.destroy();

    return;
  }

  // Se a versão do protocolo não for reconhecida, envia mensagem de erro e desconecta
  if (mensagem['versao'] != 1) {

    consoleSocketCliente(socket,'! Protocolo não suportado');

    var resposta = novaMensagem(100);
    resposta['conteudo'] = {
          resultado: 1,
          mensagem: "Versão do protocolo não é suportada!"
        };

    socket.write(JSON.stringify(resposta));
    socket.destroy();
  };

  // Se não há usuário logado e a mensagem não for tipo 200
  if (!socket.usuario && mensagem['tipo'] != 200) {

    consoleSocketCliente(socket,'! Recebimento de mensagem em conexão não logada');

    // Cria resposta para o cliente informando que ocorreu um erro
    var resposta = novaMensagem(100);
    resposta['conteudo'] = {
          resultado: 1,
          mensagem: "Faça login primeiro!"
        };

    // Envia resposta e desconecta o cliente
    socket.write(JSON.stringify(resposta));
    socket.destroy();
  }

  switch (mensagem['tipo']) {
    case 200: // login

      break;

    case 201: // envio de mensagem

      break;

    default: // tipo de mensagem não reconhecido

      consoleSocketCliente(socket,'! Tipo de mensagem não reconhecido');

      // Cria resposta para o cliente informando que ocorreu um erro
      var resposta = novaMensagem(100);
      resposta['conteudo'] = {
            resultado: 1,
            mensagem: "Tipo de mensagem não reconhecido!"
          };

      // Envia resposta e desconecta o cliente
      socket.write(JSON.stringify(resposta));
      socket.destroy();
  }
};

// Função para criar a estrutura básica de uma nova mensagem
function novaMensagem(tipo) {
  return {
    versao: 1,
    hora: (new Date).getTime(),
    tipo: tipo,
    origem: "0",
    conteudo: null
    };
}

function consoleSocketCliente(socket, mensagem) {
  console.log(`${mensagem} (${socket.remoteAddress}:${socket.remotePort})`)
}
