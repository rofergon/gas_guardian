function main(stream) {
    try {
        // Handle cases where data might be nested under "data" key
        const data = stream.data || stream;

        // Ensure data is an array and has at least one element
        if (!Array.isArray(data) || data.length === 0) return null;

        // Extract the block
        const block = data[0]?.block;
        if (!block) return null;

        // Parse block metrics, handling undefined or missing values
        const blockNumber = parseInt(block.number || '0x0', 16);
        const timestamp = parseInt(block.timestamp || '0x0', 16);
        const baseFeePerGas = parseInt(block.baseFeePerGas || '0x0', 16) / 1e9; // Convert to Gwei
        const gasLimit = parseInt(block.gasLimit || '0x0', 16);
        const gasUsed = parseInt(block.gasUsed || '0x0', 16);
        const blobGasUsed = parseInt(block.blobGasUsed || '0x0', 16);

        // Avoid division by zero
        const utilization = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;

        const blockMetrics = {
            number: blockNumber,
            timestamp,
            baseFeePerGas,
            gasLimit,
            gasUsed,
            blobGasUsed,
            utilization
        };

        // Analyze transactions if they exist
        const transactions = block.transactions || [];
        const txStats = transactions.reduce((acc, tx) => {
            const gasPrice = parseInt(tx.gasPrice || tx.maxFeePerGas || '0x0', 16) / 1e9;
            const priorityFee = tx.maxPriorityFeePerGas ? parseInt(tx.maxPriorityFeePerGas, 16) / 1e9 : 0;
            const txType = tx.type ? parseInt(tx.type, 16) : 0;
            const valueTransferred = parseInt(tx.value || '0x0', 16) / 1e18; // Convert to ETH
            const gasUsedTx = parseInt(tx.gas || '0x0', 16);

            acc.totalTx += 1;
            acc.gasPrices.push(gasPrice);
            acc.priorityFees.push(priorityFee);
            acc.valuesTransferred.push(valueTransferred);
            acc.gasUsedPerTx.push(gasUsedTx);
            acc.txTypes[txType] = (acc.txTypes[txType] || 0) + 1;

            return acc;
        }, {
            totalTx: 0,
            gasPrices: [],
            priorityFees: [],
            valuesTransferred: [],
            gasUsedPerTx: [],
            txTypes: {}
        });

        // Helper functions for statistical calculations
        function calculateMedian(values) {
            if (values.length === 0) return 0;
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0
                ? sorted[mid]
                : (sorted[mid - 1] + sorted[mid]) / 2;
        }

        function calculateStdDev(values, avg) {
            const squareDiffs = values.map(value => Math.pow(value - avg, 2));
            const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / values.length;
            return Math.sqrt(avgSquareDiff);
        }

        // Calculate average prices, median and standard deviation of gas and priority fees
        const avgGasPrice = txStats.gasPrices.length > 0
            ? txStats.gasPrices.reduce((a, b) => a + b, 0) / txStats.gasPrices.length
            : 0;
        const medianGasPrice = calculateMedian(txStats.gasPrices);
        const stdDevGasPrice = calculateStdDev(txStats.gasPrices, avgGasPrice);

        const avgPriorityFee = txStats.priorityFees.length > 0
            ? txStats.priorityFees.reduce((a, b) => a + b, 0) / txStats.priorityFees.length
            : 0;
        const medianPriorityFee = calculateMedian(txStats.priorityFees);
        const stdDevPriorityFee = calculateStdDev(txStats.priorityFees, avgPriorityFee);

        // Calculate total transferred value and average gas used per transaction
        const totalValueTransferred = txStats.valuesTransferred.reduce((a, b) => a + b, 0);
        const avgGasUsedPerTx = txStats.gasUsedPerTx.length > 0
            ? txStats.gasUsedPerTx.reduce((a, b) => a + b, 0) / txStats.gasUsedPerTx.length
            : 0;

        // Define MAX_BLOB_GAS_PER_BLOCK according to EIP-4844
        const MAX_BLOB_GAS_PER_BLOCK = 524288; // Example value, adjust as needed

        // Calculate blob gas utilization
        const blobUtilization = blobGasUsed > 0
            ? (blobGasUsed / MAX_BLOB_GAS_PER_BLOCK) * 100
            : 0;

        // Build result object
        return {
            blockInfo: {
                number: blockNumber,
                hash: block.hash,
                timestamp: new Date(timestamp * 1000).toISOString()
            },
            gasMetrics: {
                baseFeeGwei: baseFeePerGas.toFixed(2),
                utilizationPercent: utilization.toFixed(2),
                gasLimit,
                gasUsed,
                blobGasUsed
            },
            transactionStats: {
                count: txStats.totalTx,
                totalValueTransferred: totalValueTransferred.toFixed(4),
                avgGasPrice: avgGasPrice.toFixed(2),
                medianGasPrice: medianGasPrice.toFixed(2),
                stdDevGasPrice: stdDevGasPrice.toFixed(2),
                avgGasUsedPerTx: avgGasUsedPerTx.toFixed(2),
                types: {
                    legacy: txStats.txTypes[0] || 0,
                    eip1559: txStats.txTypes[2] || 0,
                    eip4844: txStats.txTypes[3] || 0
                },
                priorityFeesStats: txStats.priorityFees.length > 0 ? {
                    avgPriorityFee: avgPriorityFee.toFixed(2),
                    medianPriorityFee: medianPriorityFee.toFixed(2),
                    stdDevPriorityFee: stdDevPriorityFee.toFixed(2)
                } : null
            },
            networkStatus: {
                congestion: utilization > 80 ? 'high' :
                            utilization > 50 ? 'medium' : 'low',
                trend: baseFeePerGas > 200 ? 'critical' :
                       baseFeePerGas > 100 ? 'rising' :
                       baseFeePerGas > 50 ? 'moderate' : 'stable',
                blobsActive: blobGasUsed > 0
            },
            blobsStatus: {
                active: blobGasUsed > 0,
                utilizationPercent: blobUtilization.toFixed(2)
            }
        };
    } catch (error) {
        console.error('Error processing data:', error);
        return null;
    }
}
