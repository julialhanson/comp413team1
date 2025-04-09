export const createQueryString = (
  params: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = new URLSearchParams(params).toString();
  return queryStr;
};
