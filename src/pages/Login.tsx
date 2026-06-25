import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Package, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(false);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu có yêu cầu).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Đăng nhập thành công!');
      }
    } catch (error: any) {
      if (!isSignUp) {
        setLoginError(true);
      } else {
        toast.error(error.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(false);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!');
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Package className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleResetRequest}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email đăng ký
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsForgotPassword(false)}
                className="font-medium text-blue-600 hover:text-blue-500 text-sm"
              >
                Quay lại Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Package className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hệ thống Quản lý Kho
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Đăng ký tài khoản mới' : 'Đăng nhập vào hệ thống'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors ${
                    loginError
                      ? 'border-red-300 bg-red-50/10 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm mt-3">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                  <span>Sai thông tin đăng nhập</span>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (isSignUp ? 'Đăng ký' : 'Đăng nhập')}
              </button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="w-full text-center mt-5 text-[#E02424] hover:text-[#C81E1E] text-xs font-semibold uppercase tracking-wider block transition-colors"
                >
                  QUÊN MẬT KHẨU?
                </button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLoginError(false);
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
