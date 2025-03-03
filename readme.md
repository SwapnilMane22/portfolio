MERN Stack Portfolio Website

To begin run command:

npx create-react-app frontend

cd .\frontend\

npm install react@18 react-dom@18

npm install react-bootstrap bootstrap@4.6.0

npm install --save-dev cross-env

npm install web-vitals --save

npm install react-icons

npm install react-router-dom

npm i react-router-hash-link

npm install @mui/icons-material

npm install @emotion/react @emotion/styled

npm install uniqid

<!-- npm install --save-dev webpack babel-loader @babel/preset-env --legacy-peer-deps -->

npm install babel-loader@8.1.0 webpack@4.42.0

npm install react-typed

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


  "devDependencies": {
    "@babel/plugin-proposal-optional-chaining": "^7.21.0",
    "@babel/preset-env": "^7.26.9",
    "@babel/preset-react": "^7.26.3",
    "babel-loader": "^10.0.0",
    "cross-env": "^7.0.3",
    "webpack": "^5.98.0"
  }
}


    