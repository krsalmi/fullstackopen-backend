const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

if (process.argv.length === 4) {
	console.log('to view people in phonebook, only give password. to add a new person \
	to phonebook, give password, a name and a number')
	process.exit(1)
}

const password = process.argv[2]


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

 const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
	console.log('phonebook:')
	Person.find({}).then(result => {
		result.forEach(p => {
			console.log(p.name + ' ' + p.number)
		})
		mongoose.connection.close()
	})
} else {
	const newName = process.argv[3]
	const newNumber = process.argv[4]

	const person = new Person({
  name: newName,
  number: newNumber,
})
	person.save().then(response => {
		console.log(`added ${newName} number ${newNumber} to phonebook`)
		mongoose.connection.close()
	})
}

module.exports = mongoose.model('Person', noteSchema)