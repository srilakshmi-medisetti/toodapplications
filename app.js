const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running  at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error:${error.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}
const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const hasCategoryAndstatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}
const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}
const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}
const outPutResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  }
}
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodoQuery = ''
  const {search_q = '', priority, status, category} = request.query
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `SEELCT * FROM todo WHERE status="${status}" AND priority="${priority}";`
          data = await database.all(getTodoQuery)
          response.send(data.map(eachItem => outPutResult(eachItem)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.send(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryAndstatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status == 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE category="${category} and status="${status}";`
          data = await database.all(getTodoQuery)
          response.send(data.map(eachItem => outPutResult(eachItem)))
        } else {
          response.send(400)
          response.send('Invalid Todo Status')
        }
        response.send(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryAndPriority(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (priority == 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
          getTodoQuery = `SELECT * FROM todo WHERE category="${category} and priority="${priority}";`
          data = await database.all(getTodoQuery)
          response.send(data.map(eachItem => outPutResult(eachItem)))
        } else {
          response.send(400)
          response.send('Invalid Todo Priority')
        }
        response.send(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriorityProperty(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodoQuery = `SELECT * FROM todo WHERE priority ="${priority}";`
        data = await database.all(getTodoQuery)
        response.send(data.map(eachItem => outPutResult(eachItem)))
      } else {
        response.send(400)
        response.send('Invalid Todo Priority')
      }
      break

    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodoQuery = `SELECT * FROM todo WHERE status ="${status}";`
        data = await database.all(getTodoQuery)
        response.send(data.map(eachItem => outPutResult(eachItem)))
      } else {
        response.send(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasSearchProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%"`
      data = await database.all(getTodoQuery)
      response.sen(data.map(eachItem => outPutResult(eachItem)))
      break

    case hasCategoryProperty(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodoQuery = `SELECT * FROM todo WHERE category="${category}";`
        data = await database.all(getTodoQuery)
        response.send(data.map(eachItem => outPutResult(eachItem)))
      } else {
        response.send(400)
        response.send('Invalid Todo Category')
      }
      break
    default:
      getTodoQuery = `SELECT * from todo;`
      data = await database.all(getTodoQuery)
      response.send(data.map(eachItem => outPutResult(eachItem)))
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `SELECT * from todo where id="${todoId}";`
  const responseResult = await database.get(getTodoQuery)
  response.send(outPutResult(responseResult))
})
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isMatch, 'yyyy-MM-dd')
  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    console.log(newDate)
    const requestquery = `SELECT * FROM  todo WHERE due_date=${newDate}`
    const responseResult = await database.all(requestquery)
    console.log(responseResult)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postNewDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const postTodoQuery = `INSERT INTO todo (id,todo,category,priority,status,due_date) VALUES ("${id}","${todo}","${category}",
                    "${priority}","${status}","${postNewDate}");`
          await database.run(postTodoQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  console.log(requestBody)
  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`
  const previousTodo = await database.get(previousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body
  let updateTodoQuery
  switch (true) {
    case requestBody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        updateTodoQuery = `UPDATE todo SET todo="${todo}",status="${status}",category="${category}", due_date="${dueDate}" WHERE id="${todoId};`
        await database.run('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
        updateTodoQuery = `UPDATE todo SET todo="${todo}",priority="${priority}",status="${status}",category="${category}",`
        await database.run(updateTodoQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo="${todo}",priority="${priority}",status="${status}",category="${category}", due_date="${dueDate}" WHERE id="${todoId}"`
      await database.run(updateTodoQuery)
      response.send('Todo Updated')
      break

    case requestBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateTodoQuery = `UPDATE todo SET todo="${todo}",priority="${priority}",status="${status}",category="${category}", due_date="${dueDate}" WHERE id="${todoId}"`
        await database.run(updateTodoQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const newDate = format(new Date(dueDate), 'yyyy-MM-dd')
        updateTodoQuery = `UPDATE todo SET todo="${todo}",priority="${priority}",status="${status}",category="${category}", due_date="${dueDate}" WHERE id="${todoId}"`
        await database.run(updateTodoQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId}`
  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
