function main(stream) {
    try {
        // Handle QuickNode's data structure - can come as stream.data or direct stream
        const data = stream.data || stream;
        
        // Basic validation of incoming data
        if (!Array.isArray(data) || data.length === 0) {
            return {
                error: "Invalid block data received",
                stream: stream
            };
        }

        // Get block data from the first element of the array
        const block = data[0]?.block;
        if (!block) return null;

        // Get network info and convert block number from hex to decimal
        const network = stream.metadata?.network || 'unknown';
        const blockNo = parseInt(block.number || '0x0', 16);
        
        // Define ETH asset properties for value calculations
        const asset = {
            units: "eth",
            decimals: 18  // ETH has 18 decimal places
        };
        
        // Get minimum transaction size from user settings or default to 0.5 ETH
        const minTxSize_dec = stream.user_data?.minTxSize || 0.5;
        const minTxSize_val = decToVal(minTxSize_dec, asset);    
        
        // Debug logging for transaction filtering
        const transactions = block.transactions || [];
        console.log(`Total transactions in block: ${transactions.length}`);
        console.log(`Minimum size in ETH: ${minTxSize_dec}`);
        console.log(`Minimum size in Wei: ${minTxSize_val}`);

        // Filter transactions that are larger than minimum size
        const txArray_raw = transactions.filter(tx => {
            const txValueWei = BigInt(tx.value || '0x0');
            const minValueWei = BigInt(Math.floor(minTxSize_val));
            
            console.log(`Transaction value: ${txValueWei}, Min value: ${minValueWei}`);
            
            return txValueWei >= minValueWei;
        });

        const count = txArray_raw.length;
        console.log(`Filtered transactions: ${count}`);

        // Transform raw transactions into a cleaner format for easier processing
        const txArray_clean = txArray_raw.map(tx => {
            const txValueWei = BigInt(tx.value || '0x0');
            const value_clean = Number(txValueWei) / Math.pow(10, asset.decimals);
            
            // Extract method ID from transaction input data (first 4 bytes)
            const methodId = tx.input.slice(0, 10);
            let decodedInput = {
                methodId: methodId,
                rawInput: tx.input
            };
            
            return {
                hash: tx.hash,
                to: tx.to,
                from: tx.from,
                value: value_clean,
                units: asset.units,
                input: decodedInput
            };
        });

        // Return both clean and raw transactions for debugging purposes
        const returnObj = { 
            block: blockNo,
            network: network,
            result: `${count} transaction(s) w/ value > ${minTxSize_dec} ${asset.units}`,
            transactions_clean: txArray_clean,
            transactions_raw: txArray_raw
        };

        return returnObj;
    } catch (error) {
        console.error("Error processing stream:", error);
        return {
            error: "Error processing stream",
            stream: stream
        };
    }
}   

// Helper function to convert hexadecimal to integer
function hexToInt(hex) {
    let decodedVal = hex.substring(2);  // Remove '0x' prefix
    decodedVal = parseInt(decodedVal, 16);
    
    return decodedVal;
}

// Helper function to convert hexadecimal to string
function hexToStr(hex) {
    let decodedStr = hex.substring(2);  // Remove '0x' prefix
    decodedStr = Buffer(decodedStr, 'hex').toString();
    
    return decodedStr;
}

// Convert Wei value to decimal ETH
function valToDec(val, asset) {   
    const dec = val / Math.pow(10, asset.decimals);
    return dec;
}

// Convert decimal ETH to Wei value
function decToVal(dec, asset) { 
    const val = dec * Math.pow(10, asset.decimals);  
    return val;
}