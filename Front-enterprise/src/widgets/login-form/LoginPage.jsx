import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Redirect to home (will automatically redirect to role-specific home)
      navigate('/home');
    }
  }, [navigate]);

  return <Login />;
};

export default LoginPage;
