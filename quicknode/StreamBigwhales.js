function main(stream) {
    try {
        // Manejar la estructura de datos de QuickNode
        const data = stream.data || stream;
        
        // Verificar si tenemos datos válidos
        if (!Array.isArray(data) || data.length === 0) {
            return {
                error: "No se recibieron datos válidos del bloque",
                stream: stream
            };
        }

        // Extraer el bloque (la estructura es diferente de tu código original)
        const block = data[0]?.block;
        if (!block) return null;

        // Extract metadata (ajustado para la nueva estructura)
        const network = stream.metadata?.network || 'unknown';
        const blockNo = parseInt(block.number || '0x0', 16);
        
        // Configuración del asset
        const asset = {
            units: "eth",
            decimals: 18
        };
        
        // Aplicar el tamaño mínimo de transacción
        const minTxSize_dec = stream.user_data?.minTxSize || 0.5;
        const minTxSize_val = decToVal(minTxSize_dec, asset);    
        
        // Filtrar transacciones - Agregamos logs para debug
        const transactions = block.transactions || [];
        console.log(`Total transactions in block: ${transactions.length}`);
        console.log(`Minimum size in ETH: ${minTxSize_dec}`);
        console.log(`Minimum size in Wei: ${minTxSize_val}`);

        const txArray_raw = transactions.filter(tx => {
            const txValueWei = BigInt(tx.value || '0x0');
            const minValueWei = BigInt(Math.floor(minTxSize_val));
            
            // Log para debug
            console.log(`Transaction value: ${txValueWei}, Min value: ${minValueWei}`);
            
            return txValueWei >= minValueWei;
        });

        const count = txArray_raw.length;
        console.log(`Filtered transactions: ${count}`);

        // Decode transactions into a cleaner format
        const txArray_clean = txArray_raw.map(tx => {
            const txValueWei = BigInt(tx.value || '0x0');
            const value_clean = Number(txValueWei) / Math.pow(10, asset.decimals);
            
            // Decodificar el método desde el input
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

        // While debugging, it is useful to include raw tx array, only return the necessary data in prod
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

function hexToInt(hex) {
    let decodedVal = hex.substring(2);
    decodedVal = parseInt(decodedVal, 16);
    
    return decodedVal;
}

function hexToStr(hex) {
    let decodedStr = hex.substring(2);
    decodedStr = Buffer(decodedStr, 'hex').toString();
    
    return decodedStr;
}

function valToDec(val, asset) {   
    const dec = val / Math.pow(10, asset.decimals);
    return dec;
}

function decToVal(dec, asset) { 
    const val = dec * Math.pow(10, asset.decimals);  
    return val;
}