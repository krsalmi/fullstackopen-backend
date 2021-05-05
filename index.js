const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
const Person = require('./models/person')


app.use(express.static('build'))
app.use(cors())
app.use(express.json())

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
		if (error.kind === 'unique') {
			return response.status(400).send({ error: 'name must be unique' })
		} else if (error.path === 'name' && error.kind === 'minlength') {
				return response.status(400).send({ error: 'name must be at least 3 characters long' })
		} else if (error.path === 'number' && error.kind === 'minlength') {
			return response.status(400).send({ error: 'number must be at least 8 numbers long' })
		}
	}

  next(error)
}

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

app.get('/info', (request, response) => {
	Person.find().count(function(err, count){
    console.log("Number of docs: ", count )
		console.log("error: ", err)
		response.send(`
		<p>Phonebook has info for ${count} people</p>
		<p>${new Date()}</p>`)
	})
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
	}

  const newPerson = new Person({
    name: personName,
    number: personNumber,
  })
	newPerson.save()
		.then(savedPerson => savedPerson.toJSON())
		.then(savedAndFormattedPerson => {
				response.json(savedAndFormattedPerson)
		})
		.catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const human = {
		name: body.name,
		number: body.number,
	}
	Person.findByIdAndUpdate(request.params.id, human, {new: true})
	.then(updatedHuman => {
		response.json(updatedHuman)
	})
	.catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})