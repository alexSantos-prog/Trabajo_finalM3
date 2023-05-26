const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "api_rest",
  password: "postgres",
  port: "54320",
});

// Modelo
class Model {
  async getUsuarios() {
    const { rows } = await pool.query("select * from usuarios;");
    return rows;
  }

  async getUsuarioById(id) {
    const { rows } = await pool.query("select * from usuarios where id = $1;", [id]);
    return rows[0];
  }

  async addUsuario(name) {
    await pool.query("INSERT INTO usuarios (nombre) values ($1);", [name]);
  }

  async updateUsuario(id, name) {
    await pool.query("UPDATE usuarios SET nombre = $1 WHERE id = $2;", [name, id]);
  }

  async deleteUsuario(id) {
    await pool.query("DELETE FROM usuarios WHERE id = $1;", [id]);
  }

  async promedioEdad() {
    const { rows } = await pool.query("SELECT AVG(EXTRACT(YEAR FROM AGE(NOW(),fecha_nacimiento))) AS promedio FROM usuarios;");
    //const inter = Number.toString(promedio.toString);
    return rows[0];
  }
}

//Controlador
class Controller {
  constructor(model) {
    this.model = model;
  }

  async getUsuarios(req, res) {
    const data = await this.model.getUsuarios();
    res.send(data);
  }

  async getUsuarioById(req, res) {
    const id = req.params.id;
    const data = await this.model.getUsuarioById(id);
    res.send(data);
  }

  async addUsuario(req, res) {
    const name = req.body.name;
    await this.model.addUsuario(name);
    res.sendStatus(201);
  }

  async updateUsuario(req, res) {
    const id = req.params.id;
    const name = req.body.name;
    await this.model.updateUsuario(id, name);
    res.sendStatus(200);
  }

  async deleteUsuario(req, res) {
    const id = req.params.id;
    await this.model.deleteUsuario(id);
    res.sendStatus(200);
  }

  async promedioEdad(req, res){
    const data = await this.model.promedioEdad();
    res.send(data);
  }
}

//Instanciación
const model = new Model();
const controller = new Controller(model);

app.use(express.json());

app.get("/usuarios", controller.getUsuarios.bind(controller));
app.get("/usuarios/:id", controller.getUsuarioById.bind(controller));
app.get("/promedio", controller.promedioEdad.bind(controller));
app.post("/usuarios", controller.addUsuario.bind(controller));
app.put("/usuarios/:id", controller.updateUsuario.bind(controller));
app.delete("/usuarios/:id", controller.deleteUsuario.bind(controller));

app.listen(port, () => {
  console.log(`Este servidor se ejecuta en http://localhost:${port}`);
});