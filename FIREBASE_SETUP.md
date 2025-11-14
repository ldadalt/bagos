# Guia de Configuração do Firebase

Este guia explica como configurar o Firebase para o modo multiplayer do jogo.

## Passo 1: Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "liars-dice")
4. Desative o Google Analytics (opcional, para simplificar)
5. Clique em "Criar projeto"

## Passo 2: Configurar Authentication

1. No menu lateral, vá em "Authentication"
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Habilite "Anônimo" (Anonymous)
5. Clique em "Salvar"

## Passo 3: Configurar Firestore

1. No menu lateral, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar em modo de teste" (para desenvolvimento)
4. Escolha a localização do servidor (ex: `southamerica-east1` para Brasil)
5. Clique em "Ativar"

### Regras de Segurança do Firestore

Vá em "Regras" e configure as seguintes regras (apenas para desenvolvimento):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura/escrita de jogos
    match /games/{gameId} {
      allow read, write: if request.auth != null;
      
      // Permite leitura/escrita de dados dos jogadores
      match /players/{playerId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

**⚠️ IMPORTANTE**: Essas regras são permissivas demais para produção. Ajuste-as antes de lançar!

## Passo 4: Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto"
2. Vá em "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique no ícone `</>` (Web)
5. Registre um app (ex: "liars-dice-web")
6. Copie as credenciais que aparecem

## Passo 5: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto (ao lado de `package.json`)
2. Adicione as credenciais:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui
VITE_FIREBASE_PROJECT_ID=seu_project_id_aqui
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
VITE_FIREBASE_APP_ID=seu_app_id_aqui
```

3. **NUNCA** commite o arquivo `.env` no Git (ele já está no .gitignore)

## Passo 6: Configurar Cloud Functions (Opcional - para resolução segura de desafios)

### 6.1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 6.2. Fazer Login

```bash
firebase login
```

### 6.3. Inicializar Functions

```bash
firebase init functions
```

Escolha:
- TypeScript: Sim
- ESLint: Sim (opcional)
- Instalar dependências: Sim

### 6.4. Criar Cloud Function

Crie o arquivo `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const resolveChallenge = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const { gameId } = data;
  if (!gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'gameId é obrigatório');
  }

  const db = admin.firestore();
  const gameRef = db.collection('games').doc(gameId);
  const gameDoc = await gameRef.get();

  if (!gameDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Jogo não encontrado');
  }

  const gameData = gameDoc.data();
  if (!gameData || !gameData.currentBid) {
    throw new functions.https.HttpsError('failed-precondition', 'Não há aposta para desafiar');
  }

  // Busca dados de todos os jogadores
  const allDice: number[][] = [];
  for (const playerId of gameData.players) {
    const playerRef = gameRef.collection('players').doc(playerId);
    const playerDoc = await playerRef.get();
    allDice.push(playerDoc.data()?.dice || []);
  }

  // Resolve o desafio (lógica do jogo)
  const bid = gameData.currentBid;
  const allDiceFlat = allDice.flat();
  let count = 0;
  for (const die of allDiceFlat) {
    if (die === bid.value || die === 1) {
      count++;
    }
  }

  const bidderWon = count >= bid.quantity;
  const challengerIndex = gameData.currentPlayerIndex;
  const bidderIndex = gameData.players.findIndex((id: string) => id === bid.playerId);
  const loserIndex = bidderWon ? challengerIndex : bidderIndex;
  const loserId = gameData.players[loserIndex];

  // Remove um dado do perdedor
  const loserRef = gameRef.collection('players').doc(loserId);
  const loserDoc = await loserRef.get();
  const loserDice = loserDoc.data()?.dice || [];
  const newDice = loserDice.slice(0, -1);

  await loserRef.update({ dice: newDice });

  // Verifica se o jogo terminou
  const winnerId = newDice.length === 0 ? 
    gameData.players.find((id: string) => id !== loserId) : null;

  // Atualiza estado do jogo
  const updates: any = {
    currentBid: null,
    lastRoundLoserIndex: loserIndex,
    currentPlayerIndex: loserIndex,
    roundNumber: (gameData.roundNumber || 1) + 1,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (winnerId) {
    updates.gameStatus = 'finished';
    updates.winnerId = winnerId;
  } else {
    // Rola novos dados para todos
    for (const playerId of gameData.players) {
      const playerRef = gameRef.collection('players').doc(playerId);
      const playerDoc = await playerRef.get();
      const currentDice = playerDoc.data()?.dice || [];
      await playerRef.update({ dice: rollDice(currentDice.length) });
    }
  }

  await gameRef.update(updates);

  return {
    bidderWon,
    actualCount: count,
    loserId,
  };
});

function rollDice(numDice: number): number[] {
  const dice: number[] = [];
  for (let i = 0; i < numDice; i++) {
    dice.push(Math.floor(Math.random() * 6) + 1);
  }
  return dice;
}
```

### 6.5. Deploy da Function

```bash
firebase deploy --only functions
```

## Passo 7: Testar

1. Execute `npm run dev`
2. O jogo deve detectar automaticamente se o Firebase está configurado
3. Teste criando uma sala e entrando com outro navegador/aba

## Troubleshooting

### Erro: "Firebase não configurado"
- Verifique se o arquivo `.env` existe e tem as variáveis corretas
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Verifique se a autenticação está habilitada

### Erro: "Cloud Function não encontrada"
- Verifique se a function foi deployada
- Verifique se o nome da function está correto (`resolveChallenge`)

## Próximos Passos

Após configurar, você pode:
- Testar partidas online
- Adicionar mais funcionalidades (ranking, amigos, etc.)
- Melhorar as regras de segurança do Firestore

