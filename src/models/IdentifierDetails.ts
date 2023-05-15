import {DIDDocument, IIdentifier} from "@veramo/core";

export default interface IdentifierDetails extends IIdentifier {
    name?: string
    didDocument?: DIDDocument
    owned: boolean
}
