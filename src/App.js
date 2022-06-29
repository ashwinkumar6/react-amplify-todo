import './App.scss';
import Todo from './components/todo.js'

import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

function App({ signOut, user }) {
  return (
    <div className="App">
      <div>
        <Todo />
      </div>

      <div>
        <h1>Hello {user.username}</h1>
        <button onClick={() => {
          signOut();
          Amplify.DataStore.clear();
        }}>
          sign out
        </button>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
