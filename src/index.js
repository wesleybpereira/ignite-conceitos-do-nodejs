const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({error:'Username not found!'});
  }

  request.username = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username} = request.body;

  const existingUser = users.find(u => u.username === username);

  if(existingUser){
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.status(200).send(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const {title, deadline} = request.body;

  // const userAddToDo = users.find(user => users.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  username.todos.push(todo)

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const todoUpdate = username.todos.find(t => t.id === id);

  if(!todoUpdate) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  todoUpdate.title = title;
  todoUpdate.deadline = new Date(deadline);

  return response.json(todoUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  //const { done } = request.body;
  const { id } = request.params;

  const todoUpdate = username.todos.find(t => t.id === id);

  if(!todoUpdate){
    return response.status(404).json({ error: "Todo not found!" });
  }

  // todoUpdate.done === false ? true : false;
  todoUpdate.done = !todoUpdate.done

  return response.status(201).json(todoUpdate);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const deleteTodo = username.todos.findIndex(t => t.id === id);

  if(deleteTodo === -1) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  username.todos.splice(deleteTodo, 1);

  return response.status(204).send(username.todos);

});

module.exports = app;