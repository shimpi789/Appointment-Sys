import React from 'react';
import AppointmentForm from './components/AppointmentForm';
import RescheduleForm from './components/RescheduleForm';
import './App.css';
// In src/index.js or src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  return (
    <div>
      <h1>Appointment System</h1>
      <AppointmentForm />
      <RescheduleForm />
    </div>
  );
}

export default App;
