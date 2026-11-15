# ML Store: arquitetura de conteúdo pelo GitHub

O site público é hospedado no Cloudflare Pages. O Pages CMS grava textos, configurações e imagens no repositório GitHub. O site lê esses arquivos diretamente do GitHub e verifica atualizações automaticamente.

## Endereços

- Site público: https://ml-store-emt.pages.dev/
- Painel administrativo: https://ml-store-emt.pages.dev/admin.html
- Editor Pages CMS: https://app.pagescms.org/

## Como editar

1. Abra o Pages CMS em https://app.pagescms.org/.
2. Entre com GitHub e autorize o repositório `wchagas73-lang/ml-store`.
3. Selecione a branch `main`.
4. Edite **Conteúdo e identidade do site** para trocar textos, contatos e imagens principais.
5. Edite **Fotos da galeria** para administrar a sequência de imagens.
6. Salve. O Pages CMS grava os arquivos no GitHub.
7. O site aberto verifica alterações a cada 10 segundos e atualiza o conteúdo quando encontra uma mudança, sem precisar esperar um novo deploy do Cloudflare Pages.

## Armazenamento de imagens

- As imagens enviadas pelo CMS ficam em `media/images/`.
- O site carrega as imagens diretamente de `raw.githubusercontent.com`.
- Prefira JPG ou WebP otimizados. Evite imagens muito grandes.
- Ao substituir uma imagem, prefira enviar o novo arquivo com nome novo. Assim, o JSON muda e o site detecta a atualização, evitando cache antigo.
- O histórico de commits do GitHub guarda versões anteriores.

## Serviços que não são necessários neste projeto

- Cloudflare D1
- Cloudflare R2
- Banco de dados próprio
- Segredos de login administrativo no Pages

O Pages CMS é um serviço externo de edição integrado ao GitHub. O acesso ao repositório é autorizado pela conta GitHub. O conteúdo da loja continua armazenado no GitHub.

## Segurança e acesso

O painel administrativo apenas encaminha o proprietário ao Pages CMS. Quem pode alterar o conteúdo é controlado pelas permissões da conta GitHub autorizada no repositório. Não compartilhe tokens, senhas ou códigos de autenticação.
