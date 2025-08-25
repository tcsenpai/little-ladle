import React from 'react';
import { SimpleMealBuilder } from './components/SimpleMealBuilder';
import { DarkModeProvider } from './contexts/DarkModeContext';
import './styles/index.css';

function App() {
  return (
    <DarkModeProvider>
      <SimpleMealBuilder />
    </DarkModeProvider>
  );
}

export default App;