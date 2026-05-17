import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

import Login from './pages/Login';
import WarehouseUI from './WarehouseUI'; // The new UI

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={!session ? <Login /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/*" 
            element={session ? <WarehouseUI /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
