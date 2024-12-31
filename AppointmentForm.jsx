import React, { useState } from 'react';

function AppointmentForm() {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: ''
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
      const response = await fetch('http://localhost:3000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Appointment booked successfully');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <div className="container">
      <div className="row align-items-center g-lg-5 py-0">
        <div className="col-lg-7 text-center text-lg-start">
          <h2 className="display-4 fw lh-1 text-body-emphasis mb-3">
            Book Your Appointment
          </h2>
          <p className="col-lg-10 fs-4">
            Please fill in the details right to book an appointment with your doctor.
          </p>
        </div>
        <div className="col-md-10 mx-auto col-lg-5">
          <form
            className="p-4 p-md-5 border rounded-3 bg-body-tertiary"
            onSubmit={handleSubmit}
          >
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="patientId"
                name="patientId"
                placeholder="Patient ID"
                value={formData.patientId}
                onChange={handleChange}
                required
              />
              <label htmlFor="patientId">Patient ID</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="doctorId"
                name="doctorId"
                placeholder="Doctor ID"
                value={formData.doctorId}
                onChange={handleChange}
                required
              />
              <label htmlFor="doctorId">Doctor ID</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="datetime-local"
                className="form-control"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
            <label htmlFor="newDate">Appointment Date</label>
            </div>
 
            <button className="w-100 btn btn-lg btn-primary" type="submit">
              Book Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppointmentForm;
