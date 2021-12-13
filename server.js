'use strict';

const instana = require('@instana/collector')();

const express = require('express');
const namespace = require('./namespace');
const requestContext = require('./request-context');

const app = express();

function handler(req, res) {
    const instanaSpan = instana.sdk.getAsyncContext()?.['com.instana.entry']?.t ?? 'unknown';
    const requestId = namespace.active ? namespace.get('id') : 'unknown';
    
    return res.json({
        body: req.body,
        instana: instanaSpan,
        local: requestId,
    });
}

app.use(requestContext());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handler);

app.listen(3000);
