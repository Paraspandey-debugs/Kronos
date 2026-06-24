async function main() {
  console.log("Submitting dynamic payload workflow to Gateway...");

  try {
    const response = await fetch('http://localhost:3000/api/v1/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        steps: [
          { agentType: 'scout', payload: { target: 'example.com' } },
          { agentType: 'echo', payload: { received: '$step_0.findings' } }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Failed to create workflow:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("Success! Workflow created:", JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Error connecting to gateway:", error.message);
  }
}

main();
