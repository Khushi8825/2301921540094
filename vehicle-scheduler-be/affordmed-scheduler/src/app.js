'use strict';

const express = require('express');

const { requestLogger, errorHandler, notFoundHandler } = require('./middleware/loggingMiddleware');
const schedulerRoutes = require('./routes/schedulerRoutes');
const healthRoutes    = require('./routes/healthRoutes');

const app = express();

// ── Built-in middleware ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── AffordMed request logger (required) ──────────────────────────────────────
app.use(requestLogger);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/',    healthRoutes);
app.use('/api', schedulerRoutes);

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Centralised error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

module.exports = app;
