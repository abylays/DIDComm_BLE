export default interface ConnectionDetails {
    id: string;
    state: ConnectionStates;
    yourDID: string;
    theirDID: string;
    invitationId: string
}

export enum ConnectionStates {
    INITIAL = 'initial',
    INVITATION_RECEIVED = 'invitation-received',
    REQUEST_SENT = 'request-sent',
    REQUEST_RECEIVED = 'request-received',
    RESPONSE_SENT = 'response-sent',
    RESPONSE_RECEIVED = 'response-received',
    COMPLETED = 'completed',
}
