# Liar's Dice (Dado Mentiroso)

Jogo de Dado Mentiroso desenvolvido em React + TypeScript, seguindo o Roadmap C (Abordagem Híbrida).

## 🚀 Como Começar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

3. **Abra o navegador:**
   - O jogo estará disponível em `http://localhost:5173` (ou a porta que o Vite indicar)

## 📁 Estrutura do Projeto

```
src/
├── game/
│   ├── gameLogic.ts          # Regras puras do jogo
│   └── ai/
│       └── aiStrategies.ts   # Lógica de IA
├── state/
│   └── useLocalGame.ts       # Hook para gerenciar jogo local
├── components/
│   ├── GameBoard.tsx         # Componente principal
│   ├── PlayerArea.tsx        # Área de um jogador
│   ├── Controls.tsx          # Controles de aposta
│   ├── DiceDisplay.tsx       # Exibição dos dados
│   └── MessageDisplay.tsx    # Mensagens do jogo
├── services/
│   └── firebase.ts           # Configuração Firebase (preparado para Fase 2)
└── types/
    └── index.ts              # Tipos TypeScript
```

## 🎮 Como Jogar

1. Clique em "Iniciar Jogo"
2. Você verá seus dados (5 dados)
3. Faça uma aposta:
   - Escolha a quantidade de dados
   - Escolha o valor do dado (1-6)
   - Clique em "Apostar"
4. A IA fará sua jogada
5. Continue alternando apostas ou duvide quando achar que a aposta é um blefe
6. O jogador que perder um desafio perde um dado
7. O último jogador com dados vence!

### Regras Importantes

- **Coringa (Ás)**: Dados de valor 1 sempre contam como o valor da aposta atual
- **Aumentar Aposta**: Deve aumentar a quantidade OU manter a quantidade mas aumentar o valor
- **Duvidar**: Se a aposta for válida, quem duvidou perde um dado. Se for blefe, quem apostou perde

## 🛠️ Comandos Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Verifica erros de linting
- `npm run test` - Executa a suíte de testes com Vitest
- `npm run test:watch` - Executa testes em modo watch (Vitest)

## 📋 Status do Projeto

### ✅ Fase 1: Fundação React + Arquitetura Preparada (COMPLETA)
- [x] Estrutura do projeto React com TypeScript
- [x] Interfaces e tipos do GameState
- [x] Lógica de jogo em funções puras
- [x] Componentes React
- [x] Hook useLocalGame para modo local
- [x] Jogo 1v1 local vs IA funcional

### 🔄 Próximas Fases
- **Fase 2**: Multiplayer básico 1v1 online (Firebase)
- **Fase 3**: Polimento e expansão (1 vs 3 IAs, melhorias de IA)
- **Fase 4**: Funcionalidades avançadas (ranking, amigos, etc.)
- **Fase 5**: Otimização e lançamento

## 🔥 Firebase (Fase 2)

O arquivo `src/services/firebase.ts` está preparado para quando você configurar o Firebase. Você precisará:

1. Criar um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ativar Authentication e Firestore
3. Adicionar suas credenciais no arquivo `firebase.ts`

## 📝 Notas

- O jogo está totalmente funcional no modo local (1 vs 1 IA)
- A arquitetura está preparada para adicionar multiplayer facilmente
- A IA usa uma estratégia baseada em probabilidade

## 🎯 Próximos Passos

1. Teste o jogo localmente
2. Verifique se tudo está funcionando
3. Quando estiver pronto, podemos começar a Fase 2 (Firebase)

---

Desenvolvido seguindo o Roadmap C (Abordagem Híbrida) do projeto Liar's Dice.

