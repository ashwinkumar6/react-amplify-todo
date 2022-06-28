import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './aws-exports'

Amplify.configure(awsconfig);
Auth.configure(awsconfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// type Task @model {
//   id: ID!
//   name: String!
//   description: String!
//   date: String!
//   time: String!
//   status: Boolean!
//    author: User! @connection
// }

//  type User @model {
//    id: ID!
//    firstName: String!
//    lastName: String!
//    tasks: [Task]! @connection
//  }
