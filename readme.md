MERN Stack Portfolio Website

To begin run command:

npx create-react-app frontend

cd .\frontend\

npm install react@18 react-dom@18

npm install --save-dev cross-env

npm install web-vitals --save

Then modify the frontend/src/App.js:
import React from 'react';

Also modify frontend/package.json:
 "scripts": {
    "start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start",
    .
    .
    .
  },

echo "node_modules/" >> .gitignore

git config --global core.autocrlf false