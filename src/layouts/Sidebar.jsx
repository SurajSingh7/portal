import React, { useState, useEffect } from "react";
import { Layout, Menu, theme } from "antd";
import { DashboardOutlined, TeamOutlined, UserOutlined, } from "@ant-design/icons";
import Link from "next/link";
import API_BASE_URL from "../../config/config";


const { Sider } = Layout;

const Sidebar = ({ status }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const department=process.env.NEXT_PUBLIC_DEPARTMENT;
  const role=process.env.NEXT_PUBLIC_ROLE;
  const sadmin=process.env.NEXT_PUBLIC_S_ADMIN;
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!API_BASE_URL) {
          console.error("API_BASE_URL is not defined!");
          setError("API URL is missing.");
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/hrms/authdata`;
        console.log("Fetching data from:", url); // Debugging API call
        
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          console.error(`API Error: ${response.status}`, await response.text());
          setError("Failed to fetch data");
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (!result.data || result.data.length === 0) {
          console.warn("No user data received");
          setError("No user data available");
          setLoading(false);
          return;
        }

        const employeeData = result.data[0]; // Ensure data[0] exists
        const { email, department, basicemployees, role } = employeeData;

        setUserData({
          email,
          department: department?.name || "Unknown",
          role: role?.name || "Unknown",
          firstName: basicemployees?.firstName || "",
          lastName: basicemployees?.lastName || "",
          employeeCode: basicemployees?.employeeCode || "",
          profileImage: basicemployees?.profileImage || "",
        });
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Construct menu items based on conditions
  const menuItemsData = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: (
        <Link href="/employee/dashboard" style={{ textDecoration: "none", color: "white" }}>
          Dashboard
        </Link>
      ),
    },
  ];

  // Show hr-Admin only if user is HR Manager or in HR department
  if (userData?.role === role || userData?.department === department || userData?.email === sadmin) {
    menuItemsData.push({
      key: "hr-admin",
      icon: <TeamOutlined/>,
      label: (
        <a href={`${process.env.NEXT_PUBLIC_HR_ADMIN_URL}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "white" }}>
        HR-Admin
        </a>
      ),
    });
  }

  // Show S-Admin only if user email is super-admin@gmail.com
  if (userData?.email === "superAdmin@gmail.com") {
    menuItemsData.push({
      key: "s-admin",
      icon: <UserOutlined />,
      label: (
      <a href={`${process.env.NEXT_PUBLIC_SUPER_ADMIN_URL}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "white" }}>
          C-Pannel
        </a>
      ),
    });
  }

  return (
    <Layout style={{ padding: "auto", paddingBottom: "30px" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={status}
        style={{ overflow: "auto", position: "fixed", left: 0, height: "100%", zIndex: 555, top: 40 }}
        width={150} // final width
        collapsedWidth={72} // initial width
      >
        <Menu mode="inline" defaultSelectedKeys={["dashboard"]} style={{ background: "#82dd97", height: "100%", color: "black" }} items={menuItemsData} />
      </Sider>
    </Layout>
  );
};

export default Sidebar;
































// import React, { useState, useEffect } from "react";
// import { Layout, Menu, theme } from "antd";
// import { DashboardOutlined, HomeOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
// import { checkPermission } from "@/utils/checkPermission";
// import Link from "next/link";

// const { Sider } = Layout;

// const Sidebar = ({ status, func }) => {
//   const [menuItems, setMenuItems] = useState([]);

//   useEffect(() => {
//     const fetchPermissions = async () => {
//       const permissions = await checkPermission();
//       setMenuItems(permissions);
//     };

//     fetchPermissions();
//   }, []);

//   const icons = [
//     <HomeOutlined key="home" />,
//     <UserOutlined key="user" />,
//     <SettingOutlined key="settings" />,
//     <DashboardOutlined key="dashboard" />,
//   ];

//   // old
//   // const menuItemsData = [
//   //   {
//   //     key: "dashboard",
//   //     icon: <DashboardOutlined />,
//   //     label: (
//   //       <Link href="/employee/dashboard" style={{ textDecoration: "none", color: "white" }}>
//   //         Dashboard
//   //       </Link>
//   //     ),
//   //   },

//   //   ...menuItems?.map((item, index) => ({
//   //     key: item._id,
//   //     icon: icons[index % icons.length],
//   //     label: (
//   //       <Link href={item.resources} style={{ textDecoration: "none", color: "white" }}>
//   //         {item.menuName}
//   //       </Link>
//   //     ),
//   //   })),


//   // ];

//  console.log("menuIteam->####################",menuItems)
//   const menuItemsData = [
//     {
//       key: "dashboard",
//       icon: <DashboardOutlined />,
//       label: (
//         <Link href="/employee/dashboard" style={{ textDecoration: "none", color: "white" }}>
//           Dashboard
//         </Link>
//       ),
//     },
//     ...(menuItems && Array.isArray(menuItems)
//       ? menuItems.map((item, index) => ({
//           key: item._id,
//           icon: icons[index % icons.length],
//           label: (
//             <Link href={item.resources} style={{ textDecoration: "none", color: "white" }}>
//               {item.menuName}
//             </Link>
//           ),
//         }))
//       : []), // Provide an empty array as fallback if menuItems is undefined or not an array


//       // {
//       //   key: "user",
//       //   icon: <UserOutlined />,
//       //   label: (
//       //     <Link href="/super-admin/company-master" style={{ textDecoration: "none", color: "white" }}>
//       //       S-Admin
//       //     </Link>
//       //   ),
//       // },
//   ];
  




//   const { token } = theme.useToken(); // Use token for custom styling if necessary

//   return (
//     <Layout style={{ padding: "auto", paddingBottom: "30px" }}>
//       <Sider
//         trigger={null}
//         collapsible
//         collapsed={status}
//         style={{ overflow: "auto", position: "fixed", left: 0, height: "100%", zIndex: 555, top: 40, }}
//         width={150} // final width
//         collapsedWidth={72}  // initial width
//         // onClick={func} // Toggle collapsed state on click
//       >
//         <Menu
//           mode="inline"
//           defaultSelectedKeys={["dashboard"]}
//           style={{ background: "#82dd97", height: "100%", color: "black"}}
//           items={menuItemsData} // Use 'items' instead of 'children'
//         />

//       </Sider>
//     </Layout>
//   );
// };
// export default Sidebar;
