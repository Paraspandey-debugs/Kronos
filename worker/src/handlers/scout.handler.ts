export const scoutHandler = async (payload: any) => {
  console.log(` Scouting target: ${payload.target}`);
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    findings: `Found leads for ${payload.target}`,
    score: Math.floor(Math.random() * 100),
  };
};
