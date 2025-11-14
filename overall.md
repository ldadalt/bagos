Código e Regras do Jogo Liar's Dice (Dado Mentiroso)

Este arquivo contém toda a estrutura inicial para criar um jogo de Liar's Dice (Jogador vs. Máquina) usando apenas HTML, CSS e JavaScript, além das regras de negócio e planos para funcionalidades futuras.

2. Regras do Jogo (Liar's Dice)

Aqui estão as regras essenciais que a lógica do código implementa.

Objetivo: Ser o último jogador a ter pelo menos um dado na mesa.

Início: Cada jogador começa com um copo e 5 dados de seis faces. No início de cada rodada, todos os jogadores chacoalham seus dados e os viram na mesa, mantendo-os escondidos sob o copo.

Aposta (Lance):

Uma aposta é uma afirmação sobre a quantidade total de um certo valor de dado que existe na mesa, somando os dados de todos os jogadores.

Exemplo: "Aposto que há, no mínimo, 4 dados com o valor 5 na mesa".

O Coringa (Ás):

O dado de valor 1 é um coringa. Ele sempre conta como o valor da aposta atual.

Exemplo: Se a aposta é por dados de valor "5", todos os dados de valor "1" na mesa são contados como se fossem "5".

O Turno do Jogo:

O primeiro jogador faz uma aposta inicial baseada nos seus próprios dados e na probabilidade.

O jogador seguinte (em sentido horário) tem duas opções:

Aumentar a Aposta: Fazer uma aposta que seja maior que a anterior.

Duvidar: Desafiar a aposta do jogador anterior.

Como Aumentar uma Aposta: Uma nova aposta é considerada maior que a anterior se:

A quantidade de dados for maior (ex: "5 dados de valor 2" é maior que "4 dados de valor 6").

OU a quantidade for a mesma, mas o valor do dado for maior (ex: "4 dados de valor 6" é maior que "4 dados de valor 5").

Não é permitido diminuir o valor do dado se a quantidade for a mesma.

Resolvendo uma Dúvida:

Quando um jogador duvida, todos os jogadores revelam seus dados.

A contagem total do valor apostado é feita (lembrando de somar os coringas).

Se a contagem real for igual ou maior que a aposta: A aposta era válida. O jogador que duvidou perde um de seus dados.

Se a contagem real for menor que a aposta: A aposta era um blefe. O jogador que apostou perde um de seus dados.

Nova Rodada:

O jogador que perdeu um dado na rodada anterior começa a nova rodada.

Todos os jogadores pegam seus dados restantes, chacoalham e começam novamente.

Fim de Jogo:

Um jogador é eliminado quando perde seu último dado.

O último jogador com dados na mesa vence o jogo.

3. Funcionalidades Futuras (Roadmap)

Esta seção descreve os próximos passos planejados para transformar o jogo em uma experiência online completa.

Funcionalidades Essenciais (Online)

Modo Multiplayer Online

Capacidade: Suporte para partidas de 2 a 8 jogadores.

Lobby de Amigos: Implementação de um sistema de "salas" ou "lobbies" privados.

Matchmaking Público: Uma opção para jogadores entrarem em uma fila e serem automaticamente pareados com outros.

Opção de Partidas Ranqueadas

Sistema de Pontuação: Criação de um sistema de ranking (ELO ou PR).

Matchmaking por Habilidade: Parear jogadores com pontuação similar.

Temporadas e Recompensas: Dividir o modo ranqueado em "temporadas" com recompensas cosméticas.

Ranking Geral de Pontuação (Leaderboard)

Tabela de Classificação: Exibir os melhores jogadores (amigos, país, global).

Atualização em Tempo Real: Atualizar a tabela após cada partida.

Engajamento, Competição e Socialização

Sistemas de Recompensa e Progresso

Missões Diárias e Semanais: Metas simples com recompensas.

Sistema de Conquistas (Achievements): Desafios de longo prazo.

Personalização e Cosméticos

Itens Visuais: Personalização de dados, copos, avatares, etc.

Eventos e Modos de Jogo Alternativos

Eventos de Fim de Semana: Variações das regras para manter o jogo dinâmico.

Torneios Programados: Eventos com hora marcada e prêmios exclusivos.

Funcionalidades Sociais

Lista de Amigos e Desafios Diretos: Adicionar e convidar amigos.

Reações e Emotes Rápidos: Comunicação rápida e segura durante as partidas.

Ferramentas de Análise

Estatísticas de Perfil: Perfil detalhado com % de vitórias, etc.

Histórico de Partidas: Rever partidas para analisar jogadas.

4. Arquitetura de Tecnologia Recomendada

Para transformar o protótipo em um jogo online robusto e escalável, a escolha da arquitetura é fundamental. A recomendação é a "Rota A", utilizando a plataforma Firebase do Google em conjunto com um framework frontend moderno como o React.

O Papel de Cada Tecnologia

Frontend (Interface do Usuário): React.js

O que é: Uma biblioteca JavaScript para construir interfaces de usuário.

Vantagem para o jogo: Permite criar uma interface dinâmica e organizada em componentes (Dados, Copos, Painel de Controle, Lobby). Isso facilita a manutenção e a adição de novas funcionalidades. Seria hospedado no Firebase Hosting.

Backend (Lógica do Servidor): Node.js e Cloud Functions

O que é: Node.js é o ambiente que permite executar JavaScript no servidor. As Cloud Functions do Firebase rodam código Node.js sem a necessidade de gerenciar um servidor (serverless).

Vantagem para o jogo: Lógicas críticas que garantem a justiça do jogo (como a resolução de uma dúvida, o cálculo de pontos de ranking ou a distribuição de recompensas) são executadas aqui. O framework Express.js pode ser usado dentro de uma Cloud Function para criar APIs mais complexas, como a que serve os dados para o Leaderboard.

Comunicação em Tempo Real: Firestore (substituindo Socket.io)

O que é: Firestore é um banco de dados NoSQL do Firebase que sincroniza dados em tempo real.

Vantagem para o jogo: Em uma arquitetura tradicional, a comunicação instantânea entre jogadores seria feita com a biblioteca Socket.io em um servidor Node.js. A grande vantagem do Firestore é que ele substitui essa necessidade. Quando um jogador faz uma aposta e o dado é salvo no Firestore, o próprio banco de dados notifica todos os outros jogadores na partida. Isso simplifica drasticamente a complexidade do código multiplayer.

Autenticação de Usuários: Firebase Authentication

O que é: Um serviço completo de autenticação.

Vantagem para o jogo: Gerencia de forma segura o login dos jogadores, o que é essencial para salvar o progresso, ranking, lista de amigos e itens cosméticos de cada um.

Resumo da Arquitetura

Camada

Tecnologia Principal

Papel no Jogo

Frontend

React.js

Constrói a interface visual e interativa que o jogador usa.

Hospedagem

Firebase Hosting

Disponibiliza o jogo (construído com React) para o mundo.

Backend

Node.js (via Cloud Functions)

Executa a lógica segura do jogo (regras, pontuação).

Banco de Dados

Firebase Firestore

Armazena dados e gerencia a comunicação em tempo real.

Autenticação

Firebase Authentication

Gerencia contas e perfis de jogadores.

Esta arquitetura integrada é a escolha mais eficiente para construir e escalar o jogo, permitindo a implementação de todas as funcionalidades do roadmap de forma rápida e robusta.

5. Diagramas da Arquitetura

Para visualizar melhor como os componentes interagem, aqui estão as descrições de dois diagramas chave.

5.1. Diagrama de Componentes

Este diagrama mostra as principais peças da arquitetura e como elas se conectam.

Cliente (Navegador do Usuário):

É onde o jogo roda.

Ele baixa e executa a aplicação React.js.

Firebase Hosting:

Serve os arquivos da aplicação React.js para o navegador do cliente.

É o ponto de entrada do usuário no jogo.

Aplicação React.js (Frontend):

Gerencia toda a interface gráfica e a interação do usuário.

Comunica-se diretamente com:

Firebase Authentication: Para fazer login, registrar e gerenciar a sessão do usuário.

Firebase Firestore: Para ler e escrever dados do jogo em tempo real (como apostas, estado da partida, etc.).

Firebase Cloud Functions: Para solicitar a execução de lógicas seguras.

Firebase Backend Services:

Authentication: Valida as credenciais do usuário.

Firestore (Banco de Dados): Armazena todos os dados persistentes (perfis, partidas, rankings) e sincroniza o estado do jogo entre os jogadores.

Cloud Functions (Backend): Contém a lógica de negócio crítica escrita em Node.js. É acionada por eventos do Firestore ou chamadas do app React para garantir a integridade do jogo (ex: resolver uma dúvida, calcular pontos).

[Imagem de um diagrama mostrando o Navegador do Usuário se conectando ao Firebase Hosting. O Hosting serve a Aplicação React. O React se conecta a três serviços do Firebase: Authentication, Firestore e Cloud Functions.]

5.2. Diagrama de Fluxo (Rodada de Jogo Multiplayer)

Este diagrama descreve o passo a passo de uma jogada e como a informação flui entre os componentes.

Cenário: Jogador A faz uma aposta. Jogador B duvida.

Jogador A - Faz uma Aposta:

O Jogador A clica em "Apostar" na interface React.js.

A aplicação React valida a aposta localmente (é maior que a aposta anterior?).

A aplicação escreve a nova aposta no documento da partida no Firestore.

Sincronização em Tempo Real:

O Firestore detecta a alteração no documento da partida.

Automaticamente, ele envia a atualização para todos os outros clientes (Jogador B, Jogador C, etc.) que estão "escutando" as alterações nesse documento.

A aplicação React.js do Jogador B e C recebe a nova aposta e atualiza a interface para exibi-la. O turno passa para o Jogador B.

Jogador B - Duvida:

O Jogador B decide duvidar e clica no botão "Duvidar".

A aplicação React.js do Jogador B não resolve a dúvida diretamente. Em vez disso, ela chama uma Cloud Function chamada resolveChallenge, passando o ID da partida.

Resolução Segura no Backend:

A Cloud Function resolveChallenge (Node.js) é executada.

Ela lê todos os dados dos jogadores daquela partida diretamente do Firestore (garantindo que ninguém possa mentir sobre seus dados).

A função executa a regra de negócio: conta os dados, compara com a aposta e determina o perdedor.

A função atualiza o estado da partida no Firestore, removendo um dado do perdedor e definindo quem começa a próxima rodada.

Início da Nova Rodada:

O Firestore novamente detecta a alteração (um jogador perdeu um dado) e sincroniza essa informação com todos os jogadores.

A aplicação React.js de todos os jogadores atualiza a interface para refletir o resultado e iniciar a nova rodada.

[Imagem de um fluxograma mostrando o passo a passo: Jogador A -> React -> Firestore -> (sincroniza com) Jogador B. Depois, Jogador B -> React -> Cloud Function -> Firestore -> (sincroniza com) Todos os Jogadores.]

6. Estrutura da Página (HTML, CSS e JavaScript)

Este é o código completo e autocontido para a primeira versão do jogo (single-player vs. IA).

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liar's Dice</title>
    <!-- O CSS está incorporado no <style> -->
    <style>
        body {
            font-family: sans-serif;
            background-color: #3d8a3d;
            color: white;
            text-align: center;
            padding: 10px;
        }

        .game-area {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            margin-top: 20px;
            gap: 20px;
        }

        .player-area, .table-area {
            background-color: #2b612b;
            padding: 20px;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .dice-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 10px;
            min-height: 50px;
        }

        .die {
            width: 40px;
            height: 40px;
            background-color: white;
            color: black;
            border-radius: 5px;
            font-size: 24px;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 2px solid #333;
        }

        .controls {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }

        input[type="number"] {
            width: 50px;
            padding: 8px;
            text-align: center;
            border-radius: 5px;
            border: 1px solid #ccc;
        }

        button {
            padding: 10px 15px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            margin: 5px;
            background-color: #f0c14b;
            color: #111;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        
        button:hover:not(:disabled) {
            background-color: #e0b03a;
        }

        button:disabled {
            cursor: not-allowed;
            background-color: #cccccc;
            color: #666;
        }

        .message {
            font-size: 1.2em;
            font-weight: bold;
            margin: 15px;
            min-height: 25px;
            color: #ffdd77;
        }
    </style>
</head>
<body>
    <h1>Liar's Dice (Dado Mentiroso)</h1>

    <div id="game-message" class="message">Bem-vindo! Clique em "Iniciar Jogo".</div>

    <div class="game-area">
        <!-- Área do Oponente -->
        <div class="player-area" id="ai-area">
            <h2>Oponente (IA)</h2>
            <div id="ai-dice-count">Dados: 5</div>
        </div>

        <!-- Mesa Central -->
        <div class="table-area">
            <h2>Mesa</h2>
            <div id="current-bid">Nenhuma aposta feita.</div>
            <button id="start-button">Iniciar Jogo</button>
        </div>

        <!-- Área do Jogador -->
        <div class="player-area" id="player-area">
            <h2>Seus Dados</h2>
            <div id="player-dice" class="dice-container">
                <!-- Os dados aparecerão aqui -->
            </div>
            <div class="controls">
                <label for="quantity">Qtd:</label>
                <input type="number" id="quantity" min="1" value="1">
                <label for="value">Valor:</label>
                <input type="number" id="value" min="1" max="6" value="1">
                <button id="bid-button" disabled>Apostar</button>
                <button id="challenge-button" disabled>Duvidar</button>
            </div>
        </div>
    </div>

    <!-- O JavaScript está incorporado no <script> -->
    <script>
        // --- ELEMENTOS DO DOM ---
        const startButton = document.getElementById('start-button');
        const bidButton = document.getElementById('bid-button');
        const challengeButton = document.getElementById('challenge-button');
        const quantityInput = document.getElementById('quantity');
        const valueInput = document.getElementById('value');
        const playerDiceContainer = document.getElementById('player-dice');
        const aiDiceCount = document.getElementById('ai-dice-count');
        const currentBidDiv = document.getElementById('current-bid');
        const messageDiv = document.getElementById('game-message');

        // --- ESTADO DO JOGO ---
        let gameState = {
            playerDice: [],
            aiDice: [],
            currentPlayer: 'player',
            lastRoundLoser: 'player',
            currentBid: null, // Ex: { quantity: 2, value: 5, player: 'player' }
        };

        // --- EVENT LISTENERS ---
        startButton.addEventListener('click', startGame);
        bidButton.addEventListener('click', makePlayerBid);
        challengeButton.addEventListener('click', resolveChallengeFromPlayer);

        // --- LÓGICA DO JOGO ---

        function startGame() {
            gameState.playerDice = rollDice(5);
            gameState.aiDice = rollDice(5);
            gameState.currentBid = null;
            gameState.lastRoundLoser = 'player'; // O jogador sempre começa o jogo
            
            startNewRound();
            
            startButton.style.display = 'none';
        }

        function rollDice(numDice) {
            const dice = [];
            for (let i = 0; i < numDice; i++) {
                dice.push(Math.floor(Math.random() * 6) + 1);
            }
            return dice;
        }

        function updateDisplay() {
            playerDiceContainer.innerHTML = '';
            gameState.playerDice.forEach(dieValue => {
                const dieElement = document.createElement('div');
                dieElement.className = 'die';
                dieElement.textContent = dieValue;
                playerDiceContainer.appendChild(dieElement);
            });

            aiDiceCount.textContent = `Dados: ${gameState.aiDice.length}`;

            if (gameState.currentBid) {
                const player = gameState.currentBid.player === 'player' ? 'Você' : 'IA';
                currentBidDiv.textContent = `Aposta de ${player}: ${gameState.currentBid.quantity} dado(s) de valor ${gameState.currentBid.value}`;
            } else {
                currentBidDiv.textContent = "Nenhuma aposta feita.";
            }
        }

        function toggleControls(disabled) {
            bidButton.disabled = disabled;
            challengeButton.disabled = disabled;
            quantityInput.disabled = disabled;
            valueInput.disabled = disabled;
        }

        function makePlayerBid() {
            const quantity = parseInt(quantityInput.value);
            const value = parseInt(valueInput.value);

            if (isValidBid(quantity, value)) {
                gameState.currentBid = { quantity, value, player: 'player' };
                gameState.currentPlayer = 'ai';
                messageDiv.textContent = `Você apostou ${quantity} dado(s) de valor ${value}. Vez da IA.`;
                updateDisplay();
                toggleControls(true);
                
                setTimeout(aiTurn, 2000); // Dar um tempo para a IA "pensar"
            } else {
                messageDiv.textContent = "Aposta inválida! Aumente a quantidade ou o valor do dado.";
            }
        }
        
        function isValidBid(quantity, value) {
            if (!gameState.currentBid) {
                return true; // Primeira aposta é sempre válida
            }
            const currentQ = gameState.currentBid.quantity;
            const currentV = gameState.currentBid.value;
            
            if (quantity > currentQ) {
                return true;
            }
            if (quantity === currentQ && value > currentV) {
                return true;
            }
            return false;
        }

        function resolveChallenge(challenger) {
            toggleControls(true); // Desativa controles durante a resolução
            const bid = gameState.currentBid;
            if (!bid) return;

            const allDice = [...gameState.playerDice, ...gameState.aiDice];
            const bidder = bid.player;

            let count = 0;
            for (const die of allDice) {
                if (die === bid.value || die === 1) { // 1 é coringa
                    count++;
                }
            }
            
            let bidderWon = count >= bid.quantity;
            let loser;

            if (bidderWon) {
                loser = challenger;
                messageDiv.textContent = `A aposta era válida! Havia ${count} dados de valor ${bid.value}. ${challenger === 'player' ? 'Você' : 'A IA'} perde um dado.`;
            } else {
                loser = bidder;
                messageDiv.textContent = `A aposta era um blefe! Havia apenas ${count} dados. ${bidder === 'player' ? 'Você' : 'A IA'} perde um dado.`;
            }

            gameState.lastRoundLoser = loser;

            if (loser === 'player') {
                gameState.playerDice.pop();
            } else {
                gameState.aiDice.pop();
            }
            
            if (gameState.playerDice.length === 0) {
                endGame('A IA');
                return;
            }
            if (gameState.aiDice.length === 0) {
                endGame('Você');
                return;
            }

            // Inicia a próxima rodada
            setTimeout(startNewRound, 3000);
        }
        
        function resolveChallengeFromPlayer() {
            resolveChallenge('player');
        }

        function startNewRound() {
            gameState.playerDice = rollDice(gameState.playerDice.length);
            gameState.aiDice = rollDice(gameState.aiDice.length);
            gameState.currentBid = null;
            gameState.currentPlayer = gameState.lastRoundLoser;
            
            updateDisplay();
            
            if (gameState.currentPlayer === 'player') {
                messageDiv.textContent = "Nova rodada! Você começa. Faça sua aposta.";
                toggleControls(false);
                challengeButton.disabled = true;
            } else {
                messageDiv.textContent = "Nova rodada! A IA começa.";
                toggleControls(true);
                setTimeout(aiTurn, 2000);
            }
        }

        function endGame(winner) {
            messageDiv.textContent = `Fim de Jogo! ${winner} venceu!`;
            toggleControls(true);
            startButton.textContent = "Jogar Novamente";
            startButton.style.display = 'block';
            startButton.onclick = () => window.location.reload(); // Recarrega a página para reiniciar
        }

        // --- LÓGICA DA IA ---

        function aiTurn() {
            const bid = gameState.currentBid;
            
            // Se a IA começa a rodada, ela faz uma aposta inicial
            if (!bid) {
                // Aposta inicial simples: aposta em 2 dados do valor que ela mais tem
                const counts = [0,0,0,0,0,0,0];
                gameState.aiDice.forEach(d => counts[d]++);
                counts[1] = 0; // Não aposta em 1s inicialmente
                const bestValue = counts.indexOf(Math.max(...counts));
                const quantity = 2; // Chute seguro
                
                gameState.currentBid = { quantity, value: bestValue, player: 'ai' };
                gameState.currentPlayer = 'player';
                updateDisplay();
                messageDiv.textContent = `A IA apostou ${quantity} dado(s) de valor ${bestValue}. Sua vez.`;
                toggleControls(false);
                return;
            }

            // Lógica de decisão da IA (simplificada)
            const totalDice = gameState.playerDice.length + gameState.aiDice.length;
            const expectedCount = totalDice / 3;
            
            if (bid.quantity > expectedCount + 1 && bid.quantity > 3) {
                messageDiv.textContent = "A IA duvidou da sua aposta!";
                setTimeout(() => resolveChallenge('ai'), 1500);
            } else {
                let newQuantity = bid.quantity;
                let newValue = bid.value + 1;
                if (newValue > 6) {
                    newQuantity++;
                    newValue = 2;
                }
                
                gameState.currentBid = { quantity: newQuantity, value: newValue, player: 'ai' };
                gameState.currentPlayer = 'player';
                updateDisplay();
                messageDiv.textContent = `A IA apostou ${newQuantity} dado(s) de valor ${newValue}. Sua vez.`;
                toggleControls(false);
            }
        }
    </script>
</body>
</html>
