async function main(params) {
    const axios = require('axios');

    // Turso credentials from your .env
    const TURSO_URL = 'https://gasguardian-rofergon.turso.io';
    const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzAxODIwODcsImlkIjoiZDY3ZTZlMTMtYTBjMC00NWQwLWE4YWItYzJmYTE5ODFmZTNkIn0.scna7FRx62_bR5kaK3x2_cDZaoqVuaXkKFWC2a36nYgmg7XIO8uNnSkKBphTcGsdAmwxyZw27RPBS4k4UJyIDg';

    try {
        // Log the raw input first
        console.log('Raw input params:', params);
        
        // Check if params exists
        if (!params) {
            throw new Error('No params received');
        }

        // Check if we need to parse the params
        let data = params.data;
        if (typeof params === 'string') {
            try {
                const parsedParams = JSON.parse(params);
                data = parsedParams.data;
                console.log('Parsed params successfully:', parsedParams);
            } catch (parseError) {
                console.error('Failed to parse params:', parseError);
                throw new Error('Invalid JSON in params');
            }
        }

        // Detailed validation
        console.log('Data object:', {
            dataExists: !!data,
            dataType: typeof data,
            keys: data ? Object.keys(data) : 'no keys',
            rawData: data
        });

        if (!data) {
            throw new Error('No data object in params');
        }

        if (!data.block) {
            throw new Error('No block number in data');
        }

        if (!data.transactions_clean || !Array.isArray(data.transactions_clean)) {
            throw new Error('No valid transactions array in data');
        }

        // Filter only transactions with value > 0
        const validTransactions = data.transactions_clean
            .filter(tx => tx.hash && tx.from && tx.to);

        console.log('Valid transactions:', JSON.stringify(validTransactions, null, 2));

        // Prepare SQL statements
        const sqlStatements = validTransactions.map(tx => ({
            q: `INSERT OR IGNORE INTO transactions (
                block_number,
                network,                
                tx_hash,
                from_address,
                to_address,
                value,
                units
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            params: [
                data.block,
                data.network,                
                tx.hash,
                tx.from,
                tx.to,
                tx.value.toString(),
                tx.units
            ]
        }));

        if (sqlStatements.length === 0) {
            return {
                message: 'No valid transactions to process',
                blockNumber: data.block
            };
        }

        // Configure the request
        const requestBody = { statements: sqlStatements };
        const headers = {
            'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        };

        console.log(`Attempting to process ${sqlStatements.length} transactions from block ${data.block}`);

        // Make the request to Turso
        const response = await axios.post(`${TURSO_URL}`, requestBody, { headers });

        return {
            message: 'Transactions inserted successfully',
            blockNumber: data.block,
            transactionsProcessed: sqlStatements.length,
            response: response.data
        };

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            responseData: error.response?.data,
            stack: error.stack,
            params: JSON.stringify(params, null, 2)
        });

        return {
            message: 'Error inserting transactions',
            error: {
                message: error.message,
                status: error.response?.status,
                details: error.response?.data,
                validationInfo: {
                    hasData: !!params?.data,
                    hasBlock: params?.data?.block,
                    hasTransactions: params?.data?.transactions_clean
                }
            }
        };
    }
}