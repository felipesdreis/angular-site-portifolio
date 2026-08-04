---
version: alpha
name: Rolex — Submariner
description: Landing page editorial de luxo para o relógio Rolex Submariner, com tipografia Helvetica pesada, verde-esmeralda como único acento cromático e vídeo full-bleed com overlays em vidro translúcido.
omitted: [colors.on-primary, colors.on-secondary, colors.on-tertiary, colors.primary-container, spacing.lg, elevation tokens numéricos de sombra]

colors:
  primary: "#212121"
  secondary: "#127749"
  tertiary: "#1A915A"
  neutral: "#FFFFFF"

typography:
  h1:
    fontFamily: "Helvetica Now Text"
    fontSize: 6rem
  h2:
    fontFamily: "Helvetica Now Text"
    fontSize: 3.1rem
  label-caps:
    fontFamily: "Helvetica Now Text"
    fontSize: 0.875rem
  body-md:
    fontFamily: "Helvetica Now Text"
    fontSize: 1rem

rounded:
  sm: 6px
  lg: 50px
  full: 9999px

spacing:
  sm: 8px
  md: 16px

components:
  button-primary:
    backgroundColor: "linear-gradient(45deg, #10633D, {colors.tertiary})"
    textColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
  button-glass:
    backgroundColor: "rgba(118, 118, 118, 0.3)"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: "0 35px"
---

## Overview

O site do Submariner é a versão web do balcão de uma boutique Rolex: pouco texto, imagens e vídeo em tela cheia, e uma paleta quase monocromática que só se permite uma cor viva — o verde-esmeralda da marca — reservada exclusivamente para links e para o único botão de ação ("Configurar"). A tipografia é Helvetica Now Text em dois extremos de peso (300 no corpo, 700 nos títulos e rótulos), o que cria contraste sem depender de cor. O layout é editorial: título grande de um lado, parágrafo curto do outro, sempre sobre uma foto ou vídeo do relógio ocupando a largura inteira da viewport. A sensação buscada é a de um produto atemporal e sério, não a de um e-commerce comum — por isso a quase ausência de chrome de interface (sem cards com sombra, sem grades visíveis) e a preferência por overlays de vidro translúcido sobre elementos sólidos.

## Colors

- **Primary `#212121`** — cor de todo o texto de leitura (corpo e headings). Não é preto puro; um cinza-quase-preto que suaviza o contraste em fundos de foto.
- **Secondary `#127749`** — verde escuro usado em links de texto inline. É a cor de "ação secundária/textual", mais discreta que o verde do botão.
- **Tertiary `#1A915A`** — ponta clara do gradiente do botão primário (`linear-gradient(45deg, #10633D → #1A915A)`). É a única cor que grita "clique aqui" na página inteira; usada com extrema parcimônia, só no CTA "Configurar".
- **Neutral `#FFFFFF`** — fundo de header/nav e cor do texto sobre imagens escuras ou sobre o botão verde. Todo o resto do "fundo" da página na verdade é fotografia/vídeo, não um preenchimento sólido.

## Typography

Família única: **Helvetica Now Text** (fallback `Helvetica, Arial, sans-serif`) — sem serifas, sem fonte de destaque separada; a hierarquia vem inteiramente do peso e do tamanho.

- **h1** (`6rem`, weight 700, line-height apertado ~0.95) — o nome do modelo ("Submariner"), tratado como wordmark, não como headline comum.
- **h2** (`~3.1rem`, weight 700) — chamadas de seção ("Desafiando o desconhecido"), mesma família de peso do h1 em escala menor.
- **label-caps** (`0.875rem`, weight 700, uppercase, letter-spacing aberto) — rótulos curtos como "OYSTER PERPETUAL" acima do título; funcionam como uma assinatura editorial discreta.
- **body-md** (`1rem`, weight **300**) — o peso leve no corpo é deliberado: mantém o texto legível sem competir visualmente com os títulos em 700.

## Layout

Sem grid de cards visível: cada seção é full-bleed (imagem ou vídeo ocupando 100% da largura), com o texto sobreposto em duas colunas simples — título à esquerda, parágrafo de apoio à direita — ou centralizado sobre o hero. O espaçamento interno de componentes pequenos (botões) usa uma escala curta e consistente: `8px` (sm) entre elemento e borda vertical, `16px` (md) na horizontal. A ausência de uma grade de conteúdo tradicional (sem sidebar, sem colunas múltiplas de cards) reforça a leitura de "revista", uma seção por rolagem.

## Elevation & Depth

Não há sombras tradicionais (`box-shadow`) em nenhum componente inspecionado — a profundidade vem de **vidro translúcido**, não de sombra projetada: o botão "Assistir ao vídeo" sobre o hero em vídeo usa `background: rgba(118,118,118,0.3)` combinado com `backdrop-filter: blur(5px)`, criando um efeito de vidro fumê sobre a imagem em movimento em vez de flutuar sobre um fundo sólido.

## Shapes

Duas linguagens de forma coexistem:

- **`sm` (6px)** — botões utilitários pequenos, quase quadrados, para ações secundárias no header.
- **`lg` (50px)** — o botão de CTA principal ("Configurar"), uma pílula quase completa.
- **`full` (9999px)** — pílula perfeita, reservada ao botão de vidro sobre vídeo, reforçando que ele "flutua" por cima do conteúdo em vez de ser parte da grade de UI.

## Components

- **`button-primary`** — fundo em gradiente diagonal verde (`#10633D → #1A915A`), texto branco em bold, `rounded.lg` (pílula), padding `8px 16px`. É o único botão sólido do site e o único ponto de cor saturada na página.
- **`button-glass`** — fundo cinza translúcido com blur, texto branco em bold, `rounded.full`, padding horizontal generoso (`0 35px`) e sem padding vertical (a altura vem do line-height do texto). Usado exclusivamente sobre imagem/vídeo, nunca sobre fundo sólido.

## Do's and Don'ts

- **Faça** reservar o verde (`{colors.tertiary}`/`{colors.secondary}`) para ações e links — em nenhum outro lugar do site essa cor aparece como decoração.
- **Faça** deixar a fotografia/vídeo do produto ser o "fundo" real da página; texto e botões existem para flutuar sobre ela, não para compor com um fundo de cor sólida.
- **Não** adicione sombras (`box-shadow`) em botões ou cards — a profundidade aqui é feita com transparência e blur, não com sombra projetada.
- **Não** misture pesos de fonte intermediários — o contraste tipográfico do site depende do salto abrupto entre 300 (corpo) e 700 (títulos/rótulos), um peso 400/500 no meio dilui esse efeito.
