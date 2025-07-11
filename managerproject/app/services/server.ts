import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
