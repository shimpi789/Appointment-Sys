import { useState } from 'react';

function RescheduleForm() {
  const [formData, setFormData] = useState({
    appointmentId: '',
    doctorId: '',
    newDate: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/appointments/${formData.appointmentId}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: formData.doctorId,
          newDate: formData.newDate,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Appointment rescheduled successfully');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="appointmentId"
        placeholder="Appointment ID"
        value={formData.appointmentId}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="doctorId"
        placeholder="Doctor ID"
        value={formData.doctorId}
        onChange={handleChange}
        required
      />
      <input
        type="datetime-local"
        name="newDate"
        value={formData.newDate}
        onChange={handleChange}
        required
      />
      <button type="submit">Reschedule Appointment</button>
    </form>
  );
}

export default RescheduleForm;
