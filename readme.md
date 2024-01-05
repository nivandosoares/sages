# Sumário

1. **Disclaimer**
   - Sobre o sistema de agendamento desenvolvido para o Grupo Cometa de Educação.
2. **Features**
   - Controle de Usuários no Dashboard.
   - Automatização com Notificações Via E-mail.
   - Calendário Interativo com Função de Impressão.
3. **Configuração**
   - Variáveis de Ambiente.
   - Mail list.json.
   - Criando super usuários.
   - Instalação.
4. **Preview**
   - Link para uma visualização prévia do sistema atualmente em uso: [sagesagenda.com](https://sagesagenda.com/).



# Disclaimer

Este é um sistema de agendamento desenvolvido para o [Grupo Cometa de Educação](https://www.colegiocometa.com.br/). O sistema permite o agendamento de eventos para o auditório do grupo, que é compartilhado por diferentes instituições de ensino, o sistema automatiza a solicitação e atualiza automaticamente os responsáveis via e-mail usando o pacote [nodemailer](https://www.npmjs.com/package/nodemailer) e um servidor SMTP Brevo [consulte a documentação aqui](https://www.brevo.com/pt/), além de disponibilizar um dashboard com controle de usuários para aprovação de solicitações e é construído usando Node JS, Express JS, MongoDB e EJS como view engine. 

O frontend da aplicação usa também [Ajax](https://api.jquery.com/jQuery.ajax/),  [Bootstrap](https://getbootstrap.com/) e a lib [Full Calendar](https://fullcalendar.io/)

## Novas Features

### 1. Controle de Usuários no Dashboard

O sistema conta com um dashboard que permite a usuários administradores recusar ou aceitar eventos 

### 2. Automatização com Notificações Via E-mail

O sistema envia automaticamente e-mails informativos para os responsáveis pelos institutos e cursos, mantendo-os informados sobre as novas solicitações e status de aprovação.

### 3. Calendário Interativo com Função de Impressão

Os usuários podem interagir de forma intuitiva com o calendário, visualizando eventos, datas disponíveis e ocupadas. 

## Configuração

Antes de começar, certifique-se de ter as seguintes informações e variáveis de ambiente configuradas.

### Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e configure as suas variáveis de ambiente, lembre de verificar os dados do seu servidor SMTP com seu provedor e do seu banco de dados [MongoDB](https://www.mongodb.com/pt-br):

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.example.com/DatabaseName?retryWrites=true&w=majority
SMTP_PASS=your_smtp_password
SMTP_HOST=smtp.example.com
SMTP_PORT=1234
SMTP_USER=your_email@example.com
SMTP_SENDER=sender_email@example.com
JWT_SECRET=your_jwt_secret
BASE_URL=www.example.com
```

### Mail list.json

O `mail_list.json` está na pasta `controller`e é responsável por popular os institutos e cursos do formulário de solicitação, o arquivo deve apontar os coordenadores responsáveis que serão contatados e podem aprovar/recusar solicitações, exemplo:

```json
{
  "institutes": [
    {
      "name": "Institute A",
      "teachers": [
        {
          "name": "Teacher A",
          "email": "teacherA@example.com"
        },
        {
          "name": "Teacher B",
          "email": "teacherB@example.com"
        }
      ]
    },
    {
      "name": "Institute B",
      "teachers": [
        {
          "name": "Teacher C",
          "email": "teacherC@example.com"
        },
        {
          "name": "Teacher D",
          "email": "teacherD@example.com"
        }
      ]
    }
  ]
}
```

### Criando super usuários

O sistema pode gerar super usuários automaticamente usando como base o arquivo `mail_list.json`  para criar usuários e senhas padrão, isso simplifica a determinação de hierarquia uma vez que supõe-se que coordenadores podem aprovar ou não eventos no espaço, as seguintes funções estão em `user_controller.js`, para isso basta executar uma requisição POST na rota `/first-run` e a função `createAdminUsers()`será executada para inserir os usuários no banco de dados. 

```javascript
const createAdminUsers = async (req, res) => {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, "mail_list.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);

    // Iterate over institutes and courses to insert users
    for (const institute of data.institutes) {
      for (const course of institute.courses) {
        const username = course.coordinator.toLowerCase().replace(" ", ""); // Extract the username as specified
        const email = course.coordinatorEmail;
        const password = `${course.coordinator.split(" ")[0].toLowerCase()}.coordenacao`; // Generate the password

        try {
          // Create the user in the database
          const user = await User.create({
            username,
            role: "admin",
            email,
            password: bcrypt.hashSync(password, 10),
          });

          // Optionally, you can generate a token here and do something with it
          const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
          );

          // Output success message or do further processing if needed
          console.log(`User created: ${user.username}`);
        } catch (error) {
          // If it's a duplicate key error, log a message and continue with the next iteration
          if (error.code === 11000) {
            console.warn(`Duplicate key error for email: ${email}. Skipping...`);
            continue;
          }

          // If it's a different error, log the error
          console.error("Error inserting user:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error inserting users from JSON:", error);
  }
};

```

### Para instalar basta clonar o repositório e instalar as dependências com 

``npm install -y``



Caso queira ver uma preview visite o [sistema atualmente em uso](https://sagesagenda.com/) 
