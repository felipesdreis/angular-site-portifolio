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
- **Angular Material 15** — tema prebuilt `purple-green`; componentes usados: Toolbar, Icon, Button, Card
- **CSS puro** — sem SCSS/Sass; estilos globais em `src/styles.css`, estilos de componente em arquivos `.css` individuais
- **ngx-markdown 15** — instalado, uso mínimo atualmente
- **RxJS 7.5**

## Arquitetura

```
src/app/
├── app.component.*          # Root: toolbar de navegação + <router-outlet>
├── app.module.ts            # Declara os 4 componentes, importa módulos Material
├── app-routing.module.ts    # Rotas centralizadas
├── home/                    # Landing page: logo + botões de redes sociais
├── projetos/                # Galeria de projetos em mat-card (*ngFor)
└── redirect/                # Redireciona /shared → Google Drive na inicialização
```

### Rotas

| Caminho      | Componente          | Descrição                        |
|-------------|---------------------|----------------------------------|
| `/`          | HomeComponent       | Landing page                     |
| `/projetos`  | ProjetosComponent   | Galeria de projetos              |
| `/shared`    | RedirectComponent   | Redirect para pasta Google Drive |

## Estilo visual

- Dark theme: fundo `#212121`, texto `aliceblue`
- Acentos: amarelo `#DBDA2C` (toolbar), laranja `#DB5116` / `#ff9500`
- Fontes: **Bebas Neue** (decorativa) + **Roboto** — ambas via Google Fonts
- Dimensionamento responsivo com unidades `vw`/`vh`
- Efeitos hover em botões via pseudo-elemento `::before` + `transition: 0.5s`

## Conteúdo do site

### Projetos listados (`ProjetosComponent`)

| Nome | Descrição |
|------|-----------|
| `wtm-work-time-manager` | Gerenciador de horas de trabalho |
| `dash-formulaone-2021` | Dashboard de dados da F1 2021 |
| `web_stopwatch_work` | Cronômetro web para trabalho |

Cada projeto exibe um banner e linka para o repo no GitHub de `@felipesdreis`.

### Links sociais (`HomeComponent`)

- LinkedIn: `/in/felipesdreis/`
- GitHub: `@felipesdreis`
- Instagram: `@felipesdreis`
- YouTube: canal UCjtrvb1ZG8Z4JHlgYgf9rsg

## Convenções de código

- TypeScript strict: `strict`, `strictTemplates`, `strictInjectionParameters` todos ativados
- Sem preprocessador CSS — usar CSS puro nas alterações de estilo
- Módulo Angular tradicional (não standalone components)
- Novos componentes devem ser declarados em `AppModule`

## Notas importantes

- **`/src/blog-bkp/`** é código legado de uma tentativa de blog interno. Não está em uso; o blog foi migrado para Hexo externo.
- O arquivo `src/assets/blog/blog.md` está vazio — remanescente da tentativa anterior.
- A rota `/shared` redireciona para uma pasta específica do Google Drive (ID: `1K6036Zt9cRQwCNB_krFez8YJG2KjH6Hp`).
