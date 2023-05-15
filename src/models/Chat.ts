import ConnectionDetails from "./ConnectionDetails";
import MessageDetails from "./MessageDetails";
import {DIDCommMessagePacking} from "@veramo/did-comm";

export default interface Chat {
    id: string
    yourDID: string
    theirDID: string
    yourMessages: MessageDetails[]
    theirMessages: MessageDetails[]
    connection?: ConnectionDetails
    lastMessage?: MessageDetails
    packingMode: DIDCommMessagePacking
}
