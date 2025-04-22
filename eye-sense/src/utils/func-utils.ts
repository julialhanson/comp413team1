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

// // Utility: Load an image as Base64 (without the data prefix)
// export const loadImageAsBase64 = async (url: string): Promise<string> => {
//   // const res = await fetch(url);
//   // console.log(res);
//   // const blob = await res.blob();
//   const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
//   const response = await fetch(proxyUrl);
//   const blob = await response.blob();

//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (reader.result && typeof reader.result === "string") {
//         const base64data = reader.result.split(",")[1];
//         resolve(base64data);
//       }
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// };

export const getFilenameFromSignedUrl = (signedUrl: string | undefined) => {
  if (!signedUrl) return "";

  const questionMarkIdx = signedUrl.indexOf("?");
  const baseUrlWithFilename = signedUrl.substring(0, questionMarkIdx);
  const lastSlashIdx = baseUrlWithFilename.lastIndexOf("/");
  const filename = baseUrlWithFilename.substring(lastSlashIdx + 1);
  console.log("found filename", filename);
  return filename;
};
