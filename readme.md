# MERN Stack Portfolio Website

## Prerequisites
Before starting the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

## Getting Started
### 1. Set Up the Frontend
Run the following commands to set up the React frontend:

```sh
npx create-react-app frontend
cd frontend
```

### 2. Install Dependencies
Install the required dependencies:

```sh
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
npm install babel-loader@8.1.0 webpack@4.42.0
npm install react-typed
npm install @coreui/icons-react @coreui/icons --save
npm install react-pdf
npm install react-countup
npm install framer-motion
npm install axios
npm install gh-pages --save-dev
npm install eslint --save-dev
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @testing-library/react @testing-library/user-event
npm install --save-dev intersection-observer
```

### 3. Modify Files

#### Modify `frontend/src/App.js`:
Ensure it includes:
```js
import React from 'react';
```

#### Modify `frontend/package.json`:
Update the `scripts` section:
```json
"scripts": {
  "start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start",
  ...
}
```

### 4. Set Up Git Ignore
Run the following command to ignore `node_modules/`:
```sh
echo "node_modules/" >> .gitignore
```

### 5. Configure Git
Ensure Git handles line endings correctly:
```sh
git config --global core.autocrlf false
```

## Next Steps
- Start the development server: `npm start`
- Begin building your portfolio website!


## Create Backend
```sh
mkdir backend
cd backend
npm init
```


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

npm install @coreui/icons-react @coreui/icons --save

npm install react-pdf

npm install react-countup

npm install framer-motion

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