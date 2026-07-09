import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import api from '../services/api';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Sync with backend to get JWT token
      const response = await api.post('/auth/firebase', {
        email: userCredential.user.email,
        uid: userCredential.user.uid
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to continue</p>

        <form onSubmit={handleSignup}>
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-5px', marginBottom: '15px' }}>
            <span 
              style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }} 
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="linkText">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>

      {/* CSS */}
      <style>{`
        .container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          font-family: Arial;
        }

        .card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          width: 320px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
        }

        h2 {
          margin-bottom: 5px;
        }

        .subtitle {
          font-size: 12px;
          color: gray;
          margin-bottom: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          color: #1e293b;
          background-color: #ffffff;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
          margin: 8px 0;
        }

        .eye-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        button:hover {
          background: #1d4ed8;
        }

        .linkText {
          margin-top: 10px;
          font-size: 12px;
        }

        .linkText span {
          color: #2563eb;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Signup;
