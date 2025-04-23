export const createQueryString = (
  params: string[][] | Record<string, string> | string | URLSearchParams
) => {
  const queryStr = new URLSearchParams(params).toString();
  return queryStr;
};

export const getDisplayRoleToRole = (): {[index: string]: string} => {
  return {
    "layman": "Layman",
    "student": "Medical student",
    "resident": "Resident",
    "nurse": "Nurse",
    "doctor": "Doctor"
  };
}