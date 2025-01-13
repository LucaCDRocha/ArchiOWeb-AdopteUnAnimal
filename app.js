import express from "express";
import createError from "http-errors";
import logger from "morgan";
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import * as config from "./config.js";

import mongoose from 'mongoose';
mongoose.connect(config.databaseUrl);

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import petsRouter from "./routes/pets.js";
import spasRouter from "./routes/spas.js";
import adoptionsRouter from "./routes/adoptions.js";
import tagsRouter from "./routes/tags.js";

const app = express();
// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync('./openapi.json'));
// Serve the Swagger UI documentation.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

if (process.env.NODE_ENV !== 'test') {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/pets", petsRouter);
app.use("/spas", spasRouter);
app.use("/adoptions", adoptionsRouter);
app.use("/tags", tagsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
