export const createQueryString = (
  params: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = new URLSearchParams(params).toString();
  return queryStr;
};

// Create a unique filename
export const generateUniqueFilename = (fileOgName: string) => {
  const timestamp = Date.now();
  const [originalName, extension] = fileOgName.split(".");

  const filename = `${originalName}-${timestamp}.${extension}`;

  return filename;
};
