declare var process: {
  env: {
    JWT_SECRET: string;
    PORT: number;
    DB_PORT: number;
    DB_USERNAME: string
    DB_NAME:string;
    DB_PASSWORD: string;
  };
};
export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT;
export const DB_PORT = process.env.DB_PORT
export const DB_USERNAME = process.env.DB_USERNAME
export const DB_NAME = process.env.DB_NAME
export const DB_PASSWORD = process.env.DB_PASSWORD
