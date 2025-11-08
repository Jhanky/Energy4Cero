import React, { useState, useEffect } from 'react';
import { getDepartments, getCitiesByDepartment } from '../../services/locationService';

const LocationFields = ({ form, setForm }) => {
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        setDepartments(response.data);
      } catch (error) {
        // Handle error
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (form.department_id) {
        try {
          const response = await getCitiesByDepartment(form.department_id);
          setCities(response.data);
        } catch (error) {
          // Handle error
        }
      }
    };

    fetchCities();
  }, [form.department_id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="form-group">
        <label htmlFor="department_id">Departamento</label>
        <select
          name="department_id"
          id="department_id"
          className="form-control"
          value={form.department_id}
          onChange={handleChange}
        >
          <option value="">Seleccione un departamento</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="city_id">Ciudad</label>
        <select
          name="city_id"
          id="city_id"
          className="form-control"
          value={form.city_id}
          onChange={handleChange}
          disabled={!form.department_id}
        >
          <option value="">Seleccione una ciudad</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default LocationFields;
