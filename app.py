import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

rds_connection_string = "root:PASSWORD@localhost/bayareajobs"


engine = create_engine(f'mysql://{rds_connection_string}?charset=utf8')
conn = engine.connect()
df = pd.read_sql_table('bay_jobs',con=conn)
my_dict=df.to_dict('index')
cities = df['city'].unique()
categories = df['job_cat'].unique()
categories.sort()
cities.sort()

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/data")
def names():
    return jsonify(my_dict)


@app.route("/city")
def city_api():
    city_dict = {}
    city_dict['All'] = {
            'titles':[],
            'postings':[]}    
    for cat in categories:
        city_dict['All']['titles'].append(cat)
        city_dict['All']['postings'].append(str(df['comp_name'][(df['job_cat'] == cat)].count()))
    for city in cities:
        city_dict[city] = {
            'titles':[],
            'postings':[]}
        for cat in categories:
            city_dict[city]['titles'].append(cat)
            posts = str(df['comp_name'][(df['city'] == city) & (df['job_cat'] == cat)].count())
            city_dict[city]['postings'].append(posts)
    return jsonify(city_dict)

@app.route("/title")
def title_api():
    title_dict = {}
    for cat in categories:
        title_dict[cat] = {
            'cities':[],
            'postings':[]}
        for city in cities:
            title_dict[cat]['cities'].append(city)
            posts = str(df['comp_name'][(df['city'] == city) & (df['job_cat'] == cat)].count())
            title_dict[cat]['postings'].append(posts)
    return jsonify(title_dict)


if __name__ == "__main__":
    app.run()
