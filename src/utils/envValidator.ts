import Logger from "../libs/logger";



const RequiredEnvs = [
  "PORT",
  "APP_NAME",
  "DB_URL",
  "BASE_URL",
  "NODE_ENV",
];

const getEnv = (variable: string, optional = false) => {
  if (process.env[variable] === undefined) {
    if (optional) {
      const erMsg = `Environmental variable for ${variable} is not supplied. \n So a default value will be generated for you.`;
      Logger.warn(erMsg);
      return null;
    } else {
      const erMsg = `Environmental variable for  ${variable} is required`;
      Logger.error(erMsg);
      return erMsg;
    }
  }
  return null;
};

const ValidateEnvs = async () => {
  const errors = [];
  for (const env of RequiredEnvs) {
    const value = env;
    const err = getEnv(value);
    if (err) errors.push(err);
  }
  if (errors.length > 0) {
    Logger.error(`${errors.length} Environmental Variable(s) are required...`);
    process.exit();
  }
};

export { ValidateEnvs };
