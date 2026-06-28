import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const { forgotPassword } = useAuth();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      addNotification('error', 'Validation Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);
    const success = await forgotPassword(email);
    
    if (success) {
      setIsEmailSent(true);
      addNotification('success', 'Email Sent!', 'Check your inbox for reset instructions');
    } else {
      addNotification('error', 'Failed', 'Something went wrong');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-slate-900 to-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-blue to-primary-purple rounded-2xl mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-400 mt-2">Don't worry, we'll help you out</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl">
          {!isEmailSent ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400 mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-blue transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-primary-blue hover:text-primary-purple font-medium transition-colors"
              >
                Send to another email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <span>←</span> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
