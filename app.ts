import express from 'express'
import { pool } from './db'

async function startServer () {
  const app = express()
  const connection = await pool.connect()

  app.use(express.json())

  app
    .post('/pogs', async (request, response) => {
      try {
        const { name, ticker_symbol, price, color } = request.body
        const newPogs = await pool.query(
          'INSERT INTO pogs (name, ticker_symbol, price, color) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, ticker_symbol, price, color]
        )
        response.json(newPogs.rows)
      } catch (err) {
        console.log('error', err)
        response.status(500).json({ error: 'failed to add pogs' })
      }
    })
    .get('/pogs', async (_, response) => {
      try {
        const result = await connection.query('SELECT * FROM pogs')
        response.status(200).json(result.rows)
      } catch (err) {
        console.log('error', err)
        response.status(404).send('Not  Found')
      }
    })
    .get('/pogs/:id', async (request, response) => {
      try {
        const id = request.params.id
        const result = await connection.query(
          'SELECT * FROM pogs WHERE id = $1',
          [id]
        )
        response.status(200).json(result.rows)
      } catch (err) {
        console.log('error', err)
        response.status(404).send('Not found')
      }
    })
    .put('/pogs/:id', async (request, response) => {
      try {
        const { name, ticker_symbol, price, color } = request.body
        const result = await connection.query(
          'UPDATE pogs SET name = $1, ticker_symbol = $2, price = $3, color = $4 WHERE id = $5 RETURNING *',
          [name, ticker_symbol, price, color, request.params.id]
        )
        response.status(200).json(result.rows)
      } catch (err) {
        console.log('error', err)
        response.status(404).send('not found')
      }
    })
    .delete('/pogs/:id', async (request, response) => {
      try {
        const result = await connection.query(
          'DELETE FROM pogs WHERE id = $1 RETURNING *',
          [request.params.id]
        )
        response.status(200).json(result.rows)
      } catch (err) {
        console.log('error', err)
        response.status(404).send('Not found')
      }
    })
    .use(express.static('frontend'))
    .listen(3000, () => {
      console.log('carlo mbappe http://localhost:3000')
    })
}
startServer()
