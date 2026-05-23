# Página de Remoção de Tatuagens — Fisiolaser Manaus

Landing page premium para remoção e clareamento de tatuagens a laser, com captura de leads e publicação no **Cloudflare Pages**.

## O que o site inclui

- Página responsiva (desktop e mobile) com hero, benefícios, tecnologia Ômer, processo, FAQ e CTA final
- Links de WhatsApp com número real: **+55 92 99967-9178** (`5592999679178`)
- Modal de agendamento antes de abrir o WhatsApp (nome, telefone e procedimento)
- API `POST /api/leads` gravando leads no **Cloudflare D1**
- Backup local dos últimos 30 leads no navegador (`localStorage`)

## Arquivos principais

| Arquivo / pasta | Função |
|-----------------|--------|
| `index.html` | Estrutura e conteúdo da página |
| `styles.css` | Layout, tema e responsividade |
| `script.js` | Menu, scroll, reveals, modal e envio de leads |
| `assets/` | Imagens (banners, máquina, profissional, etc.) |
| `functions/api/leads.js` | Function que salva leads no D1 |
| `database/schema.sql` | Schema da tabela `leads` |
| `wrangler.toml` | Configuração do projeto e binding D1 |
| `_headers` | Cabeçalhos de segurança HTTP |

## Publicar no Cloudflare Pages

1. Conecte o repositório Git ao Cloudflare Pages.
2. Use as configurações de build:
   - **Framework preset:** `None`
   - **Build command:** deixar vazio
   - **Build output directory:** `/` (raiz do repositório)
3. Faça push na branch `main` — o deploy em produção é disparado automaticamente.

Se o deploy automático não atualizar o site, publique manualmente (requer `CLOUDFLARE_API_TOKEN` ou login no Wrangler):

```bash
node scripts/deploy-pages.mjs
```

O script monta a pasta `.deploy` sem PSDs locais e envia para o projeto `pagina-tatoo-dra-vanessa` (domínio `fisiolasermanaus.com.br`).

Repositório: `https://github.com/maninhocriativos/pagina-tatoo-dra-vanessa`

## Banco D1 (leads)

1. Crie o banco D1 `pagina-tatoo-dra-vanessa-leads` (ou use o já configurado no `wrangler.toml`).
2. Aplique o schema:

```bash
npx wrangler d1 execute pagina-tatoo-dra-vanessa-leads --remote --file=./database/schema.sql
```

3. No painel do Cloudflare Pages, confirme o binding **`LEADS_DB`** apontando para esse banco.

Sem o binding, a API responde `503` e o WhatsApp continua funcionando (o formulário abre o chat mesmo assim).

## Alterar o WhatsApp

Atualize o número em dois lugares:

- `index.html` — links `https://wa.me/5592999679178`
- `script.js` — constante `whatsappNumber`

## Desenvolvimento local

Arquivos estáticos podem ser abertos direto no navegador ou servidos com qualquer servidor local na raiz do projeto.

Para testar a API de leads localmente:

```bash
npx wrangler pages dev .
```

## Performance (imagens)

As imagens da página têm versões **WebP** com `srcset` responsivo. Para regenerar após trocar um PNG:

```bash
npm install sharp
node scripts/optimize-images.mjs
```

## Arquivos ignorados no deploy

- `*.psd`, `.screenshots/`, `.wrangler/`, `node_modules/`
