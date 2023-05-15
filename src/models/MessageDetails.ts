import {DIDCommMessagePacking, IDIDCommMessage} from "@veramo/did-comm";

export default interface MessageDetails extends IDIDCommMessage {
    attachments?: Array<{ id?: string; description?: string; filename?: string; media_type?: string; format?: string; lastmod_time?: string; byte_count?: string; data: { jws?: any; hash?: string; links?: any; base64links?: any; json: any } }>;
    packingMode?: DIDCommMessagePacking
}
