import fs from 'fs';
import http from 'http';
import url from 'url';
import figlet from 'figlet';

import {fileTypes} from "./types/file";
import {asyncApi} from "./api";
import {ReturnPokeType, ClientRequest} from "./types/apiInterface";

const server: http.Server = http.createServer(serverListener);

async function serverListener(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const base: string = 'http://' + req.headers.host + '/';
    const fullURL: url.URL = new url.URL(req.url, base);
    const page: string = fullURL.pathname;
    const params: URLSearchParams = fullURL.searchParams;

    if (page === "/api") {
        await handleFile(undefined, undefined, res, undefined, params);
    } else{
        await returnFile(page, res);
    }
}

async function returnFile(tmpFile: string, res: http.ServerResponse): Promise<void> {
    const file_name: string = (tmpFile === "/") ? "/index.html" : tmpFile;
    try {
        const data: Buffer = await fs.promises.readFile(`public${file_name}`);
        await handleFile(undefined, data, res, file_name);
    } catch {
        figlet('404!!', (err, data) => handleFile(err, data, res, file_name));
    }


}

async function handleFile(err: NodeJS.ErrnoException| undefined, data: Buffer | string | undefined, res: http.ServerResponse,
                          file?: string, params?: URLSearchParams): Promise<void> {
    if (data instanceof Buffer){
        await handleResponse(undefined, data, undefined, res, file, true);
    } else if (params){
        await handleResponse(err, undefined, params, res, file, false);
    } else {
        await handleResponse(err, undefined, undefined, res, file, false);
    }
}

async function handleResponse(err: NodeJS.ErrnoException | undefined, data: Buffer, params: URLSearchParams | undefined,
                              res: http.ServerResponse, file: string, success: boolean): Promise<void> {

    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    } else if (success){
        const suffix: string = (!params)? file.split('.')[1]: "json";
        const cType: string  = (fileTypes[suffix])? fileTypes[suffix]: "";
        res.writeHead(200, {'Content-Type': cType});

    } else {
        res.writeHead(404, {});
    }
    if (!params) {
        res.end(data);
    } else {
        const result: ReturnPokeType | ClientRequest = await asyncApi(params);
        res.end(JSON.stringify(result));
    }
}

server.listen(process.env.PORT || 8080);
