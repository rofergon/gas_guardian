function main(params) {
    console.log("Starting block analysis...");
    console.log("Dataset type:", params.metadata.dataset);
    
    const dataset = params.metadata.dataset;
    const block = dataset.block;
    
    console.log("Processing block number:", parseInt(block.number, 16));
    console.log("Block timestamp:", new Date(parseInt(block.timestamp, 16) * 1000).toISOString());

    // Objeto para almacenar la actividad de los contratos
    const contractActivity = {};
    
    console.log("Total transactions in block:", block.transactions.length);
    
    // Procesar las transacciones y contar interacciones
    block.transactions.forEach((tx, index) => {
        console.log(`Processing transaction ${index + 1}/${block.transactions.length}`);
        console.log(`Transaction hash: ${tx.hash}`);
        console.log(`From: ${tx.from}`);
        console.log(`To: ${tx.to || 'Contract Creation'}`);
        console.log(`Value: ${parseInt(tx.value, 16)} wei`);
        console.log("------------------------");

        if (tx.to) {
            contractActivity[tx.to] = (contractActivity[tx.to] || 0) + 1;
        }
    });

    // Convertir a array y ordenar por número de interacciones
    const sortedContracts = Object.entries(contractActivity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    console.log("Top 10 most active contracts:");
    sortedContracts.forEach((contract, index) => {
        console.log(`${index + 1}. Address: ${contract[0]} - Interactions: ${contract[1]}`);
    });

    const response = {
        blockInfo: {
            number: parseInt(block.number, 16),
            timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString(),
            gasUsed: parseInt(block.gasUsed, 16),
        },
        mostActiveContracts: sortedContracts.map(([address, count]) => ({
            address,
            interactions: count
        }))
    };

    console.log("Analysis complete!");
    console.log("Final response:", JSON.stringify(response, null, 2));

    return response;
} 