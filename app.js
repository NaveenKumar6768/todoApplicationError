const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Runnig at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;

  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };
  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodosQuery = `
        SELECT
        *
        FROM 
        todo
        WHERE
        id = ${todoId} ;
    `;

  const todo = await db.get(getTodosQuery);
  response.send(todo);
});

//API 3

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodosQuery = `
        INSERT INTO todo
        (id,todo,priority,status)
        VALUES
        (
            ${id},
            "${todo}",
            "${priority}",
            "${status}"
        ) ;
    `;

  await db.run(addTodosQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, status, priority } = request.body;

  const haveTodo = (requestBody) => {
    return requestBody.todo !== undefined;
  };
  const haveStatus = (requestBody) => {
    return requestBody.status !== undefined;
  };
  const havePriority = (requestBody) => {
    return requestBody.priority !== undefined;
  };
  let updateTodoQuery = null;
  switch (true) {
    case haveTodo(request.body):
      updateTodoQuery = `
        UPDATE todo 
        SET 
        todo = "Some task"
        WHERE 
        id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case haveStatus(request.body):
      updateTodoQuery = `
        UPDATE todo 
        SET 
        status = "DONE"
        WHERE 
        id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
      break;
    case havePriority(request.body):
      updateTodoQuery = `
        UPDATE todo 
        SET 
        priority = "HIGH"
        WHERE 
        id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send("Priority Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `
        DELETE FROM todo 
        WHERE 
        id = ${todoId} ;
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
