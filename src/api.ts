import fetch, {Headers, HeadersInit} from "node-fetch";
import {ReturnPokeType, ClientRequest} from "./types/apiInterface";

function randomize(): number {
    return Math.ceil(Math.random() * 100);

}

//TODO: fix data return type
async function returnPokes(): Promise<ReturnPokeType> {
    let index: Array<number> = [...(new Array(16)).keys()];
    const headers: HeadersInit = new Headers({'x-api-key': process.env.API_KEY});
    const resp = await fetch(`https://api.pokemontcg.io/v2/cards?q=supertype:pokemon&pageSize=8&page=${randomize()}`,
        {
            headers: headers,
            method: 'GET',
        });
    // TODO: Redo type info
    const json: any = await resp.json();
    let shuffling_index = json.data.map(_ => {
        let ret: Array<number> = [];
        for (let i = 2; i--;) {
            const num: number = Math.floor(Math.random() * ((index.length === 0) ? 0 : index.length - 1));
            const rand: number = index[num];
            index.splice(num, 1);
            ret.push(rand);
        }
        return ret;
    })
    return {
        index: shuffling_index,
        data: json,
        score: 0,
    };
}

function comparePokes(arr: Array<string>): boolean {
    return arr[0] === arr[1];
}

async function asyncApi(params: URLSearchParams): Promise<ClientRequest | ReturnPokeType> {
    if (params.get("startgame")) {
        return await returnPokes();
    } else if (params.get("choice")) {
        const decoded: string = decodeURIComponent(params.get("choice"));
        const arr: Array<string> = JSON.parse(decoded);
        return {score: comparePokes(arr)};
    } else {
        // Bad request, return empty object.
        return {};
    }
}

export {asyncApi}