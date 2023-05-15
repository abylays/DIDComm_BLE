import {VerifiableCredential} from "@veramo/core";

export default interface CredentialDetails {
    id: string
    verifiableCredential: VerifiableCredential
    credentialSchema?: { id: string, type: string }
    issued?: boolean
}
