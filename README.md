# Academia 365 — Comunicação, Observação e Pensamento Crítico

## Estrutura
- `index.html` — estrutura da aplicação
- `style.css` — visual responsivo
- `script.js` — lógica, progresso, backup e Supabase
- `missions.js` — 365 missões
- `supabase.sql` — tabelas + RLS
- `config.example.js` — modelo de configuração

## Como publicar no GitHub Pages
1. Crie um repositório público.
2. Envie TODOS os arquivos desta pasta para a raiz do repositório.
3. Settings → Pages → Deploy from branch → `main` → `/ (root)`.
4. Aguarde a publicação.

## Como ativar Supabase
1. Crie um projeto no Supabase.
2. Abra SQL Editor e execute `supabase.sql`.
3. Em Project Settings → API, copie a URL e a chave pública/publishable.
4. Crie `config.js` a partir de `config.example.js` e preencha os dois campos.
5. Envie `config.js` ao GitHub.
6. No site, use Configurações → Testar conexão.

A chave pública é apropriada para uso no frontend quando RLS está corretamente configurado. NÃO use service_role key no site.

## Segurança e recuperação
- O progresso é salvo localmente.
- O usuário pode exportar um backup JSON.
- Com Supabase configurado, o progresso pode ser sincronizado na nuvem.
- O banco usa RLS para restringir dados por usuário.
- Não armazene vídeos ou arquivos grandes no banco; o site usa links do YouTube.

## Conteúdo
O curso evita regras absolutas como “cruzar os braços = mentira”. As missões treinam observação, contexto, hipóteses alternativas e calibração de confiança.
