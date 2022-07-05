import './App.scss';
import Todo from './components/todo/todo';
import Login from './components/login/login';

// import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
// import awsExports from './aws-exports';

// Amplify.configure(awsExports);

function App() {
  return (
    <div className="App">
      <div>
        <Login>
          <Todo />
        </Login>
      </div>
    </div>
  );
}

export default App;
