# ML Store

Site institucional da ML Store, com identidade visual em preto e dourado.

## Estrutura do site

- Página responsiva para celular e computador.
- Seções de apresentação da marca, manifesto, galeria, coleção, ofertas e contato.
- Textos, identidade visual e imagens principais editáveis pelo Pages CMS.
- Galeria com até 6 imagens.
- Coleção com seleção múltipla de até 10 imagens.
- Vitrine de ofertas com até 5 produtos, cada um com foto e preço opcional.
- Links de Instagram e WhatsApp.

## Como o proprietário edita o site

1. Acesse o endereço publicado e abra **Painel administrativo** no menu, ou entre em `/admin.html`.
2. Clique em **Abrir painel de edição**.
3. Entre no Pages CMS com a conta GitHub autorizada.
4. Abra o repositório `wchagas73-lang/ml-store`, na branch `main`.
5. Use **Conteúdo e identidade do site** para alterar textos, contatos, logo e fotos principais.
6. Use **Fotos da galeria** para adicionar, remover ou reorganizar até 6 imagens.
7. Use **Coleção de dezembro** para selecionar várias imagens no mesmo campo, até 10.
8. Use **Ofertas ML Store** para cadastrar até 5 produtos. Cada produto tem uma foto e um preço opcional.
9. Salve as alterações no CMS.

O site consulta os arquivos de conteúdo no GitHub e verifica atualizações aproximadamente a cada 10 segundos. Para alterações de conteúdo, não é necessário aguardar um novo deploy do Cloudflare Pages.

## Imagens

- Os arquivos enviados pelo CMS ficam em `media/images/`.
- A configuração atual aceita JPG, JPEG, PNG, WebP e AVIF.
- Para substituir uma foto, prefira enviar a nova imagem com um nome de arquivo diferente. Isso evita que o navegador ou a CDN reutilize uma versão antiga em cache.
- Depois de salvar, aguarde a atualização automática. Se necessário, atualize a página.
- Não apague a foto antiga antes de confirmar que a nova imagem aparece corretamente no site.

## Hospedagem e permissões

- Repositório: `wchagas73-lang/ml-store`
- Branch de produção: `main`
- Hospedagem: Cloudflare Pages
- Diretório raiz: `/`
- Comando de build: vazio
- Diretório de saída: `/`
- CMS: Pages CMS integrado ao GitHub

A conta GitHub autorizada controla quem pode editar os arquivos. Não compartilhe senhas nem códigos de autenticação.

## Arquivos principais

- `index.html`: página pública e carregamento dinâmico do conteúdo.
- `admin.html`: instruções de acesso e uso do painel.
- `.pages.yml`: configuração dos campos editáveis no Pages CMS.
- `data/site.json`: textos, contatos e imagens principais.
- `data/gallery.json`: fotos da galeria.
- `data/carousel.json`: fotos da coleção.
- `data/interlude.json`: fotos e preços das ofertas.
- `data/highlights.json`: textos dos cards de destaque.
- `media/images/`: arquivos de imagem.

## Observação técnica

O projeto utiliza arquivos estáticos no GitHub e hospedagem no Cloudflare Pages. Não depende de banco de dados, D1, R2 ou serviços pagos adicionais para o fluxo atual de edição e publicação de conteúdo.
