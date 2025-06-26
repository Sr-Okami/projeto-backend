# Projeto Backend

Este é um backend em Node.js para um sistema de produtos, categorias e usuários, utilizando Express, Sequelize e MySQL.

## Estrutura de Pastas

```
src/
│
├── app.js
├── server.js
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── authController.js
│   ├── CategoryController.js
│   ├── productController.js
│   └── UserController.js
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── Category.js
│   ├── index.js
│   ├── Product.js
│   ├── ProductCategory.js
│   ├── ProductImage.js
│   ├── ProductOption.js
│   └── User.js
│
└── routes/
    ├── categoryRoutes.js
    ├── productRoutes.js
    └── userRoutes.js
```

## Principais Módulos Usados

- **express**: Framework web para Node.js
- **sequelize**: ORM para banco de dados relacional
- **mysql2**: Driver MySQL para Node.js
- **dotenv**: Carrega variáveis de ambiente de um arquivo `.env`
- **bcrypt**: Hash de senhas
- **jsonwebtoken**: Autenticação via JWT
- **nodemon**: Reinicia o servidor automaticamente em desenvolvimento

## Como rodar

1. Instale as dependências:
   ```sh
   npm install
   ```

2. Configure o arquivo `.env` com as variáveis do banco de dados.

3. Inicie o servidor:
   ```sh
   npm run dev
   ```

Acesse `http://localhost:3000/` para testar a API.

## Equipe

- Matheus de Sousa Nascimento - [GitHub](https://github.com/Sr-Okami)
- Jéssica Oliveira da Costa Lima - [GitHub](https://github.com/Jessica-dev21)
- Ana Lucia de Mendonça Estima - [GitHub](https://github.com/anaestima)