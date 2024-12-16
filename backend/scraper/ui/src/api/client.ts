import { Configuration } from "./configuration";
import { DefaultApi } from "./api";

const port = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? ":8001" : "";
const url = `${window.location.protocol}//${window.location.hostname}${port}`

export const configuration = new Configuration({
    basePath: url,
    baseOptions: {
        headers: {
        }
    }
  });

export default new DefaultApi(configuration);