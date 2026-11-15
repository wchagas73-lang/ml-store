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
6. Salve as alterações no CMS. O site consulta os arquivos do GitHub automaticamente e verifica mudanças a cada 10 segundos.

## Armazenamento e atualização

- O conteúdo fica nos arquivos `data/site.json` e `data/gallery.json`.
- As imagens enviadas pelo CMS ficam em `media/images/`.
- O Cloudflare Pages hospeda a estrutura e os arquivos estáticos do site.
- O navegador busca textos, galeria e imagens diretamente do GitHub.
- A página atualiza automaticamente quando detecta alterações nos arquivos de conteúdo, sem depender da conclusão de um novo deploy para mostrar as mudanças.
- Não são necessários D1, R2, banco de dados próprio ou serviços pagos adicionais nesta arquitetura.

## Configuração de hospedagem

Para o projeto Cloudflare Pages existente:
- Repositório: `wchagas73-lang/ml-store`
- Branch de produção: `main`
- Diretório raiz: `/`
- Build command: vazio
- Build output directory: `/`

O Pages CMS é integrado ao GitHub. O proprietário precisa entrar com GitHub e autorizar o aplicativo para o repositório. A conta GitHub controla quem pode editar os arquivos.

## Observação sobre imagens

Ao substituir uma imagem, prefira enviar o novo arquivo com um nome novo. Assim, a referência da imagem muda no arquivo JSON e o site identifica a atualização, evitando que o navegador reutilize uma versão antiga em cache.
