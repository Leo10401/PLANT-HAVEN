"use client"

import { useState, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Link from "next/link"
import { Eye, EyeOff, Facebook, Twitter, Instagram, Mail, Lock, User, ArrowRight, Leaf, Sprout } from "lucide-react"
import "./auth.css"
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from "@/context/AuthContext"

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Validation schemas
const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: Yup.string().required("Email is required").email("Email is invalid"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
})

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
})

export default function AuthPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [passwordHidden, setPasswordHidden] = useState(true)
  const [signupPasswordHidden, setSignupPasswordHidden] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(null)
  const [formError, setFormError] = useState(null)
  const { login } = useAuth();
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState(null);

  // Signup form
  const signupForm = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true)
      setFormError(null)
      try {
        const { data } = await api.post('/user/add', values);
        toast.success("Account created successfully!")
        setTimeout(() => {
          setIsActive(false)
          resetForm()
        }, 2000)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    },
    validationSchema: SignupSchema,
  })

  // Login form
  const loginForm = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true)
      setFormError(null)
      try {
        // Check if user has both accounts
        const sellerCheck = await api.post('/seller/check', { email: values.email });
        
        if (sellerCheck.data.hasSellerAccount) {
          // Store credentials and show role choice
          setLoginCredentials(values);
          setShowRoleChoice(true);
          setIsLoading(false);
          return;
        }

        // If only one account exists, try user login first
        const userResult = await login(values, 'user');
        if (userResult.success) {
          localStorage.setItem('selectedRole', 'user');
          
          // Check if user is an admin and redirect to admin dashboard
          if (userResult.user && userResult.user.role === 'admin') {
            // Replace router navigation with full page reload
            window.location.href = '/admin/dashboard';
          } else {
            // Replace router navigation with full page reload
            window.location.href = '/';
          }
          return;
        }

        // Try seller login if user login fails
        const sellerResult = await login(values, 'seller');
        if (sellerResult.success) {
          localStorage.setItem('selectedRole', 'seller');
          // Replace router navigation with full page reload
          window.location.href = '/seller/dashboard';
          return;
        }

        // If both logins fail
        toast.error('Invalid credentials');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Login failed');
      } finally {
        setIsLoading(false);
        resetForm();
      }
    },
    validationSchema: LoginSchema,
  })

  const handleRoleChoice = async (role) => {
    if (!loginCredentials) return;
    
    setIsLoading(true);
    try {
      const result = await login(loginCredentials, role);
      if (result.success) {
        // Store the selected role in localStorage
        localStorage.setItem('selectedRole', role);
        
        if (role === 'seller') {
          // Replace router navigation with full page reload
          window.location.href = '/seller/dashboard';
        } else if (result.user && result.user.role === 'admin') {
          // Redirect admin users to admin dashboard with full page reload
          window.location.href = '/admin/dashboard';
        } else {
          // Replace router navigation with full page reload
          window.location.href = '/';
        }
      } else {
        toast.error('Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
      setShowRoleChoice(false);
      setLoginCredentials(null);
    }
  };

  // Panel switching effect
  useEffect(() => {
    const handleSignUp = () => setIsActive(true)
    const handleSignIn = () => setIsActive(false)

    const signUpButton = document.getElementById("signUp")
    const signInButton = document.getElementById("signIn")

    if (signUpButton) signUpButton.addEventListener("click", handleSignUp)
    if (signInButton) signInButton.addEventListener("click", handleSignIn)

    return () => {
      if (signUpButton) signUpButton.removeEventListener("click", handleSignUp)
      if (signInButton) signInButton.removeEventListener("click", handleSignIn)
    }
  }, [])

  // Floating leaves effect
  useEffect(() => {
    const createLeaf = () => {
      const overlay = document.querySelector(".overlay")
      if (!overlay) return

      const leaf = document.createElement("div")
      leaf.className = "leaf-particle"

      // Random position
      const posX = Math.random() * overlay.clientWidth
      const posY = Math.random() * overlay.clientHeight

      // Random size
      const size = Math.random() * 15 + 10

      // Random leaf type
      const leafType = Math.floor(Math.random() * 3)
      let leafClass = ""
      switch (leafType) {
        case 0:
          leafClass = "leaf-type-1"
          break
        case 1:
          leafClass = "leaf-type-2"
          break
        case 2:
          leafClass = "leaf-type-3"
          break
      }
      leaf.classList.add(leafClass)

      // Styling
      leaf.style.width = `${size}px`
      leaf.style.height = `${size}px`
      leaf.style.left = `${posX}px`
      leaf.style.top = `${posY}px`
      leaf.style.position = "absolute"
      leaf.style.pointerEvents = "none"

      // Random rotation
      const rotation = Math.random() * 360
      leaf.style.transform = `rotate(${rotation}deg)`

      overlay.appendChild(leaf)

      // Remove after animation
      setTimeout(() => {
        if (leaf.parentNode === overlay) {
          overlay.removeChild(leaf)
        }
      }, 8000)
    }

    // Create leaves at intervals
    const leafInterval = setInterval(createLeaf, 300)

    return () => {
      clearInterval(leafInterval)
    }
  }, [])

  return (
    <div className="auth-body">
      <Toaster position="top-center" />
      {showRoleChoice ? (
        <div className="role-choice-container">
          <div className="role-choice-card">
            <h2 className="text-2xl font-bold mb-4">Choose Account Type</h2>
            <p className="text-gray-600 mb-6">You have both user and seller accounts. How would you like to sign in?</p>
            <div className="space-y-4">
              <button
                onClick={() => handleRoleChoice('user')}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in as User'}
              </button>
              <button
                onClick={() => handleRoleChoice('seller')}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in as Seller'}
              </button>
              <button
                onClick={() => {
                  setShowRoleChoice(false);
                  setLoginCredentials(null);
                }}
                className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`container ${isActive ? "right-panel-active" : ""}`} id="container">
          {/* Sign Up Form Container */}
          <div className="form-container sign-up-container">
            <form onSubmit={signupForm.handleSubmit}>
              <div className="logo-container">
                <div className="logo-icon">
                  <img src="/qkartlogo.png" alt="" height={64} width={40} />
                </div>
                <h1 className="logo-text">Qkart</h1>
              </div>

              <h2 className="form-title">Create Account</h2>

              <div className="social-container">
                <a href="#" className="social" aria-label="Facebook">
                  <Facebook size={16} />
                </a>
                <a href="#" className="social" aria-label="Twitter">
                  <Twitter size={16} />
                </a>
                <a href="#" className="social" aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              </div>

              <span className="form-subtitle">or use your email for registration</span>

              {/* Name input */}
              <div className="input-container">
                <div className="input-icon">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Name"
                  id="name"
                  onChange={signupForm.handleChange}
                  value={signupForm.values.name}
                />
                {signupForm.touched.name && signupForm.errors.name && (
                  <p className="error-message">{signupForm.errors.name}</p>
                )}
              </div>

              {/* Email input */}
              <div className="input-container">
                <div className="input-icon">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  id="email"
                  onChange={signupForm.handleChange}
                  value={signupForm.values.email}
                />
                {signupForm.touched.email && signupForm.errors.email && (
                  <p className="error-message">{signupForm.errors.email}</p>
                )}
              </div>

              {/* Password input */}
              <div className="input-container">
                <div className="input-icon">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={signupPasswordHidden ? "password" : "text"}
                  placeholder="Password"
                  id="password"
                  onChange={signupForm.handleChange}
                  value={signupForm.values.password}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setSignupPasswordHidden(!signupPasswordHidden)}
                >
                  {signupPasswordHidden ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {signupForm.touched.password && signupForm.errors.password && (
                  <p className="error-message">{signupForm.errors.password}</p>
                )}
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>

              <div className="seller-register-link">
                <Link href="/seller-register" className="text-blue-600 hover:text-blue-800">
                  Register as a Seller
                </Link>
              </div>
            </form>
          </div>

          {/* Sign In Form Container */}
          <div className="form-container sign-in-container">
            <form onSubmit={loginForm.handleSubmit}>
              <div className="logo-container">
                <div className="logo-icon">
                  <img src="/qkartlogo.png" alt="" height={64} width={40} />
                </div>
                <h1 className="logo-text">Qkart</h1>
              </div>

              <h2 className="form-title">Sign In</h2>

              <div className="social-container">
                <a href="#" className="social" aria-label="Facebook">
                  <Facebook size={16} />
                </a>
                <a href="#" className="social" aria-label="Twitter">
                  <Twitter size={16} />
                </a>
                <a href="#" className="social" aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              </div>

              <span className="form-subtitle">or use your account</span>

              {/* Email input */}
              <div className="input-container">
                <div className="input-icon">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  id="email"
                  onChange={loginForm.handleChange}
                  value={loginForm.values.email}
                />
                {loginForm.touched.email && loginForm.errors.email && (
                  <p className="error-message">{loginForm.errors.email}</p>
                )}
              </div>

              {/* Password input */}
              <div className="input-container">
                <div className="input-icon">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={passwordHidden ? "password" : "text"}
                  placeholder="Password"
                  id="password"
                  onChange={loginForm.handleChange}
                  value={loginForm.values.password}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setPasswordHidden(!passwordHidden)}
                >
                  {passwordHidden ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {loginForm.touched.password && loginForm.errors.password && (
                  <p className="error-message">{loginForm.errors.password}</p>
                )}
              </div>

              <a href="#" className="forgot-password">
                Forgot your password?
              </a>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Overlay Container */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <div className="logo-container">
                  <div className="logo-icon">
                    <img src="/qkartlogo.png" alt="" height={64} width={40} />
                  </div>
                  <h1 className="logo-text">Qkart</h1>
                </div>
                <h2 className="overlay-title">Welcome Back!</h2>
                <p className="overlay-text">
                  To keep connected with us please login with your personal info
                </p>
                <button className="ghost-button" id="signIn">
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <div className="logo-container">
                  <div className="logo-icon">
                    <img src="/qkartlogo.png" alt="" height={64} width={40} />
                  </div>
                  <h1 className="logo-text">Qkart</h1>
                </div>
                <h2 className="overlay-title">Hello, Friend!</h2>
                <p className="overlay-text">
                  Enter your personal details and start journey with us
                </p>
                <button className="ghost-button" id="signUp">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
