## TikTok Accounts Manager

App dark profissional (preto/cinza com verde para monetizado) para você cadastrar contas TikTok com email/senha + link, buscar dados do perfil automaticamente, e organizar para venda.

### Funcionalidades

**1. Cadastrar conta**
Formulário com:
- Email da conta
- Senha da conta
- Link do perfil TikTok (ex: `https://tiktok.com/@usuario`)
- Categoria (dropdown das suas categorias salvas + botão "+ nova")
- País (dropdown com bandeira emoji 🇧🇷 + nome)
- Botão **Carregar perfil** → faz scraping público do TikTok e preenche: nome de exibição, @handle, foto de perfil, seguidores, likes, bio

**2. Lista de contas (cards em grid)**
Cada card mostra:
- Foto de perfil + nome + @handle
- 🇧🇷 Brasil (bandeira + país)
- Categoria (badge)
- 👥 Seguidores · ❤️ Likes (formatados: 12.5K, 1.2M)
- Email/senha (com botão copiar e olho mostrar/esconder)
- Link do TikTok (abre em nova aba)
- **Badges de status:**
  - **Monetização**: verde "Monetized" se ≥10K seguidores, amarelo "Pendente" se <10K
  - **Shop**: verde "Shop ativo" se ≥2K seguidores, cinza "Shop bloqueado" se <2K
- Botões: Atualizar dados (re-scrape), Editar, Excluir

**3. Filtros e busca no topo**
- Busca por nome/@
- Filtro por categoria, país, status monetização, status shop
- Ordenar por: seguidores, likes, data de adição

**4. Dashboard topo**
Cards de resumo: Total de contas · Monetizadas · Com Shop · Total de seguidores somados

**5. Gerenciar categorias**
Página/modal onde você cria, renomeia e exclui suas próprias categorias.

### Visual

Tema dark profissional: fundo `#0a0a0a` / cinzas, accent **verde** (`#22c55e`) para monetizado, **amarelo** para pendente, tipografia clean (Inter). Cards com borda sutil, hover elevation, transições suaves. Skeleton loaders enquanto o perfil carrega.

### Detalhes técnicos

- **Stack**: TanStack Start (já configurado) + Lovable Cloud para persistir contas e categorias.
- **Scraping TikTok**: server route `/api/tiktok/profile` que faz fetch do HTML público do perfil e extrai o JSON embutido (`__UNIVERSAL_DATA_FOR_REHYDRATION__`) para pegar avatar, nome, seguidores, likes, bio. Se falhar (TikTok bloquear), retorna erro claro e permite preencher manualmente.
- **Senhas** salvas no banco (você pediu sem login). Aviso visual de que ficam acessíveis a quem entrar no app.
- **Tabelas**: `accounts` (todos os campos + snapshot do perfil + timestamps) e `categories` (nome).
- **Países**: lista local com nome PT-BR + emoji da bandeira (não precisa de API).

### Limitações honestas do scraping gratuito

O TikTok pode bloquear requests do servidor (rate limit / Cloudflare). Quando isso acontecer, o app mostra "Não foi possível carregar — preencha manualmente" e libera os campos para edição. Vale para o "Atualizar dados" também. Se virar problema recorrente, dá pra trocar depois por uma API paga.