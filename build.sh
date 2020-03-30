#!/usr/bin/env bash
pip install -r backend/requirements.txt
cd frontend/web 
npm install
npm run build
cd ../..
python backend/manage.py migrate
python backend/manage.py collectstatic
