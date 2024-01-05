# Disclaimer

Este é um sistema de agendamento desenvolvido para o [Grupo Cometa de Educação](). O sistema permite o agendamento de eventos para o auditório do grupo, que é compartilhado por diferentes instituições de ensino, o sistema automatiza a solicitação e atualiza automaticamente os responsáveis via e-mail usando o pacote [nodemailer]() e um servidor SMTP Brevo [consulte a documentação aqui](), além de disponibilizar um dashboard com controle de usuários para aprovação de solicitações e é construído usando Node JS, Express JS, MongoDB e EJS como view engine. 

O frontend da aplicação usa também [Ajax](),  [Bootstrap]() e a lib [Full Calendar]()

## Configuração

Antes de começar, certifique-se de ter as seguintes informações e variáveis de ambiente configuradas.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis de ambiente, lembre de verificar os dados do seu servidor SMTP com seu provedor e do seu banco de dados [MongoDB]():

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

