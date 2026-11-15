# ML Store

Site institucional demonstrativo da ML Store, com identidade visual em preto e dourado.

## Conteúdo do site

- Página responsiva para celular e computador.
- Seções institucionais, manifesto, galeria, campanha e contato.
- Textos, fotos principais e galeria editáveis pelo Pages CMS.
- Links de Instagram e WhatsApp.
- Conteúdo inicial ilustrativo, que deve ser substituído por informações e imagens autorizadas pela loja.

## Como editar o site

1. Abra `/admin.html` no domínio publicado para acessar as instruções do painel.
2. Entre em https://app.pagescms.org/ usando a conta GitHub autorizada.
3. Selecione o repositório `wchagas73-lang/ml-store` e a branch `main`.
4. Edite **Conteúdo e identidade do site** para textos, contatos e imagens principais.
5. Edite **Fotos da galeria** para adicionar, remover ou reorganizar imagens.
6. Salve as alterações. O Pages CMS grava os arquivos no GitHub e o Cloudflare Pages publica o novo commit.

## Armazenamento e publicação

- O conteúdo fica nos arquivos `data/site.json` e `data/gallery.json`.
- As imagens enviadas pelo CMS ficam em `media/images/`.
- O Cloudflare Pages hospeda os arquivos públicos do site.
- Não são necessários D1, R2, banco de dados próprio ou secrets de login administrativo neste projeto.

## Configuração de hospedagem

Para o projeto Cloudflare Pages existente:
- Repositório: `wchagas73-lang/ml-store`
- Branch de produção: `main`
- Diretório raiz: `/`
- Build command: vazio
- Build output directory: `/`

O painel Pages CMS é um serviço externo integrado ao GitHub. O proprietário precisa entrar com GitHub e autorizar o aplicativo para o repositório. A conta GitHub é o controle de acesso para editar os arquivos.
