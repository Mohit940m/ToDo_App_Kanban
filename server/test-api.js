const axios = require('axios');

const testActivityLogAPI = async () => {
  try {
    // First, let's try to login to get a token
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'sahachowdhurymohit@gmail.com',
      password: '123456' // You might need to adjust this password
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    
    // Now test the activity log endpoint
    console.log('Testing activity log API...');
    const activityResponse = await axios.get('http://localhost:5000/api/actions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Activity log API response: ${activityResponse.data.length} activities found`);
    console.log('First few activities:', activityResponse.data.slice(0, 3));
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
};

testActivityLogAPI();