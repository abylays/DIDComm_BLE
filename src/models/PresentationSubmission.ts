import {W3CVerifiableCredential} from "@veramo/core/src/types/vc-data-model";

export interface GeneratedPresentationSubmission {
    presentationSubmission: PresentationSubmission
    verifiableCredential?: W3CVerifiableCredential[]
}

export interface PresentationSubmission {
    id: string
    definition_id: string
    descriptor_map: DescriptorMapObject[]
}

export interface DescriptorMapObject {
    id: string
    format: string
    path: string
}
