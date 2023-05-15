import {ProofFormat} from "@veramo/credential-w3c";

export default interface Schema {
    id: string
    name: string
    version: string
    description: string
    attributes: string[]
    credential: {
        type: string[]
        context: string[]
        proofFormat: ProofFormat
    }
}
