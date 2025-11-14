Roadmaps Iniciais do Projeto Liar's Dice

Este documento apresenta dois caminhos de desenvolvimento iniciais (roadmaps) baseados no protótipo e nos objetivos definidos no arquivo liars_dice_initial_code.md. Cada roadmap prioriza um aspecto diferente do jogo: um foca em criar uma experiência single-player robusta primeiro, enquanto o outro foca em validar a funcionalidade online o mais rápido possível.

Roadmap A: Foco no Single-Player Avançado (1 vs. 3 IA)

Filosofia: "Construir uma experiência de jogo completa e divertida localmente, validando todas as regras e a inteligência artificial antes de adicionar a complexidade da rede."

Fase 1: Fundação em React e Lógica Multi-Oponente

Ação: Migrar o protótipo atual (HTML/JS puro) para React.js.

Objetivo: Criar uma base de código organizada e componentizada.

Tarefas:

Criar componentes: <Tabuleiro>, <JogadorUI>, <ControlesDeAposta>.

Refatorar o gameState para ser um array de jogadores (ex: players: [{id: 'humano', ...}, {id: 'ia1', ...}, ...]).

Implementar a lógica de turnos para 4 jogadores (índice do jogador atual).

Construir a interface que exibe o jogador humano na parte inferior e os 3 oponentes de IA (mostrando apenas a contagem de dados) ao redor da mesa.

Fase 2: IA Avançada e Personalidades

Ação: Desenvolver uma IA que seja um desafio real.

Objetivo: Fazer o modo single-player ter alto valor de replay.

Tarefas:

Substituir a lógica de IA "simplista" do protótipo por uma baseada em probabilidade (calcular a chance da aposta ser real com base nos próprios dados e no total de dados na mesa).

Criar "Personalidades" de IA:

IA Cautelosa: Só aumenta a aposta se tiver alta confiança. Duvida com mais frequência.

IA Agressiva (Blefadora): Aumenta a aposta mesmo com dados ruins para pressionar os outros.

IA Analítica: Tenta "ler" os padrões de aposta dos oponentes.

Fase 3: Polimento e Recompensas Locais

Ação: Implementar todas as regras e sistemas de engajamento que funcionam offline.

Objetivo: Lançar uma versão "completa" do jogo single-player.

Tarefas:

Adicionar regras especiais (ex: "Palafico", quando um jogador fica com 1 dado).

Implementar o sistema de Conquistas (Achievements) localmente.

Implementar o sistema de Personalização Cosmética (desbloqueio de dados/copos ao vencer IAs).

Fase 4: Transição para Multiplayer

Ação: Usar a base sólida do jogo para implementar as funcionalidades online.

Objetivo: Adicionar o modo multiplayer a um jogo já robusto.

Tarefas:

Integrar o Firebase (Authentication e Firestore).

Adaptar o gameState (que já suporta múltiplos jogadores) para ser sincronizado com o Firestore.

Implementar a lógica de lobby e matchmaking.

A IA desenvolvida pode ser usada como "bots" para preencher salas ou substituir jogadores que caíram.

Roadmap B: Foco no Multiplayer Direto (1 vs. 1 Online)

Filosofia: "Validar a arquitetura de rede e a interação social o mais rápido possível. O jogo é sobre jogar contra outras pessoas, então essa deve ser a prioridade."

Fase 1: Fundação em React e Configuração do Firebase

Ação: Iniciar o projeto diretamente com React e Firebase.

Objetivo: Construir o esqueleto da arquitetura online (descrita no liars_dice_initial_code.md).

Tarefas:

Estruturar o projeto React.js.

Configurar o projeto Firebase: Authentication (para login de usuário) e Firestore (banco de dados).

Definir a estrutura de dados (Schema) no Firestore:

users: (perfil, amigos, ranking)

games: (documento da partida com dados dos jogadores, aposta atual, turno)

Fase 2: Lógica de Jogo 1v1 Online (Núcleo da Sincronização)

Ação: Implementar o fluxo de jogo básico de 1 contra 1.

Objetivo: Ter uma partida online funcional de ponta a ponta.

Tarefas:

Adaptar a lógica do protótipo para ler e escrever o estado do jogo (gameState) no documento do Firestore, em vez de uma variável local.

Implementar o "listener" do Firestore no React para que a interface atualize em tempo real quando o oponente fizer uma jogada.

Implementar a lógica de "Duvidar" usando uma Cloud Function (resolveChallenge) para garantir que a resolução seja segura e não possa ser fraudada.

Fase 3: Lobby, Matchmaking e Sistema Social

Ação: Criar as telas que permitem aos jogadores se encontrarem.

Objetivo: Tornar o jogo social e acessível.

Tarefas:

Criar uma tela de "Lobby" que mostra o userId do jogador (para convidar amigos diretamente).

Implementar um botão "Partida Rápida" (matchmaking público simples) que procura por outro jogador em uma "fila" no Firestore.

Implementar a Lista de Amigos (base para o Lobby Privado).

Fase 4: Expansão e Funcionalidades Competitivas

Ação: Expandir a base online para suportar mais recursos.

Objetivo: Aumentar o engajamento e a competição.

Tarefas:

Refatorar a lógica de jogo de 1v1 para suportar de 2 a 8 jogadores (o Firestore já facilita isso).

Implementar o Ranking Geral (Leaderboard) lendo os dados da coleção users.

Implementar as Partidas Ranqueadas como um modo de jogo separado.

Adicionar a IA (simplificada) como um oponente para jogadores iniciantes ou para preencher salas.

Conclusão Comparativa

Fator

Roadmap A (Foco no Single-Player)

Roadmap B (Foco no Multiplayer)

Primeira Versão

Um jogo offline polido contra 3 IAs desafiadoras.

Um jogo online 1v1 simples, mas funcional.

Principal Risco

O jogo pode não ser "grudento" (viciante) sem interação social.

A complexidade técnica da rede pode atrasar o projeto.

Maior Vantagem

Lógica de jogo 100% testada e uma IA robusta.

Valida a principal proposta de valor (jogar com amigos) rapidamente.

Engajamento

Alto valor de replay (replay value).

Alto valor social e de competição.