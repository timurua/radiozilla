import { Configuration } from "./api/configuration";
import { DefaultApi } from "./api";

const port = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? ":8000" : "";
export const basePath = `${window.location.protocol}//${window.location.hostname}${port}`
export const wsPath = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}${port}`

export const configuration = new Configuration({
    basePath: basePath,
    baseOptions: {
        headers: {
        }
    }
  });

export default new DefaultApi(configuration);