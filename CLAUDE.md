# angular-site-portifolio

Portfólio pessoal de **Felipe Reis** (`@felipesdreis`), desenvolvedor.
Site em produção: `felipedosreis.com.br` | Blog externo: `blog.felipedosreis.com.br` (Hexo)

## Comandos essenciais

```bash
npm start        # ng serve — dev server em localhost:4200
npm run build    # ng build — build de produção em dist/angular-test
npm test         # ng test  — Karma + Jasmine
```

## Stack

- **Angular 15** + TypeScript 4.8 (strict mode ativado)
- **Angular Material 15** — instalado no `package.json` mas não importado em lugar nenhum do app (removido de `AppModule` junto com o `ProjetosComponent`, único consumidor de `MatIconModule`)
- **CSS puro** — sem SCSS/Sass; estilos globais em `src/styles.css`, estilos de componente em arquivos `.css` individuais
- **ngx-markdown 15** — instalado, uso mínimo atualmente
- **RxJS 7.5**

## Arquitetura

```
src/app/
├── app.component.*          # Root: layer de gradiente de fundo (parallax fixo) + <router-outlet>
├── app.module.ts            # Declara HomeComponent, RedirectComponent, ParallaxDirective
├── app-routing.module.ts    # Rotas + wildcard (**) redirecionando pra Home
├── parallax.directive.ts    # Diretiva `appParallax` reutilizável (scroll-linked transform)
├── home/                    # Single-page: nav + hero + sobre + stack + projetos + blog + footer
└── redirect/                # Redireciona /shared → Google Drive na inicialização
```

### Rotas

| Caminho      | Componente          | Descrição                        |
|-------------|---------------------|----------------------------------|
| `/`          | HomeComponent       | Página única (single-page)       |
| `/shared`    | RedirectComponent   | Redirect para pasta Google Drive |
| `**`         | —                    | redirectTo `/` (sem 404)         |

## Estilo visual

- Dark theme: fundo `#0F0D13`, texto `#E6E1E5`
- Acentos: verde "Kermit" `#3FBE4D` / `#B6F2A4` — não há amarelo/laranja no app (essa paleta só existe em `src/assets/locked-in/index.html`, ver Notas importantes)
- Fonte única: **Roboto** (+ Roboto Mono em tags/código) via Google Fonts — Bebas Neue não é usada no app Angular
- Dimensionamento responsivo com unidades `vw`/`vh`
- `ParallaxDirective` (`appParallax`, `src/app/parallax.directive.ts`) dá profundidade via scroll; auto-detecta `position:fixed` e limita o deslocamento a 50px — reaproveitar em vez de recriar lógica de scroll

## Conteúdo do site

### Projetos listados (seção `#projetos` do `HomeComponent`)

4 cards hardcoded no template (`wtm-work-time-manager`, `dash-formulaone`, `keep-awake`, `video-path-organizer`) — nome, descrição curta, tags e link pro GitHub de `@felipesdreis`. Sem imagem de banner.

### Links sociais (`HomeComponent`)

- LinkedIn: `/in/felipesdreis/`
- GitHub: `@felipesdreis`
- Instagram: `@felipesdreis`
- YouTube: canal UCjtrvb1ZG8Z4JHlgYgf9rsg

## Convenções de código

- TypeScript strict: `strict`, `strictTemplates`, `strictInjectionParameters` todos ativados
- `strictTemplates` exige property binding (`[input]="valor"`) para `@Input` de tipo não-string — atributo puro (`input="valor"`) falha o build com `TS2322`
- Sem preprocessador CSS — usar CSS puro nas alterações de estilo
- Módulo Angular tradicional (não standalone components)
- Novos componentes devem ser declarados em `AppModule`

## Notas importantes

- **`/src/blog-bkp/`** é código legado de uma tentativa de blog interno. Não está em uso; o blog foi migrado para Hexo externo.
- O arquivo `src/assets/blog/blog.md` está vazio — remanescente da tentativa anterior.
- A rota `/shared` redireciona para uma pasta específica do Google Drive (ID: `1K6036Zt9cRQwCNB_krFez8YJG2KjH6Hp`).
- **`src/assets/locked-in/index.html`** é uma landing estática solta ("Locked In"), sem rota Angular apontando pra ela — só acessível via URL direta do asset. Tem paleta/fontes próprias (laranja + Bebas Neue) não relacionadas ao resto do site.
