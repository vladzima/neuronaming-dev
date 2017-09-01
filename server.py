#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import flask
from flask import Flask, request
import json
from subprocess import check_output
import shelve
import logging
from logging.handlers import RotatingFileHandler

SHELVE_STORAGE = '/home/neuronaming/site/storage.dat'

app = Flask(__name__)

file_handler = RotatingFileHandler('/var/log/wsgi/server.log', 'a', 1 * 1024 * 1024, 10)
file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
app.logger.setLevel(logging.INFO)
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.info('server startup')

@app.route("/api01/get_names_counter", methods=['GET'])
def get_names_counter():
    sh = shelve.open(SHELVE_STORAGE)
    data = {'total': sh['total']}
    sh.close()
    return flask.Response(status = 200, mimetype = "application/json", response = json.dumps(data))

@app.route("/api01/generate_names", methods=['GET'])
def generate_names():
    category = request.args.get('category')
    result = check_output(['/home/neuronaming/torch/install/bin/th', '/home/neuronaming/torch/torch-rnn/sample.lua', '-checkpoint', '/home/neuronaming/torch/torch-rnn/cv/'+category+'/checkpoint.t7', '-length', '400', '-gpu', '-1'])
    res = [v.decode('utf-8') for v in result.splitlines() if len(v.strip())][1:11]
    sh = shelve.open(SHELVE_STORAGE)
    sh['total'] += len(res)
    data = {"total": sh['total'], "names": res}
    sh.close()
    return flask.Response(status = 200, mimetype = "application/json", response = json.dumps(data))


if __name__ == "__main__":
    app.run(host='0.0.0.0')
