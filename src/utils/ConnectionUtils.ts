import {v4 as uuidv4} from "uuid";
import Invitation, {InvitationStates} from "../models/Invitation";
import base64url from "base64url";
import {addInvitation, selectInvitationById} from "../redux/reducers/invitationSlice";
import store from "../redux/store/Store";
import ConnectionDetails, {ConnectionStates} from "../models/ConnectionDetails";
import IdentifierDetails from "../models/IdentifierDetails";
import {selectIdentifierDetailById} from "../redux/reducers/identifierDetailsSlice";
import {
    addConnection,
    selectAllConnection,
    selectConnectionById,
    updateConnection
} from "../redux/reducers/connectionsSlice";
import MessageDetails from "../models/MessageDetails";
import {showRedSnackBar} from "./Snackbar";
import {PresentationDefinition} from "../models/PresentationDefinition";
import {connectionClient} from "../protocols/Protocols";
import {getDefaultDID, getSettings} from "./AgentUtils";

export const saveInvitation = (options: Partial<Invitation>): Invitation | undefined => {
    const defaultDID: IdentifierDetails | undefined = getDefaultDID()
    if (defaultDID) {
        let invitation: Invitation = {
            id: options?.id || uuidv4(),
            attachments: options?.attachments,
            created: options?.created,
            expires: options?.expires,
            from: options?.from,
            label: options?.label,
            goalCode: options?.goalCode,
            goal: options?.goal,
            multi: options?.multi,
            state: options?.state || InvitationStates.INITIAL,
            serviceEndpoints: options?.serviceEndpoints,
            handshakeProtocol: "https://didcomm.org/didexchange/1.0",
            connectionDID: options?.connectionDID || defaultDID.did,
            invitationMessage: options?.invitationMessage,

            onAccepted: options?.onAccepted,
        }
        store.dispatch(addInvitation(invitation))
        console.log('Created & saved invitation id: ' + invitation.id)
        return selectInvitationById(store.getState(), invitation.id)!
    }
}

export const createConnectInvitation = (connectionDID: IdentifierDetails, onAccepted?: (connection: ConnectionDetails) => void) => {
    return saveInvitation({
        from: connectionDID.did,
        connectionDID: connectionDID.did,
        serviceEndpoints: connectionDID.services,
        label: connectionDID.name,
        goalCode: "p2p-messaging",
        goal: "Establish a peer-to-peer connection",
        multi: getSettings().allowMulti,
        onAccepted: onAccepted
    })
}

export const createProofInvitation = (connectionDID: IdentifierDetails, definition: PresentationDefinition, onAccepted?: (connection: ConnectionDetails) => void) => {
    return saveInvitation({
        from: connectionDID.did,
        connectionDID: connectionDID.did,
        serviceEndpoints: connectionDID.services,
        label: connectionDID.name,
        goalCode: "request-proof",
        goal: "Request a presentation",
        multi: getSettings().allowMulti,
        onAccepted: onAccepted
    })
}

export const createConnection = (connection: ConnectionDetails) => {
    store.dispatch(addConnection(connection))
    console.log('Created & saved connection id: ' + connection.id)
    return connection
}

export const invitationToMessage = (invitation: Invitation): MessageDetails => {
    let invitationBody = {
        "services": [invitation.serviceEndpoints[0]]
    }
    // @ts-ignore
    return {
        id: invitation.id,
        type: "https://didcomm.org/out-of-band/1.0/invitation",
        from: invitation?.from,
        body: invitationBody
    }
}
export const connectionToRequest = (connection: ConnectionDetails): MessageDetails | undefined => {
    if (connection.yourDID) {
        const identifierDetails: IdentifierDetails | undefined = selectIdentifierDetailById(store.getState(), connection.yourDID)
        if (identifierDetails) {
            let requestBody = {
                "label": identifierDetails.name,
                "did": identifierDetails.did,
                "did_doc": getDidDoc(identifierDetails)
            }
            return {
                id: connection.id,
                thid: connection.id,
                pthid: connection.invitationId,
                type: "https://didcomm.org/didexchange/1.0/request",
                from: connection.yourDID,
                to: connection.theirDID,
                created_time: Math.floor(Date.now() / 1000).toString(),
                body: requestBody
            }
        }
    }
}

export const connectionToResponse = (connection: ConnectionDetails): MessageDetails | undefined => {
    if (connection.yourDID) {
        const identifierDetails: IdentifierDetails | undefined = selectIdentifierDetailById(store.getState(), connection.yourDID)
        if (identifierDetails) {
            let responseBody = {
                "label": identifierDetails.name,
                "did": identifierDetails.did,
                "did_doc": getDidDoc(identifierDetails)
            }
            return {
                id: uuidv4(),
                thid: connection.id,
                type: "https://didcomm.org/didexchange/1.0/response",
                from: connection.yourDID,
                to: connection.theirDID,
                created_time: Math.floor(Date.now() / 1000).toString(),
                body: responseBody
            }
        }
    }
}

export const connectionToComplete = (connection: ConnectionDetails): MessageDetails => {
    return {
        id: uuidv4(),
        thid: connection.id,
        pthid: connection.invitationId,
        type: "https://didcomm.org/didexchange/1.0/complete",
        from: connection.yourDID,
        to: connection.theirDID,
        created_time: Math.floor(Date.now() / 1000).toString(),
        body: {}
    }
}

export const connectionToReuse = (connection: ConnectionDetails): MessageDetails => {
    return {
        id: uuidv4(),
        pthid: connection.invitationId,
        type: "https://didcomm.org/out-of-band/1.0/handshake-reuse",
        from: connection.yourDID,
        to: connection.theirDID,
        created_time: Math.floor(Date.now() / 1000).toString(),
        body: {}
    }
}

export const connectionToReuseAccepted = (connection: ConnectionDetails, reuseMessageId: string): MessageDetails => {
    return {
        id: uuidv4(),
        thid: reuseMessageId,
        pthid: connection.invitationId,
        type: "https://didcomm.org/out-of-band/1.0/handshake-reuse-accepted",
        from: connection.yourDID,
        to: connection.theirDID,
        created_time: Math.floor(Date.now() / 1000).toString(),
        body: {}
    }
}

const getDidDoc = (identifierDetails: IdentifierDetails) => {
    let didDocument = {...identifierDetails.didDocument}
    didDocument.service = identifierDetails.services
    return didDocument
}

export const base64urlEncodeMessage = (message: string): string => {
    return base64url.encode(message)
}

export const base64urlDecodeMessage = (encodedMessage: string): string => {
    return base64url.decode(encodedMessage)
}

export const getOobUrl = (base64urlEncodedMessage: string): string => {
    return 'https://localhost/inv?_oob=' + base64urlEncodedMessage
}

export const getBase64urlEncodedMessageFromOobUrl = (oobUrl: string): string | null => {
    let name = '_oob'
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    const regexS = "[\\?&]" + name + "=([^&#]*)";
    const regex = new RegExp(regexS);
    const results = regex.exec(oobUrl);
    return results == null ? null : results[1];
}

export const findExistingConnection = (invitation: Invitation): ConnectionDetails | undefined => {
    let existingConnection: ConnectionDetails | undefined
    if (invitation.from) {
        existingConnection = selectAllConnection(store.getState()).filter((connection) => connection.state == 'completed').find((connection) => {
            if (invitation.from === connection.theirDID) {
                return connection
            }
        })
    }
    return existingConnection
}

export async function respondToInvitation(invitation: Invitation): Promise<boolean> {
    // Try to determine if an existing connection can be used if reuse is enabled, if not send request here
    if (getSettings().allowReuses) {
        let existingConnection: ConnectionDetails | undefined = findExistingConnection(invitation)
        if (existingConnection) {
            console.log('Existing connection is found: Send connection reuse for invitation')
            store.dispatch(updateConnection({
                id: existingConnection.id,
                changes: {invitationId: invitation.id},
            }))
            let updatedExistingConnection: ConnectionDetails = selectConnectionById(store.getState(), existingConnection.id)!
            return connectionClient.sendReuse(updatedExistingConnection)
        }
    }
    console.log('Existing connection cannot be found or is disabled: Send connection request for invitation')
    // Send connection request for invitation
    if (invitation.connectionDID) {
        let connection: ConnectionDetails = createConnection({
            id: uuidv4(),
            invitationId: invitation.id,
            state: ConnectionStates.INVITATION_RECEIVED,
            theirDID: invitation?.from || '',
            yourDID: invitation.connectionDID

        })
        return connectionClient.sendRequest(connection);
    } else {
        showRedSnackBar('Connection DID is undefined')
    }
    return false
}
