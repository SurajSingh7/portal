import { useEffect, useState } from "react";
import API_BASE_URL from "../../../../config/config";

const useCheckToken = () => {
  const [loadingToken, setLoadingToken] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hrms/user-session`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          setUnauthorized(true);
        }
      } catch {
        setUnauthorized(true);
      } finally {
        setLoadingToken(false);
      }
    };

    checkToken(); // Call API immediately
  }, []);

  return { loadingToken, unauthorized };
};

export default useCheckToken;













// import { useEffect, useState } from "react";
// import API_BASE_URL from "../../../../config/config";

// const useCheckToken = () => {
//   const [loadingToken, setLoadingToken] = useState(true);
//   const [unauthorized, setUnauthorized] = useState(false);

//   useEffect(() => {
//     const checkToken = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/hrms/user-session`, {
//           method: "GET",
//           credentials: "include",
//         });

//         if (response.status === 401) {
//           setUnauthorized(true);
//         }
//       } catch {
//         setUnauthorized(true);
//       } finally {
//         setLoadingToken(false);
//       }
//     };

//     setTimeout(checkToken, 100);
//   }, []);

//   return { loadingToken, unauthorized };
// };

// export default useCheckToken;
