# 📚 Ex Libris — Clube do Livro Privado (6 Membros)

Uma aplicação web completa, moderna e pronta para produção para um **Clube do Livro Privado de 6 membros**, desenvolvida com **React**, **Tailwind CSS**, **Lucide Icons** e **Canvas Confetti**.

Possui persistência completa de dados via `localStorage` (todas as ações como votos, indicações, confirmações de presença, metas semanais e resenhas críticas ficam salvas automaticamente no navegador) e integração nativa com a **Google Books API**.

---

## 🎨 Identidade Visual & UI/UX (Warm Library / Dark Academia Editorial)

A aplicação adota a estética *Dark Academia & Warm Library*, inspirada em bibliotecas clássicas, papel de algodão envelhecido e tipografia editorial:

- **Fundo Geral**: Bege papel antigo (`#F8F5EE` e `#FAF7F0`) com textura sutil de granulação.
- **Destaque Primário**: Verde-oliva floresta profundo (`#1E3A2F` e `#162C23`).
- **Acentos & Tags**: Terracota suave (`#B85D43`) e Dourado/Âmbar nobre (`#D99B26`).
- **Tipografia**: 
  - Títulos elegantes com serifa: *Playfair Display* e *Lora* (Google Fonts).
  - Textos de leitura e números limpos: *Plus Jakarta Sans*.
- **Capas com Efeito 3D**: Efeito de lombada física, perspectiva sutil e sombreamento de profundidade (*drop shadow* editorial). Fallback inteligente para capas não encontradas gerado via SVG vetorial estilizado.

---

## 🚀 Funcionalidades por Módulo

### 1. Seletor & Edição de Perfil Ativo (Header e Seção Membros)
- Dropdown no topo com os **6 membros fixos do clube**:
  1. **Helena Ramos** (*A Filósofa Noturna*)
  2. **Gabriel Toledo** (*Devorador de Clássicos*)
  3. **Clara Albuquerque** (*A Caçadora de Mistérios*)
  4. **Lucas Mendonça** (*Entusiasta de Ficção*)
  5. **Beatriz Fontes** (*Crítica Implacável*)
  6. **Thiago Valente** (*Poeta da Madrugada*)
- **Poder de Edição Completa de Perfil**:
  - Cada membro pode editar seu nome, insígnia de leitor, livro favorito da vida, biografia literária, foto de perfil (com URL ou seletor de retratos vintage) e paleta de cores própria.
  - Acesso direto pelo Header ou pelos cards da aba "Membros & Métricas".
- O usuário pode alternar de perfil a qualquer momento para testar as ações de cada membro.
- Botão de **Restaurar Dados Padrão** caso queira reiniciar a demonstração.

### 2. Painel Principal: Leitura Atual, Reunião & Citações
- **Card Destaque do Mês:**
  - Capa 3D com sombra editorial, título, autor, total de páginas e badge "Em Leitura".
  - Botão de **Editar Obra do Mês**: permite ajustar título, autor, páginas, gênero, capa e sinopse.
  - Sinopse retrátil ("Ver mais / Ver menos").
  - Metas semanais de leitura (Semanas 1 a 4) com checkboxes interativos que salvam o avanço individual do membro e exibem a média de conclusão de todo o clube.
- **Próxima Reunião (Totalmente Customizável):**
  - Botão **Editar Encontro**: qualquer membro pode alterar data, horário, modalidade ("Apenas Online via Google Meet", "Híbrida" ou "Apenas Presencial"), link do Google Meet/Zoom e local físico/endereço.
  - Se configurada como 100% online, os campos físicos são adaptados automaticamente.
  - **Contador regressivo dinâmico** em tempo real (Dias, Horas, Minutos e Segundos).
  - Sistema de confirmação de presença (**RSVP**) interativo que adiciona/remove o avatar do membro ativo da lista de confirmados.
- **Mural de Citações Rápidas:**
  - Formulário para registrar trecho favorito e número da página.
  - Assinatura automática com foto e cor do membro ativo.
  - **Editar e Excluir Citações**: o autor pode editar texto e página diretamente no card ou excluí-lo.
  - Botão de curtir (coração) com contagem.

### 3. Urna Mensal (Sistema de Votação & Indicações)
- **Status da Votação:** Alternância visual entre status "Aberta" e "Encerrada".
- **Integração Google Books API:**
  - Input com autocomplete e busca em tempo real (`https://www.googleapis.com/books/v1/volumes`).
  - Dropdown com miniatura da capa, autor e páginas.
  - Ao clicar, autopreenche título, autor, páginas, capa e sinopse sem digitação manual.
  - Campo especial para defesa: *"Por que ler este livro?"*.
- **Poder de Editar e Excluir a Própria Indicação:**
  - O membro que indicou uma obra pode clicar em **Editar** para ajustar dados ou defesa, ou **Excluir** para retirá-la da urna e ficar livre para indicar outro livro!
- **Cards de Votação:**
  - Regra de até 2 votos por membro por rodada.
  - Exibição de contagem total de votos e barra percentual de cada obra indicada.
  - Avatares dos membros que votaram em cada livro.
- **Desempate da Sorte (Roleta Interativa):**
  - Em caso de empate ou indecisão, abre uma roleta animada física que sorteia o livro com explosão de confete (*canvas-confetti*).
- **Promover a Livro do Mês:**
  - Transforma o livro eleito na nova Leitura Atual com 1 clique, arquivando o anterior no histórico, gerando novas metas semanais e reagendando o próximo encontro.

### 4. Acervo & Histórico do Clube
- Grid cronológico com as leituras já debatidas pelo clube.
- Filtro de busca instantânea por título, autor, gênero ou mês.
- Notas médias calculadas dinamicamente com base nas resenhas dos membros.
- **Modal de Detalhes Completo:**
  - Sinopse da obra e resenhas de todos os membros.
  - **Editar e Excluir a Própria Resenha**: o membro ativo pode editar sua avaliação com estrelas interativas ou clicar em **Excluir Resenha** para remover sua nota e crítica, recalculando a média do acervo em tempo real.

### 5. Membros & Métricas
- Cards individuais luxuosos para cada um dos 6 membros com bio, avatar, livro favorito da vida, insígnia e estatísticas de engajamento (resenhas, citações, presença).
- Botão "Editar Meu Perfil" em destaque para o membro logado.
- Métricas globais no topo:
  - Total de páginas lidas no ano.
  - Total de reuniões realizadas.
  - Média geral de notas do clube.
  - Gênero mais lido.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **Vite 8**
- **Tailwind CSS 3**
- **Lucide Icons**
- **Canvas Confetti**
- **Google Books REST API**
- **localStorage API**

---

## 💻 Como Rodar o Projeto

1. Certifique-se de ter o **Node.js** instalado (versão 18+).
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse no navegador:
   ```
   http://localhost:5173/
   ```

5. Para gerar a build de produção otimizada:
   ```bash
   npm run build
   ```
