export const compressorHandler = async (payload: any) => {
  console.log(` Compressing data for: ${payload.file || 'unknown'}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    compressionRatio: '60%',
    status: 'success',
  };
};
