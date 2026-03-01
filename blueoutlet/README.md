# 👟 Freitas Outlet

> O **Freitas Outlet** é uma plataforma de e-commerce moderna e responsiva, desenvolvida especialmente para a venda de sapatos. O projeto oferece uma experiência de compra fluida para o cliente e ferramentas completas de gestão para o administrador.

## 📋 Funcionalidades

* **Autenticação de Usuários:** Sistema completo de login e cadastro seguro.
* **Carrinho de Compras:** Adição, remoção e atualização de quantidade de produtos no carrinho de forma dinâmica.
* **Checkout e Pagamento:** Integração direta com a API do **Mercado Pago**, garantindo transações seguras e rápidas.
* **Painel de Administração (Dashboard):** Área restrita para gerenciamento de produtos, pedidos e controle de estoque.
* **Catálogo de Produtos:** Exibição de sapatos com imagens, descrições, tamanhos e preços.

## 💻 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna e robusta (Full Stack no Next.js):

**Front-end & Back-end:**
* [Next.js](https://nextjs.org/) (React framework para SSR/SSG e API Routes)
* [TypeScript](https://www.typescriptlang.org/) (Tipagem estática para maior segurança do código)
* [Tailwind CSS](https://tailwindcss.com/) (Estilização utilitária e design responsivo)
* [Node.js](https://nodejs.org/) (Ambiente de execução)

**Banco de Dados & ORM:**
* [PostgreSQL](https://www.postgresql.org/) (Banco de dados relacional)
* [Prisma ORM](https://www.prisma.io/) (Modelagem do banco e consultas ao PostgreSQL)

**Serviços Externos:**
* [API Mercado Pago](https://www.mercadopago.com.br/developers) (Processamento de pagamentos)

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina as seguintes ferramentas:
* [Node.js](https://nodejs.org/en/) (versão 18 ou superior recomendada)
* Um servidor **PostgreSQL** rodando (localmente ou em nuvem).

### Configuração das Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto.
2. Adicione as variáveis necessárias (use o `.env.example` como base, se houver). Você precisará, no mínimo, das seguintes chaves:

```env
# Conexão com o Banco de Dados (PostgreSQL)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/freitas_outlet?schema=public"

# Credenciais do Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="seu_access_token_aqui"