const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
const Person = require('./models/person')


app.use(express.static('build'))
app.use(cors())
app.use(express.json())


morgan.token('content', (req, res) => JSON.stringify(req.body))

app.use(morgan(function (tokens, req, res) {
	if (tokens.method(req, res) === 'POST') {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'), '-',
			tokens['response-time'](req, res), 'ms',
			tokens['content'](req, res)
		].join(' ')
	} else {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'), '-',
			tokens['response-time'](req, res), 'ms'
		].join(' ')
	}
}))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/info', (request, response) => {
	response.send(`
		<p>Phonebook has info for ${persons.length} people</p>
		<p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(p => p.id === id)

	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	Person.findByIdAndDelete(request.params.id, function (err) {
		if(err) {
			console.log(err);
			response.status(404).end()
		}
		console.log("Successful deletion");
		response.status(204).end()
	})
})

const generateId = () => {
	var newId = Math.floor((Math.random() * 100) + 1);
	return (newId)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
	const personName = body.name
	const personNumber = body.number

  if (!personName) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  } else if (!personNumber) {
		return response.status(400).json({
			error: 'number missing'
		})
	} else if (persons.find(p => p.name === personName)) {
		return response.status(400).json({
			error: 'name must be unique'
		})
	}

	let newId = generateId()
	while (persons.find(p => p.id === newId))
		newId = generateId()

  const newPerson = {
    name: personName,
    number: personNumber,
    id: newId,
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})