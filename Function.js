async function main(params) {
    // Import required packages
    const axios = require('axios');
    const dateFns = require('date-fns');
  
    // Turso credentials
    const TURSO_URL = 'libsql://gasguardian-rofergon.turso.io';
    const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...';
  
    try {
        // Authentication token log (optional, be careful with security)
        console.log('TURSO_AUTH_TOKEN:', TURSO_AUTH_TOKEN);
  
        // Try to extract data from different possible properties
        const data = params.data || params.body || params.event || params;
  
        // Log extracted data
        console.log('Extracted data:', JSON.stringify(data, null, 2));
  
        // Validate that data contains the necessary information
        if (!data.blockInfo || !data.gasMetrics || !data.networkStatus || !data.transactionStats) {
            throw new Error('Incomplete data in payload');
        }
  
        // Extraer y procesar valores necesarios
        const block_number = data.blockInfo.number;
        const block_hash = data.blockInfo.hash;
        const timestamp = data.blockInfo.timestamp;
  
        const parsedTimestamp = new Date(timestamp);
        const formattedTimestamp = dateFns.format(parsedTimestamp, 'yyyy-MM-dd HH:mm:ss');
  
        const base_fee_gwei = parseFloat(data.gasMetrics.baseFeeGwei);
        const gas_limit = data.gasMetrics.gasLimit;
        const gas_used = data.gasMetrics.gasUsed;
        const utilization_percent = parseFloat(data.gasMetrics.utilizationPercent);
  
        const network_congestion = data.networkStatus.congestion;
        const network_trend = data.networkStatus.trend;
  
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
  
        // Construir la sentencia SQL y los parámetros
        const sql = `INSERT INTO block_data (
            block_number, block_hash, timestamp, base_fee_gwei, gas_limit, gas_used, utilization_percent,
            network_congestion, network_trend, avg_gas_price, median_gas_price, avg_priority_fee,
            median_priority_fee, total_transactions, eip1559_transactions, legacy_transactions, total_value_transferred
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
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
  
        // Construir el cuerpo de la solicitud
        const requestBody = {
            statements: [
                {
                    q: sql,
                    params: paramsArray // Cambiado 'args' a 'params'
                }
            ]
        };
  
        // Construir la URL del endpoint
        const endpoint = TURSO_URL.replace('libsql://', 'https://');
  
        // Configurar los encabezados de la solicitud
        const headers = {
            'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        };
  
        // Log de los encabezados y cuerpo de la solicitud
        console.log('Sent headers:', headers);
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
        // Realizar la solicitud POST a Turso
        const response = await axios.post(endpoint, requestBody, { headers });
  
        // Log de la respuesta
        console.log('Turso response:', response.data);
  
        // Retornar resultado exitoso
        return {
            message: 'Data inserted successfully',
            response: response.data
        };
    } catch (error) {
        // Manejar y registrar errores
        console.error('Error inserting data:', error);
  
        // Preparar detalles del error
        const errorDetails = {
            message: error.message,
            stack: error.stack
        };
  
        if (error.response) {
            errorDetails.responseData = error.response.data;
            errorDetails.status = error.response.status;
            errorDetails.headers = error.response.headers;
        }
  
        // Retornar el error detallado
        return {
            message: 'Error inserting data',
            error: errorDetails
        };
    }
}
  