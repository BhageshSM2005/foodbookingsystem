import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/page";

export default function LoginRegisterPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const url = isLogin ? "http://127.0.0.1:5000/api/login" : "http://127.0.0.1:5000/api/register";
    const payload = { ...formData, role };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessage(data.message || (data.success ? "Success!" : "Failed"));
      
      if (data.success && isLogin) {
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setTimeout(() => {
          if (data.user.role === "user") {
            navigate("/order");
          } else if (data.user.role === "owner") {
            navigate("/addDetails");
          }
        }, 1000);
      }
    } catch (err) {
      setMessage("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>

        {/* Main Container */}
        <div className="w-full h-full flex">
          
          {/* Left Side - Branding (Hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 max-w-lg text-white slide-in">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg mb-6">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Sign in to access your dashboard and manage your restaurant operations seamlessly.
                </p>
              </div>
              
              <div className="space-y-4 mt-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Secure Authentication</h3>
                    <p className="text-blue-100">Your data is protected with industry-standard encryption</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Easy Management</h3>
                    <p className="text-blue-100">Manage orders and restaurant details effortlessly</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">24/7 Support</h3>
                    <p className="text-blue-100">Get help whenever you need it from our dedicated team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md slide-in">
              
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-gray-600">
                  {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
                </p>
              </div>

              {/* Role Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      role === "user"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    🍽️ Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      role === "owner"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    🏪 Restaurant Owner
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                {!isLogin && (
                  <div className="fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="John Doe"
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    value={formData.email}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={formData.password}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    required
                  />
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-gray-600 cursor-pointer">
                      <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      Remember me
                    </label>
                    <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <span>{isLogin ? "Login" : "Register"}</span>
                  )}
                </button>
              </form>

              {/* Message */}
              {message && (
                <div className={`mt-6 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 fade-in ${
                  message.toLowerCase().includes("success")
                    ? "bg-green-50 text-green-700 border-2 border-green-200"
                    : "bg-red-50 text-red-700 border-2 border-red-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {message.toLowerCase().includes("success") ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{message}</span>
                  </div>
                </div>
              )}

              {/* Toggle */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <span className="text-gray-600 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm ml-2 underline underline-offset-4"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage("");
                  }}
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </div>

              {/* Footer */}
              <p className="text-center text-gray-500 text-xs mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}