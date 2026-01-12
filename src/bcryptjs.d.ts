declare module "bcryptjs" {
  export interface HashOptions {
    salt: number;
  }
  function hash(data: string, salt: number, callback?: (err: any, hash: string) => void): Promise<string>;
  function compare(data: string, encrypted: string, callback?: (err: any, res: boolean) => void): Promise<boolean>;
}
