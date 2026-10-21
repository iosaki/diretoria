# Lista de interesse da loja

O site é estático, então este Apps Script faz a ponte com a planilha. O arquivo `Code.gs` grava as respostas em uma aba privada e disponibiliza somente totais agregados por produto para o site.

## Configurar a planilha

1. Abra a planilha `1KjiRWh4wcoZfS4Frw5pPO2qxhyvA71-5trClqA1-jgk`.
2. Acesse **Extensões → Apps Script**.
3. Substitua o conteúdo de `Code.gs` pelo arquivo deste diretório e salve.
4. Selecione `setup` no menu de funções e clique em **Executar**. Na primeira execução, autorize o acesso à planilha.
5. Na aba **Metas da loja**, preencha a coluna B com o mínimo de fabricação de cada produto. O número fica editável diretamente na planilha.
6. Em **Implantar → Nova implantação**, selecione **App da Web**. Configure **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**; implante e autorize.
7. Copie a URL terminada em `/exec` e insira-a em `INTEREST_ENDPOINT`, no fim de `loja/index.html`, no lugar de `CONFIGURE_APPS_SCRIPT_WEB_APP_URL`.

Se o App da Web já estiver implantado, ao atualizar `Code.gs` use **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**. A URL `/exec` existente permanece a mesma.

Ao executar `setup()` novamente, o script adiciona o cabeçalho **Nome na camisa** na coluna G da aba **Lista de interesse**, preservando as linhas existentes. O nome de personalização é obrigatório nos mantos e não é solicitado para os demais itens.

A aba **Lista de interesse** contém nome e WhatsApp; mantenha a planilha restrita à equipe. A página pública recebe apenas total de pessoas, unidades e mínimo de cada produto. Para contabilizar uma pessoa uma vez por produto, a planilha agrupa pelo WhatsApp normalizado; quantidades de envios diferentes são somadas.

## Observação sobre a publicação

Cada alteração no código do Apps Script exige atualizar a implantação do App da Web. A implantação pública é necessária para permitir que visitantes enviem o formulário e consultem os números agregados.
