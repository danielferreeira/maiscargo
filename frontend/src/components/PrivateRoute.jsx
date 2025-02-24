import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

export default function PrivateRoute({ children }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return children;
} 