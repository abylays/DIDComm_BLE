import ConnectionDetails from "./ConnectionDetails";
import {IService} from "@veramo/core";
import {IPackedDIDCommMessage} from "@veramo/did-comm";

export default interface Invitation {
    id: string
    state: InvitationStates
    created?: string
    expires?: string
    from?: string
    label?: string
    multi?: boolean
    goalCode?: string
    goal?: string
    attachments?: string
    serviceEndpoints: Array<IService> | any,
    handshakeProtocol?: string
    connectionDID?: string,
    invitationMessage?: IPackedDIDCommMessage
    onAccepted?: (connection: ConnectionDetails) => void // Function to run when invitation is accepted
}

export enum InvitationStates {
    INITIAL = 'initial',
    PREPARE_RESPONSE = 'prepare-response',
    AWAIT_RESPONSE = 'await-response',
    DONE = 'done'
}
