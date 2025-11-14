# Checklist de Testes - Liar's Dice

Use este checklist para validar que o jogo está funcionando corretamente.

## ✅ Testes Básicos de Funcionalidade

### 1. Início do Jogo
- [ ] Botão "Iniciar Jogo" aparece na tela
- [ ] Ao clicar, o jogo inicia corretamente
- [ ] Você vê seus 5 dados (valores visíveis)
- [ ] Você vê que o oponente (IA) tem 5 dados (valores ocultos com "?")
- [ ] Mensagem indica que é sua vez

### 2. Apostas Válidas
- [ ] Você consegue fazer uma aposta inicial (ex: 2 dados de valor 5)
- [ ] A aposta aparece na mesa central
- [ ] A mensagem indica que é vez da IA
- [ ] A IA faz uma aposta automaticamente (após ~1.5 segundos)
- [ ] Você consegue aumentar a aposta:
  - [ ] Aumentando a quantidade (ex: de 2 para 3 dados)
  - [ ] Mantendo a quantidade mas aumentando o valor (ex: 2 dados de 5 → 2 dados de 6)

### 3. Apostas Inválidas
- [ ] O jogo NÃO permite diminuir a quantidade
- [ ] O jogo NÃO permite diminuir o valor mantendo a quantidade
- [ ] Mensagem de erro aparece se tentar aposta inválida (ou simplesmente não aceita)

### 4. Dúvida/Desafio
- [ ] Botão "Duvidar" está desabilitado quando não há aposta
- [ ] Botão "Duvidar" fica habilitado quando há uma aposta
- [ ] Ao duvidar, o jogo resolve o desafio:
  - [ ] Mostra quantos dados realmente existem
  - [ ] Indica quem perdeu (você ou a IA)
  - [ ] Remove um dado do perdedor
  - [ ] Inicia nova rodada automaticamente
  - [ ] Rola novos dados para todos os jogadores

### 5. Nova Rodada
- [ ] Após um desafio, uma nova rodada começa
- [ ] Os dados são rolados novamente (novos valores)
- [ ] O perdedor da rodada anterior começa
- [ ] O contador de rodadas aumenta
- [ ] A aposta anterior é limpa

### 6. Fim de Jogo
- [ ] Quando alguém perde todos os dados, o jogo termina
- [ ] Mensagem de vitória aparece corretamente
- [ ] Botão "Jogar Novamente" aparece
- [ ] Ao clicar em "Jogar Novamente", o jogo reinicia

### 7. Lógica da IA
- [ ] A IA faz apostas automaticamente
- [ ] A IA às vezes duvida (quando a aposta parece improvável)
- [ ] A IA às vezes aumenta a aposta
- [ ] A IA não demora muito para jogar (1-2 segundos)

## 🎨 Testes de Interface

### 8. Visual
- [ ] Interface está responsiva e organizada
- [ ] Dados são visíveis e legíveis
- [ ] Cores estão adequadas (verde para fundo, etc.)
- [ ] Mensagens são claras e informativas
- [ ] Botões estão estilizados e funcionais

### 9. Feedback Visual
- [ ] Jogador atual tem destaque visual (borda amarela)
- [ ] Aposta atual aparece claramente na mesa
- [ ] Contador de rodadas está visível
- [ ] Contagem de dados de cada jogador está visível

## 🐛 Problemas Comuns a Verificar

### 10. Bugs Potenciais
- [ ] Não há erros no console do navegador (F12 → Console)
- [ ] O jogo não trava ou fica em loop infinito
- [ ] A IA não fica "pensando" infinitamente
- [ ] Não há erros ao alternar entre apostas e dúvidas rapidamente
- [ ] Os dados sempre mostram valores de 1-6

### 11. Regras do Jogo
- [ ] Coringas (dados de valor 1) contam corretamente
- [ ] Quando você aposta em "5", os dados de valor "1" também contam como "5"
- [ ] A resolução de desafios está correta (conta todos os dados corretamente)

## 📊 O que Observar Durante o Teste

### Comportamento Esperado da IA
- A IA deve ser inteligente o suficiente para ser um desafio
- A IA deve duvidar quando a aposta parece improvável
- A IA deve fazer apostas conservadoras no início

### Fluxo do Jogo
1. Você começa fazendo uma aposta
2. IA responde (aposta ou duvida)
3. Vocês alternam até alguém duvidar
4. Desafio é resolvido, alguém perde um dado
5. Nova rodada começa
6. Repete até alguém perder todos os dados

## 🎯 Resultado Esperado

Após completar este checklist, você deve ter:
- ✅ Jogo totalmente funcional
- ✅ Todas as regras implementadas corretamente
- ✅ IA jogando de forma inteligente
- ✅ Interface limpa e funcional
- ✅ Sem erros críticos

## 📝 Notas de Teste

_Use este espaço para anotar problemas encontrados:_

- Problema 1: _________________________
- Problema 2: _________________________
- Problema 3: _________________________

---

**Próximos Passos Após Validação:**
- Se tudo funcionar: Podemos começar a Fase 2 (Firebase/Multiplayer)
- Se houver bugs: Corrigimos antes de avançar
- Se quiser melhorias: Podemos adicionar na Fase 1 ou Fase 3

