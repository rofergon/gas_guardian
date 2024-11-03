async function main(params) {
    // External libraries for HTTP requests and date formatting
    const axios = require('axios');
    const dateFns = require('date-fns');
  
    // Database connection credentials for Turso
    const TURSO_URL = 'url here';
    const TURSO_AUTH_TOKEN = 'token here';
  
    try {
        // Authentication token log (optional, be careful with security)
        console.log('TURSO_AUTH_TOKEN:', TURSO_AUTH_TOKEN);
  
        // Process blockchain data from various possible input sources
        const data = params.data || params.body || params.event || params;
  
        // Log extracted data
        console.log('Extracted data:', JSON.stringify(data, null, 2));
  
        // Validate that data contains the necessary information
        if (!data.blockInfo || !data.gasMetrics || !data.networkStatus || !data.transactionStats) {
            throw new Error('Incomplete data in payload');
        }
  
        // Extract core block information and format timestamp
        const block_number = data.blockInfo.number;
        const block_hash = data.blockInfo.hash;
        const timestamp = data.blockInfo.timestamp;
  
        // Convert timestamp to standardized format (YYYY-MM-DD HH:mm:ss)
        const parsedTimestamp = new Date(timestamp);
        const formattedTimestamp = dateFns.format(parsedTimestamp, 'yyyy-MM-dd HH:mm:ss');
  
        // Extract gas-related metrics and convert to appropriate number types
        const base_fee_gwei = parseFloat(data.gasMetrics.baseFeeGwei);
        const gas_limit = data.gasMetrics.gasLimit;
        const gas_used = data.gasMetrics.gasUsed;
        const utilization_percent = parseFloat(data.gasMetrics.utilizationPercent);
  
        // Network status indicators for blockchain congestion
        const network_congestion = data.networkStatus.congestion;
        const network_trend = data.networkStatus.trend;
  
        // Transaction statistics with fallback values for optional fields
        const avg_gas_price = parseFloat(data.transactionStats.avgGasPrice);
        const median_gas_price = parseFloat(data.transactionStats.medianGasPrice);
        const avg_priority_fee = data.transactionStats.priorityFeesStats
            ? parseFloat(data.transactionStats.priorityFeesStats.avgPriorityFee)
            : 0;
        const median_priority_fee = data.transactionStats.priorityFeesStats
            ? parseFloat(data.transactionStats.priorityFeesStats.medianPriorityFee)
            : 0;
        const total_transactions = data.transactionStats.count;
        const eip1559_transactions = data.transactionStats.types.eip1559 || 0;
        const legacy_transactions = data.transactionStats.types.legacy || 0;
        const total_value_transferred = parseFloat(data.transactionStats.totalValueTransferred);
  
        // Prepare SQL query for inserting block data into database
        const sql = `INSERT INTO block_data (
            block_number, block_hash, timestamp, base_fee_gwei, gas_limit, gas_used, utilization_percent,
            network_congestion, network_trend, avg_gas_price, median_gas_price, avg_priority_fee,
            median_priority_fee, total_transactions, eip1559_transactions, legacy_transactions, total_value_transferred
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
        // Create array of values matching SQL parameters order
        const paramsArray = [
            block_number,
            block_hash,
            formattedTimestamp,
            base_fee_gwei,
            gas_limit,
            gas_used,
            utilization_percent,
            network_congestion,
            network_trend,
            avg_gas_price,
            median_gas_price,
            avg_priority_fee,
            median_priority_fee,
            total_transactions,
            eip1559_transactions,
            legacy_transactions,
            total_value_transferred
        ];
  
        // Format request for Turso database API
        const requestBody = {
            statements: [{
            statements: [
                {
                    q: sql,
                    params: paramsArray // Changed 'args' to 'params'
                }
            ]
        };
  
        // Build endpoint URL
        const endpoint = TURSO_URL.replace('libsql://', 'https://');
  
        // Configure request headers
        const headers = {
            'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        };
  
        // Log headers and request body
        console.log('Sent headers:', headers);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
        // Make POST request to Turso
        const response = await axios.post(endpoint, requestBody, { headers });
  
        // Log response
        console.log('Turso response:', response.data);
  
        // Return successful result
        return {
            message: 'Data inserted successfully',
            response: response.data
        };
    } catch (error) {
        // Handle and log errors
        console.error('Error inserting data:', error);
  
        // Prepare error details
        const errorDetails = {
            message: error.message,
            stack: error.stack
        };
  
        if (error.response) {
            errorDetails.responseData = error.response.data;
            errorDetails.status = error.response.status;
            errorDetails.headers = error.response.headers;
        }
  
        // Return detailed error
        return {
            message: 'Error inserting data',
            error: errorDetails
        };
    }
}
  