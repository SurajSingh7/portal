"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "../../component/common/mfa/MfaSetup.css";
import API_BASE_URL from "../../../config/config";

const MfaSetup = () => {
  const hasFetched = useRef(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: initial info/QR display, 2: enter token
  const [isMfaEnabled, setIsMfaEnabled] = useState(false); // indicates if MFA is already enabled
  const router = useRouter();
  const hasRedirected = useRef(false); // Prevent multiple alerts & redirects

  // Fetch MFA setup details on mount
  useEffect(() => {
    if (hasFetched.current) return; // Prevent duplicate execution
    hasFetched.current = true;
    const fetchMfaSetup = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/hrms/2fa/setup`, {
          method: "POST",
          credentials: "include",
        });
        const data = await response.json();

        // If session expired (401 error), redirect to login
        if ((data.error === true && !hasRedirected.current) || response.status === 401) {
          hasRedirected.current = true;
          alert("Session expired. Redirecting to login page...");
          setTimeout(() => {
            router.push("/");
          }, 500);
          return;
        }
        
        // Check if MFA is already enabled
        if (data.key === "Already Enabled") {
          setIsMfaEnabled(true);
          // No QR code/secret needed if MFA is already enabled.
          setQrCode("");
          setSecret("");
        } else {
          // MFA is not yet enabled so display QR code and secret
          setQrCode(data.qrCode);
          setSecret(data.secret);
          setIsMfaEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching MFA setup:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMfaSetup();
  }, [router]);

  // Handle verification submission
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/hrms/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, secret }),
      });
      const result = await response.json();
      if (response.status === 401) {
        alert("Session expired. Redirecting to login page...");
        setTimeout(() => {
          router.push("/");
        }, 500);
        return;
      }
      
      if (result.success) {
        setMessage("MFA enabled successfully! We are Redirecting you.");
   
        if(result.isAdmin === true){
          // router.push("super-admin/company-master")
          router.push("employee/dashboard");
        }
        else{
          router.push("employee/dashboard");
        }
      } else {
        setMessage(result.message || "Invalid token. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("⚠️ An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-container">
      <div className="mfa-card">
        <h2>Enable Multi-Factor Authentication</h2>
        {loading && <p>Loading...</p>}

        {/* If MFA is not enabled, show QR code/secret and instructions */}
        {!loading && !isMfaEnabled && qrCode && step === 1 && (
          <div className="info-section">
            <p>
              Scan the QR code below with your authenticator app (e.g., Google
              Authenticator) or you can manually enter the secret key below in your authenticator app.
            </p>
            <div className="qr-section">
              <img
                src={qrCode}
                alt="Scan this QR code with your Authenticator app"
                className="qr-code"
              />
              <p className="secret-text">Secret Key: {secret}</p>
            </div>
            <button onClick={() => setStep(2)} className="proceed-btn">
              Proceed
            </button>
          </div>
        )}

        {/* If MFA is already enabled, skip QR code and prompt directly */}
        {!loading && isMfaEnabled && step === 1 && (
          <div className="info-section">
            <p>
              MFA is already enabled for your account. Please enter the 6-digit
              code from your authenticator app.
            </p>
            <button onClick={() => setStep(2)} className="proceed-btn">
              Proceed
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="mfa-form">
            <label htmlFor="token">Enter the 6-digit code from your app:</label>
            <input
              type="text"
              id="token"
              name="token"
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <button type="submit" className="verify-btn">
              Verify
            </button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default MfaSetup;