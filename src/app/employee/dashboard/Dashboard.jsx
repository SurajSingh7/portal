"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import Layout from "../../../layouts/Layout";
import MonthlyAttendanceCalendars from "./MonthlyAttendanceCalendars";
import "react-calendar/dist/Calendar.css";
import QuickLinksCard from "./QuickLinksCard";
import AttendanceGraph from "./AttendanceGraph";
import styles from "./style.module.css";
import API_BASE_URL from "../../../../config/config";
import MessagingCard from "./MessagingCard";
import EmployeeCard from "./EmployeeCard";
import CustomSpin from "./CustomSpin";

const Dashboard = ({ accessData }) => {
  const router = useRouter(); // Initialize router for navigation
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false); // State for handling 401 status
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const url = `${API_BASE_URL}/hrms/authdata`;
        const response = await fetch(url, {
          method: "GET",
          credentials: "include", // Include cookies with the request
        });

        if (response.status === 401) {
          setUnauthorized(true); // Mark unauthorized state
          return;
        }

        if (response.ok) {
          const result = await response.json();
          const employeeData = result.data[0];

          const { email, department, basicemployees, role } = employeeData;


          setUserData({
            email,
            department: department?.name,
            role: department?.roles?.name,
            firstName: basicemployees?.firstName,
            lastName: basicemployees?.lastName,
            employeeCode: basicemployees?.employeeCode,
            uploadFileInfo: basicemployees?.uploadFileInfo?.[0]?.path,
            profileImage: basicemployees?.profileImage,
          });

          setSelectedEmployee(basicemployees?.employeeCode);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Something went wrong");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // No dependency on router here to prevent unnecessary re-fetch

  // Redirect to home if unauthorized, without reloading the page
  useEffect(() => {
    if (unauthorized) {
      console.log("Redirecting to home due to 401 Unauthorized");
      router.replace("/"); // Ensure no page reload happens
    }
  }, [unauthorized, router]);

  if (unauthorized) return null; 

  if (loading) return <CustomSpin />;

  return (
    <Layout>
      <div className="container" style={{ backgroundColor: "#F2F2F7", padding: "20px" }}>
        <div className={styles.cardContainer}>
          <EmployeeCard userData={userData} />
          <MessagingCard />
          <QuickLinksCard className={styles.quickLinksCard} employeeName={userData} />
        </div>

        <br />
        <AttendanceGraph selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />
        <br />

        <div style={{ paddingBottom: "40px" }}>
          <MonthlyAttendanceCalendars selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;















