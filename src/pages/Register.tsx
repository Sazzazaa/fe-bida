import { useState } from 'react'
import '../styles/auth.css'

export default function Register({
  onRegistered,
  onSwitchToLogin,
}: {
  onRegistered?: () => void
  onSwitchToLogin?: () => void
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setApiError('')

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message || 'Register failed')
      }

      await response.json()
      alert('Account created successfully, please login.')
      onRegistered?.()
    } catch (err: any) {
      setApiError(err?.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Left side - Image */}
      <div className="auth-image">
        <img 
          src="/billiard-hall.jpg" 
          alt="Premium billiard hall" 
          className="image-cover"
        />
        <div className="image-overlay"></div>
        <div className="image-content">
          <h2>Join Our Team</h2>
          <p>Get started with your billiard club management account</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p className="subtitle">
              Register as a staff or admin member
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full name Field */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 0901234567"
                className="form-input"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span>
                  I agree to the{' '}
                  <a href="#terms">terms and conditions</a>
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="error-message">{errors.agreeTerms}</span>
              )}
            </div>

            {/* API Error */}
            {apiError && <p className="error-message">{apiError}</p>}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="button button-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToLogin}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
