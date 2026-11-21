# O Último Deploy do Ano

RPG natalino em Canvas 2D, HTML, CSS e JavaScript puro. Projeto independente em `ultimo-deploy/`; a cópia do IFC Map original permanece em `reference/ifc-map/index.html`.

## Jogar

Abra **ultimo-deploy/index.html** no navegador. Não há instalação, compilação, imagens remotas ou dependências de execução.

Para usar um servidor local, execute nesta pasta:

```powershell
node serve.cjs
```

Acesse **http://127.0.0.1:8080/ultimo-deploy/**. O salvamento pertence ao navegador e à origem utilizados; trocar a porta ou usar `file://` cria outro contexto de armazenamento. Se o navegador bloquear o armazenamento de arquivos locais, use o servidor.

Para GitHub Pages, publique esta pasta como conteúdo estático. O `index.html` da raiz encaminha para o jogo. Também é possível publicar somente o conteúdo de `ultimo-deploy/` na raiz de outro site.

## O que está pronto

- Cinco atos conectados, todos os personagens e Willian, o estagiário, conversas com escolhas, revelação e celebração final na copa.
- Campus original completo: terreno, prédios, florestas, água animada, profundidade, colisões AABB, câmera suave e minimapa adaptados do IFC Map.
- Três interiores procedurais: Fábrica de Software, Biblioteca e Sala de Servidores. Natal noturno, sprites próprios, retratos, presentes, luzes e partículas.
- Puzzles de commits, rede e dados; linha do tempo, painel de luzes, memória e código guiado; um único encerramento.
- Objetivos contextualizados, mapa com viagem rápida, pistas, conquistas, pausa, áudio sintetizado opcional, reinício e salvamento automático.
- Teclado, clique/toque para caminhar e controles de toque. Interfaces responsivas, navegação por teclado, foco contido nos diálogos e respeito à preferência por movimento reduzido.

WASD/setas movem; Shift corre; E interage; Esc fecha/pausa; M abre mapa; J missões; Q evidências. Clique no chão para andar em linha reta; contorne obstáculos. O relógio do plantão é narrativo. Só o desafio binário usa tempo por rodada, com pausa e novas tentativas.

## Atualização de diálogos e elenco

Caixas de conversa inferiores inspiradas nos RPGs clássicos, com texto gradual e avanço por E, Enter, espaço ou toque. HUD reduzido a objetivo, Caderno e Mapa. O teste inicial e a validação final têm encenação com câmera, equipe e monitor; Esc pula a cena concluindo seu evento.

Willian fica na Fábrica, com cabelo castanho cacheado e crachá de estagiário. Oferece dicas conforme a missão, conta seu álibi e tem a reputação restaurada pelas evidências do histórico de commits. A conquista também é compatível com saves antigos. Fabrício não usa óculos; tem cabelo nas laterais e o topo da cabeça sem cabelo. Os demais retratos seguem as descrições fornecidas.

## Computadores, minigames e som

Ao interagir com um PC, Fabrício acessa o Campus OS. Cada estação tem área de trabalho, programa próprio, recado do Willian e controles para voltar ou sair. A investigação continua em diálogos antes e depois dos diagnósticos.

- **Commits:** arraste mudanças e testes para reconstruir a release; inspecione a linha que altera a rota.
- **Rede:** gire os conectores e envie um pacote pelo circuito para descobrir seu destino.
- **Dados:** três transmissões binárias, alternando decimal → bits e bits → decimal, com 45 segundos por rodada. O relógio pausa ao pedir dica, ao apertar Pausar ou ao ocultar a aba. Tempo esgotado permite repetir apenas a rodada atual. Depois, complete uma consulta guiada.
- **Evidências:** percorra os horários com um controle de tempo e descubra o instante em que a rota mudou.
- **Recuperação:** apague os alertas de um painel 3×3; cada interruptor inverte a própria luz e as quatro vizinhas. Quando estável, a rotina preparada executa backup, rota, migração e proteção.
- **Testes finais:** comandos prontos e poucos campos destacados para preencher. Rode e acompanhe o resultado, sem precisar escrever sintaxe.
- **Cartões:** jogo da memória com quatro pares embaralhados. A conferência faz parte do deploy completo.

As peças também funcionam por seleção e clique no destino, ou Tab/Enter. Todos os desafios permitem repetir e pedir dicas. O código guiado usa um interpretador limitado, parecido com Python; os comandos vêm montados e não executam Python completo nem JavaScript. As dicas de Willian explicam estratégias sem apresentar o gabarito.

A trilha original é sintetizada no navegador, com temas para exploração, computadores e vitória. As vozes de diálogo foram amplificadas, mantendo os efeitos no volume anterior. Cada personagem tem frequência e timbre próprios, além de efeitos de clique, encaixe, erro e acerto. O áudio começa após uma interação; o botão ♪ silencia tudo. **Pausa → Música e efeitos** controla música e vozes/efeitos separadamente. As preferências ficam salvas e o som pausa quando a aba fica oculta. Saves antigos mantêm a preferência de silêncio já escolhida.

Referências pesquisadas para as mecânicas: [Net, de Simon Tatham](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/net.html), [cartas binárias do CS Unplugged](https://classic.csunplugged.org/activities/binary-numbers/) e [TIS-100, da Zachtronics](https://www.zachtronics.com/tis-100/). Implementação, narrativa, interfaces e música próprias; sem usar os arquivos desses jogos. As falas sintetizadas seguem a ideia de vozes curtas de RPGs como Undertale, sem samples do jogo.

## Encerramento único

O deploy só conclui após recuperação, testes e cartões conferidos. Pendências voltam para a própria tarefa, sem finais alternativos. Ao concluir, todos saem da Fábrica, caminham até a copa e saltitam em volta da mesa com o bolo. A câmera sobe para a lua e a silhueta do trenó passa com um “ho, ho, ho”. A cena termina em **Feliz Natal**, com uma fotografia ilustrada da equipe comendo bolo.

A cena e a foto são pixel art autoral desenhada em Canvas, usando as aparências do elenco. Não há conversas repetidas nem exploração após o fim; ficam disponíveis rever a celebração, créditos e menu. A opção “Pular para a foto” conclui a cena; continuar uma partida finalizada abre a foto. Saves de finais anteriores são migrados para a mesma celebração. Movimento reduzido desliga os pulos e troca a subida de câmera por um corte. A fala de Papai Noel usa uma voz portuguesa local, se disponível, ou um efeito vocal sintetizado como alternativa, sempre respeitando o som desligado.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `ultimo-deploy/index.html`, `style.css` | Estrutura e identidade visual |
| `js/campus.js` | Geometria, arte e colisões extraídas do IFC Map |
| `js/engine.js` | Loop, câmera, controles, interiores e renderização |
| `js/story.js` | Personagens, falas e pistas |
| `js/characters.js`, `experience.css` | Aparências, retratos, HUD e caixas de diálogo |
| `js/state.js` | Atos, validações, finais e persistência |
| `js/ui.js` | Interfaces, puzzles e integração da campanha |
| `js/minigames.js`, `js/puzzle-rules.js`, `computer.css` | Minigames, interpretador didático e telas dos PCs |
| `js/finale.js` | Saída da equipe, ceia, câmera, trenó e fotografia final |
| `js/audio.js` | Música e efeitos originais em Web Audio |
| `tests/campaign.test.cjs` | Regras de progressão e persistência |
| `tests/browser.html`, `tests/browser.js` | Verificação integrada no navegador |

## Verificação

```powershell
node --test ultimo-deploy/tests/*.test.cjs
```

Os testes cobrem os cinco atos, as 120 ordens dos depoimentos obrigatórios, respostas incorretas, ordem de recuperação, encerramento único, salvamento indisponível/inválido, reinício, circuitos, conversões, execução didática e controles de áudio.

Com o servidor iniciado, abra `/ultimo-deploy/tests/browser.html` e clique em **Executar verificação completa**. O teste dirige as interfaces reais, verifica acesso aos pontos interativos dos interiores, acompanha todas as etapas da celebração, continuação e recarregamento. Usa teleporte de preparação entre cenas; não simula cada passo do jogador. Preserva e restaura o save anterior. Não abra uma partida ativa em outra aba durante esse teste, para evitar concorrência de salvamentos.

A página `/ultimo-deploy/tests/preview.html` permite conferir as telas e arrastar peças sem salvar a sessão de prévia.

## Possíveis expansões

Mais missões opcionais e ramificações, interiores adicionais, navegação automática em torno de obstáculos e calibração da duração de 25–30 minutos com jogadores. Esta versão prioriza o ciclo completo e a recuperação sem bloqueios.

## Origem

Base: https://github.com/willian-hm/ifc-map — arquivo `index.html`, blob `ec7d11cd0437db18b843e59bdb63c559b10901ac`, consultado em 20/11/2026. A estrutura, texturas, prédios, vegetação, lagos e resolução de colisões foram reaproveitados; câmera e minimapa adaptados para a campanha. Nenhuma alteração foi feita no repositório remoto.

História inteiramente fictícia e afetuosa. Os sistemas, commits e dados de entregas existem apenas dentro do jogo.
