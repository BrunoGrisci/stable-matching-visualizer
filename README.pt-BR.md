# stable-matching-visualizer

Ferramenta web interativa para estudar o algoritmo de Gale-Shapley (Problema do Emparelhamento Estável), com execução passo a passo, animação em grafo, instâncias editáveis e curvas de propostas.

## Funcionalidades

- Simulação completa de Gale-Shapley com:
  - `Executar passo`
  - `Auto executar` com controle de velocidade (`0.25x, 0.5x, 1x, 2x, 4x, 8x, 10x`)
  - `Executar completo` (vai direto para o estado final)
  - destaque da linha atual do pseudocódigo
  - painel de estruturas de dados (`w_rank`, fila livre, `next_idx`, `engaged_to`)
  - log de passos
- Alternância de idioma: Inglês e Português (Brasil).
- Alternância de tema: modo claro e escuro.
- Divisores redimensionáveis e painéis de Controle/Algoritmo recolhíveis.
- Visualização em tabelas de preferências:
  - duas tabelas lado a lado
  - destaque do proponente/receptor ativo
  - marcadores de posição do parceiro
- Visualização em grafo bipartido:
  - homens de um lado, mulheres do outro
  - arestas dirigidas de preferência
  - arestas mais grossas para preferências mais altas
  - arestas douradas para pares noivos
  - anel indicando participantes noivos
- Contadores:
  - número de propostas
  - pares noivos
  - homens solteiros
  - mulheres solteiras
- Fontes de instância:
  - instância demo HPL/SPL
  - gerador de pior caso (rotulado como `Pior caso`, com `n` customizável)
  - geradores aleatório, inverso e fácil (com `n` customizável)
  - tabelas editáveis de homens/mulheres
  - importação/exportação CSV
- Aba de curvas (similar ao `plot_curves` em `references/galeshapley.py`):
  - média de propostas para aleatório/inverso/fácil/pior caso
  - curvas de referência (`~n`, `~n(n+1)/2`, `~n^2`)
  - toggles interativos, tooltip ao clicar pontos, seletor de alcance em X e zoom em Y
- Menu de cenários extras:
  - categorias good/bad
  - pares proibidos
  - capacidades no lado receptor (extensão estilo hospitais)
- Personalização dos nomes dos dois grupos (padrão: Homens/Mulheres).
- Painel de insights de corretude:
  - status de emparelhamento perfeito
  - verificação de pares instáveis
  - verificação de limite de terminação
  - observação de ótimo para proponentes / péssimo para receptores

## Arquivos Principais

- `galeshapley.html`
- `galeshapley/css/style.css`
- `galeshapley/js/i18n.js`
- `galeshapley/js/algorithms.js`
- `galeshapley/js/main.js`

## Como Executar Localmente

Use qualquer servidor estático. Exemplo:

```bash
python3 -m http.server 4173
```

Depois abra:

- `http://127.0.0.1:4173/galeshapley.html`

## Formato CSV

Linhas suportadas:

- `group,name,prefs,capacity,category`
- `forbidden,man,woman`

Onde:

- `group` é `men` ou `women`
- `prefs` usa separador `|` (exemplo: `W1|W2|W3`)
- `capacity` é opcional (padrão `1`) e deve ser `>= 1`
- `category` é opcional (`good` / `bad`)

Exemplo:

```csv
group,name,prefs,capacity,category
men,M1,W2|W1|W3,1,good
men,M2,W1|W2|W3,1,bad
women,W1,M2|M1|M3,1,good
women,W2,M1|M2|M3,2,bad
forbidden,M1,W3
```

## Observações

- A aplicação é estática (`HTML/CSS/JavaScript`) e adequada para hospedagem no GitHub Pages.
- Para instâncias muito grandes, a renderização do grafo muda para modo compacto para manter responsividade.

## Licença

Licença MIT. Veja `LICENSE`.
