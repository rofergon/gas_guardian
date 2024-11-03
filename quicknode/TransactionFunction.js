async function main(params) {
    const axios = require('axios');

    // Database connection credentials
    const TURSO_URL = 'url here';
    const TURSO_AUTH_TOKEN = 'token here';

    try {
        // Debug logging for troubleshooting
        console.log('Raw input params:', params);
        
        // Initial params validation
        if (!params) {
            throw new Error('No params received');
        }

        // Handle both string and object params formats
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

        // Enhanced debug logging for data structure
        console.log('Data object:', {
            dataExists: !!data,
            dataType: typeof data,
            keys: data ? Object.keys(data) : 'no keys',
            rawData: data
        });

        // Validate required data fields
        if (!data) {
            throw new Error('No data object in params');
        }

        if (!data.block) {
            throw new Error('No block number in data');
        }

        if (!data.transactions_clean || !Array.isArray(data.transactions_clean)) {
            throw new Error('No valid transactions array in data');
        }

        // Only process transactions with required fields (hash, from, to)
        const validTransactions = data.transactions_clean
            .filter(tx => tx.hash && tx.from && tx.to);

        console.log('Valid transactions:', JSON.stringify(validTransactions, null, 2));

        // Create SQL insert statements for each valid transaction
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

        // Skip DB call if no valid transactions found
        if (sqlStatements.length === 0) {
            return {
                message: 'No valid transactions to process',
                blockNumber: data.block
            };
        }

        // Prepare Turso DB request
        const requestBody = { statements: sqlStatements };
        const headers = {
            'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        };

        console.log(`Attempting to process ${sqlStatements.length} transactions from block ${data.block}`);

        // Execute batch insert to Turso DB
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