// fetchData.js
import axios from 'axios';

const fetchData = async () => {
  try {
    const response = await axios.post(
      'https://api.quicknode.com/functions/rest/v1/functions/49e57765-8052-4458-b5de-82d1cd89b684/call?result_only=true',
      {
        network: 'ethereum-mainnet',
        dataset: 'block',
        blockNumber: 20032341,
        user_data: {
          max_fee: 8.5
        }
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': 'QN_b15d419293ee406faf04447872de726e'
        }
      }
    );

    console.log('Response Data:', response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

fetchData();