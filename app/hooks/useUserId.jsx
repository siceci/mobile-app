import { useEffect, useState } from 'react';

const useUserId = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/get-current-user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          setUserId(jsonResponse.user.id);
        } else {
          console.error('Failed to fetch user ID:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  return userId;
};

export default useUserId;
