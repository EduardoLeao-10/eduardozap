criado dia 18/09/2026 as 09:38hs

Criar o projeto Expo:
npx create-expo-app EduardoZap --template blank-typescript


app/_layout.tsx
app/login.tsx
app/register.tsx
app/profile.tsx
app/chatId.tsx
app/profile.tsx
app/index.tsx

src/components/
src/services/firebase.ts
src/services/auth.ts 
src/services/database.ts
src/services/presence.ts
contexts/AuthContext.tsx
package.json 
google-services.json
app.json


ANOTACOES.md
Diário do Projeto - [29/12/2025]
15/12/2025   celular Android gerando o APK 
npx expo run:android

isso e o deploy do vercel
vercel --prod

plataforma web  gerando o APK 
npx expo start --web


Acesse este link direto: https://www.mercadopago.com.br/developers/panel/applications

Credenciais de produção
Access Token
APP_USR-2110883807577000-121510-545532fcb9dd9fcbbdc8b1759281ad54-141082339

Bom dia react native typescript o meu projeto somente para plataforma web e android expo router 

Passo 6 - Build para produção (APK)

eas build --platform android --profile production



25/09/2026
 Como ativar o reCAPTCHA Enterprise (Passo a Passo)
A interface do Google Cloud pode ser confusa, então vou te guiar pelo caminho exato.

1. Ative a API do reCAPTCHA Enterprise

Acesse o Console do Google Cloud.

No topo da página, certifique-se de que o projeto selecionado é o eduardozap.

Na barra de pesquisa superior, digite "reCAPTCHA Enterprise API" e clique no resultado.

Na página da API, clique no botão "Ativar" (Enable). Se já estiver ativada, não precisa fazer nada.



2. Crie uma chave do reCAPTCHA para Web

Ainda no Console do Google Cloud, na barra de pesquisa, digite "reCAPTCHA" e selecione a página "reCAPTCHA" (em Segurança).

Clique em "Criar chave" (Create Key).

Preencha:

Nome de exibição: EduardoZap Web (ou qualquer nome).

Tipo de plataforma: Selecione "Websites".

Domínios: Adicione o domínio onde o app web está rodando (ex: localhost para desenvolvimento, e depois o domínio real quando publicar).

Clique em "Criar". O Google vai gerar uma chave do site (site key). Copie essa chave, você vai precisar dela. 



3. Configure a chave no Firebase Console

Acesse o Console do Firebase e entre no projeto eduardozap.

No menu lateral, vá em Authentication → aba Sign-in method.

Clique em Telefone (que já está ativado).

Role a página até a seção "Proteção contra abuso" (ou "reCAPTCHA").

Selecione a opção "reCAPTCHA Enterprise" e cole a chave do site que você criou no passo anterior.

Salve.




 Passo a Passo Definitivo para Criar a Chave
1. Acesse a página do reCAPTCHA diretamente

No seu navegador, estando logado na mesma conta do Google Cloud, cole este endereço:

text
https://console.cloud.google.com/security/recaptcha
Por que isso resolve? Esse é o link direto para a página de gerenciamento de chaves do reCAPTCHA. Ele ignora a navegação pelo menu lateral, que muitas vezes esconde a opção "Segurança" ou "Fraud Defense".

2. Verifique se o projeto correto está selecionado

No topo da página, ao lado do logotipo do Google Cloud, confirme se o seletor de projeto está mostrando eduardozap. Se não estiver, clique nele e selecione o projeto correto.

3. Crie a chave

Na página do reCAPTCHA, você verá um botão azul chamado "Criar chave" (ou "Create Key"). Clique nele.

4. Preencha os dados da chave

Uma nova tela será aberta. Preencha os campos exatamente assim:

Campo	O que colocar
Nome de exibição	EduardoZap Web (ou qualquer nome que você queira)
Tipo de plataforma	Selecione "Websites" (ou "Web")
Domínios	Adicione um domínio de cada vez. Clique em "Adicionar um domínio" e digite:
• localhost (para testes no seu computador)
• Depois, quando publicar, adicione o domínio real do site.
5. Finalize a criação

Clique no botão "Criar chave" no final da página.

6. Copie a chave gerada

Após criar, o Google vai gerar uma chave do site (site key). Ela aparecerá na lista de chaves. Copie essa chave, pois você vai precisar dela para o próximo passo: configurá-la no console do Firebase.



4. Preencha os dados da chave

Uma nova tela será aberta. Preencha os campos exatamente assim:

Campo	O que colocar
Nome de exibição	EduardoZap Web (ou qualquer nome que você queira)
Tipo de plataforma	Selecione "Websites" (ou "Web")
Domínios	Adicione um domínio de cada vez. Clique em "Adicionar um domínio" e digite:
• localhost (para testes no seu computador)
• Depois, quando publicar, adicione o domínio real do site.
5. Finalize a criação

Clique no botão "Criar chave" no final da página.
O que vai acontecer depois de clicar em "Concluir"
O Google vai criar a chave e te levar para uma tela de resumo.

Nessa tela, você verá um código chamado "ID da chave" (ou "Chave do site"). Ele começa com 6L... e é uma sequência longa de letras e números.

Copie esse código. Ele é a sua "chave do site" (Site Key).

⚠️ Importante: Não confunda com a "Chave secreta" (Secret Key). Você só precisa do ID da chave (Site Key) para o Firebase.


EduardoZap  
Id da chave criada
ID: 6Legc84tAAAAAKrmzFB2h13yK6olVSGr69CLnlSg

Adicionar reCAPTCHA ao seu site
Adicionar reCAPTCHA a formulários e ações que você quer proteger.
Carregue a API JavaScript com a chave.
<head>
  <script src="https://www.google.com/recaptcha/enterprise.js?render=6Legc84tAAAAAKrmzFB2h13yK6olVSGr69CLnlSg"></script>
  <!-- Your code -->
</head>

Chame grecaptcha.execute para cada ação que você quer proteger.
<script>
  function onClick(e) {
    e.preventDefault();
    grecaptcha.enterprise.ready(async () => {
      const token = await grecaptcha.enterprise.execute('6Legc84tAAAAAKrmzFB2h13yK6olVSGr69CLnlSg', {action: 'LOGIN'});
    });
  }
</script>


Crie o corpo da solicitação e salve em um arquivo chamado request.json. Faça as seguintes substituições:

TOKEN: O token retornado da chamada grecaptcha.enterprise.execute().
USER_ACTION: Opcional. A ação iniciada pelo usuário especificada na chamada grecaptcha.enterprise.execute(). Learn more about actions .
{
  "event": {
    "token": "TOKEN",
    "expectedAction": "USER_ACTION",
    "siteKey": "6Legc84tAAAAAKrmzFB2h13yK6olVSGr69CLnlSg",
  }
}

Envie uma solicitação POST HTTP com os dados JSON salvos para o URL a seguir. Faça as seguintes substituições:

API_KEY: A chave de API associada ao projeto atual. Learn more about authenticating with API keys .
Envie uma solicitação POST HTTP com os dados JSON salvos para o URL a seguir. Faça as seguintes substituições:

API_KEY: A chave de API associada ao projeto atual. Learn more about authenticating with API keys .

Depois de Criar, Verifique o SHA-256
Com o keystore criado, rode:
isso e para a chave do android

keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android




Baixar o novo google-services.json
Como você adicionou o SHA-256, o arquivo mudou.

Ainda em Configurações do projeto → Seus apps → app Android.

Clique em "Baixar google-services.json".

Substitua o arquivo antigo na raiz do projeto C:\Visual Studio\EduardoZap\ pelo novo.



Rebuild do App Android
Como o google-services.json mudou, precisa reconstruir:

npx expo prebuild --clean
npx expo run:android

29/09/2026

precisa rodar prebuild só por causa disso — o scheme é lido em tempo de build, então na próxima vez que você rodar npx expo run:android, ele já será aplicado.

Mas se quiser garantir, rode:

npx expo prebuild --clean
npx expo run:android


09/10/2026
Quando você instala o pacote firebase via npm/yarn, ele te dá acesso a várias funções prontas. As funções getAuth e getDatabase são funções oficiais da biblioteca Firebase.

getAuth(app): É uma função que "pega" o serviço de autenticação do Firebase e o conecta ao seu aplicativo (app).

getDatabase(app): É uma função que "pega" o serviço de banco de dados Realtime Database e o conecta ao seu aplicativo (app).


dia 16/10/2026
Enviar seu Projeto para o GitHub
A Vercel se integra perfeitamente ao GitHub, então este passo é fundamental para automatizar futuros deploys.

Crie um novo repositório no GitHub:

Acesse github.com/new.

Dê um nome ao seu repositório (ex: eduardozap).

Não inicialize o repositório com README, .gitignore ou licença, pois seu projeto já existe localmente.

Clique em "Create repository".

Envie seu código para o GitHub:

Abra o terminal na pasta raiz do seu projeto (onde está o package.json).


Implantar na Vercel
Agora, a Vercel vai "puxar" seu código do GitHub e publicá-lo na web.

Acesse a Vercel:

Vá para vercel.com e faça login com sua conta do GitHub.

Importe o projeto:

No painel da Vercel, clique em "Add New..." e depois em "Project".

Na seção "Import Git Repository", você verá seu repositório eduardozap. Clique em "Import".

Configure e faça o Deploy:

A Vercel reconhecerá automaticamente as configurações do seu vercel.json.

Verifique se os campos estão assim:

Framework Preset: Other

Build Command: npx expo export --platform web

Output Directory: dist

Install Command: npm install

Clique no botão "Deploy".

Aguarde a conclusão:

A Vercel executará o comando de build e fará o deploy do seu site.

Em alguns minutos, você receberá um link como https://eduardozap.vercel.app. Seu site estará no ar!

💡 Passos Finais e Dicas
Atualizações Automáticas: A grande vantagem deste método é que, toda vez que você fizer um git push para a branch main no GitHub, a Vercel automaticamente iniciará um novo deploy com as alterações.

Domínio Personalizado: Você pode adicionar seu próprio domínio na Vercel (ex: meusite.com), indo em Project Settings > Domains e seguindo as instruções.

Variáveis de Ambiente: Como você está usando o Firebase, é uma boa prática mover as chaves do firebase.ts para variáveis de ambiente na Vercel para não expô-las no código. Você pode fazer isso em Project Settings > Environment Variables.

