interface ReturnPokeType {
    index: Array<number>
    // TODO: This needs to be implemented as a nested interface
    data: any
    score: number
}
interface ClientRequest {
    score?: boolean
}

type ApiCall = ReturnPokeType | ClientRequest

export {ApiCall, ReturnPokeType}