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

// Utility: Load an image as Base64 (without the data prefix)
export const loadImageAsBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
