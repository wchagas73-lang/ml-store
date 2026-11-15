# ML Store: arquitetura de conteúdo pelo GitHub

O site público é hospedado no Cloudflare Pages. O conteúdo editável e as imagens ficam no próprio repositório GitHub.

## Como editar

1. Abra o painel em https://ml-store-emt.pages.dev/admin.html.
2. Acesse o Pages CMS em https://app.pagescms.org/.
3. Entre com GitHub e autorize o repositório `wchagas73-lang/ml-store`.
4. Selecione a branch `main`.
5. Edite o arquivo **Conteúdo e identidade do site** para trocar textos, contatos e imagens principais.
6. Edite **Fotos da galeria** para administrar a sequência de imagens.
7. Salve. O Pages CMS grava os arquivos no GitHub. A integração Git do Cloudflare Pages publica o novo conteúdo após o commit.

## Armazenamento de imagens

- As imagens enviadas pelo CMS ficam em `media/images/`.
- O site as utiliza por caminhos públicos `/media/images/...`.
- Prefira JPG ou WebP otimizados. Evite imagens muito grandes.
- Como os arquivos ficam no Git, o histórico de commits também guarda versões anteriores. Remova arquivos que não são mais necessários quando for seguro fazê-lo.

## Serviços que não são necessários neste projeto

- Cloudflare D1
- Cloudflare R2
- Banco de dados próprio
- Segredos de login administrativo no Pages

O Pages CMS é um serviço externo de edição integrado ao GitHub. O acesso ao repositório é autorizado pela conta GitHub. O conteúdo da loja continua armazenado no GitHub.

## Importante

O primeiro acesso ao Pages CMS ainda exige que o proprietário entre com GitHub e autorize o aplicativo no repositório. Não compartilhe tokens, senhas ou códigos de autenticação. O site público permanece independente do painel e continua sendo servido pelo Cloudflare Pages.
