import express from 'express';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { brandsTable, modelsTable } from './db/schema';
import { eq } from 'drizzle-orm';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());
const port = process.env.PORT;
const db = drizzle(process.env.DB_FILE_NAME!);

app.use(express.json())


app.get('/brands',  async (req ,res) => { 
  const result = await db.select().from(brandsTable);

  res.json(result);
});

app.get('/brands/:id', async (req, res) => { 
  const id = req.params.id 

  if(!id){
    throw new Error('O parâmetro "id" é obrigatório.')
  }

  const result = await db.select().from(brandsTable).where(eq(brandsTable.id, Number(id)));

  if (result.length === 0) {
    throw new Error('Modelo não encontrado.')
  }

  res.json(result[0]);
})

app.post('/brands', async (req, res) => {

  const name = req.body.name
  

  const insert = await db.insert(brandsTable).values({name})

  if(!insert.lastInsertRowid ) {
    throw new Error('Dado não foi inserido')
  }

  const result = await db.select().from(brandsTable).where(eq(brandsTable.id, Number(insert.lastInsertRowid)));
  res.json(result[0])

});

app.put('/brands/:id', async (req, res) => {
  const name = req.body.name
  const id = req.params.id



 const update = await db.update(brandsTable).set({name}).where(eq(brandsTable.id, Number(id)));

  if(!update.rowsAffected ) {
    throw new Error('Dado não foi atualizado')
  }

  const result = await db.select().from(brandsTable).where(eq(brandsTable.id, Number(id)));
  res.json(result[0])

  
});

app.delete('/brands/:id', async (req, res) => {
  const deleteid = req.params.id

  const result = await db.select().from(brandsTable).where(eq(brandsTable.id, Number(deleteid)));

  const deleted = await db.delete(brandsTable).where(eq(brandsTable.id, Number(deleteid)))  

  if (!deleted.rowsAffected) {
    throw new Error('Dado não deletado ')
  }

  res.json(result)
});

app.get('/models', async (req, res) => {
  const result = await db.select().from(modelsTable)

  res.json(result)
})

app.get('/models/:id', async (req, res) => {
  const id = req.params.id 
  
  if(!id) {
    throw new Error('O campo "id" é obrigatório.')
  }
  const result = await db.select().from(modelsTable).where(eq(modelsTable.id, Number(id)));

  if(result.length === 0){
    throw new Error('Modelo não encontrado.')
  }

  res.json(result[0])

})

app.post('/models', async (req, res) => {
  const name = req.body.name
  const brandId = req.body.brandId

  const insert = await db.insert(modelsTable).values({name, brandId})

  if(!insert.lastInsertRowid ) {
    throw new Error('Dado não foi inserido')
  }

  const result = await db.select().from(modelsTable).where(eq(modelsTable.id, Number(insert.lastInsertRowid)));
  res.json(result[0])
})

app.put('/models/:id', async (req, res) => {
  const id = req.params.id;
  const { name, brandId } = req.body;


 const update = await db.update(modelsTable)
 .set({name, brandId}).where(eq(modelsTable.id, Number(id)));

  if(!update.rowsAffected ) {
    throw new Error('Dado não foi atualizado')
  }

  const result = await db.select().from(modelsTable).where(eq(modelsTable.id, Number(id)));
  res.json(result[0])
})

app.delete('/models/:id', async (req, res) => {
  const deleteid = req.params.id

  const result = await db.select().from(modelsTable).where(eq(modelsTable.id, Number(deleteid)));

  const deleted = await db.delete(modelsTable).where(eq(modelsTable.id, Number(deleteid)))  

  if (!deleted.rowsAffected) {
    throw new Error('Dado não deletado ')
  }

  res.json(result)
})

app.listen(port, () => {
  console.log(`App de exemplo esta rodando na porta ${port}`);
});
