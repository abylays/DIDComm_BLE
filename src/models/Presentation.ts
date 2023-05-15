import {InputDescriptor, PresentationDefinition} from "./PresentationDefinition";
import {GeneratedPresentationSubmission} from "./PresentationSubmission";
import ConnectionDetails from "./ConnectionDetails";
import {VerifiableCredential, VerifiablePresentation} from "@veramo/core/src/types/vc-data-model";

export default interface Presentation {
    id: string
    state: PresentationStates
    connection: ConnectionDetails // Connection to use for this presentation
    onVerified?: Function // Function to run when successfully verified
    onDenied?: Function // Function to run when failed to verify
    definition?: PresentationDefinition
    submission?: GeneratedPresentationSubmission
    vp?: VerifiablePresentation
}

export interface CandidateCredential {
    input_descriptor: InputDescriptor
    credential?: VerifiableCredential
}

export enum PresentationStates {
    INITIAL = 'initial',
    REQUEST_SENT = 'request-sent',
    REQUEST_RECEIVED = 'request-received',
    PRESENTATION_SENT = 'presentation-sent',
    PRESENTATION_RECEIVED = 'presentation-received',
    DONE = 'done'
}
