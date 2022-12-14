const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Verify if user exists

function checksExistsUserAccount(request, response, next) {
  const{username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({error: "user Not found!"})
  }

  request.user = user;

  next();
}

//Create user
app.post('/users',(request, response) => {
  const{name, username} = request.body;
  
  const userAlreadyExist = users.find(user => user.username === username);

  if(userAlreadyExist){
    return response.status(400).json({error: "user Already Existis!"})
  }

  const newuser = {
    id: uuidv4(), 
    name,
    username,
    todos: []
  }

  users.push(newuser);

  return response.status(201).json(newuser).send();
}); 

//get todos from a user.
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const{user} = request;

  return response.json(user.todos);
});

//create todos for a user passed by params
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const{user} = request;
  const{title, deadline} = request.body;

  const newtodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date
  }

  user.todos.push(newtodo);

  return response.status(201).json(newtodo);
});

//update todos for a user
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const{user} = request;
  const{title, deadline} = request.body;
  const{id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "todo not found!"});
  }

  todo.title = title;
  todo.deadline = deadline;


  return response.json(todo);

});

//update the status "done" for a todo.
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const{user} = request;
  const{id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "todo not found!"});
  }

  todo.done = true;

  return response.json(todo);

});

//delete a todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const{user} = request;
  const{id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "todo not found!"});
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();

});

module.exports = app;