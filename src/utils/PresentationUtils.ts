import ConnectionDetails from "../models/ConnectionDetails";
import MessageDetails from "../models/MessageDetails";
import {v4 as uuidv4} from "uuid";
import Presentation, {CandidateCredential, PresentationStates} from "../models/Presentation";
import store from "../redux/store/Store";
import {InputDescriptor, PresentationDefinition} from "../models/PresentationDefinition";
import {addPresentation} from "../redux/reducers/presentationsSlice";
import {
    DescriptorMapObject,
    GeneratedPresentationSubmission,
    PresentationSubmission
} from "../models/PresentationSubmission";
import {agent} from "../veramo/setup";
import {JSONPath} from "jsonpath-plus";
import Ajv from "ajv"
import {PresentationPayload, VerifiablePresentation} from "@veramo/core";
import {VerifiableCredential} from "@veramo/core/src/types/vc-data-model";
import {verifyPresentation} from "./CredentialUtils";

export const createPresentation = (definition: PresentationDefinition, connection: ConnectionDetails, options?: {
    presentationId?: string,
    presentationState?: PresentationStates;
    onVerified?: Function,
    onDenied?: Function
}) => {
    let presentation: Presentation = {
        id: options?.presentationId || uuidv4(),
        state: options?.presentationState || PresentationStates.INITIAL,
        connection: connection,
        definition: definition,
        submission: undefined,
        onVerified: options?.onVerified,
        onDenied: options?.onDenied
    }
    store.dispatch(addPresentation(presentation))
    console.log('Presentation (' + presentation.id + '): Created and saved presentation')
    return presentation
}

export const presentationToRequest = (presentation: Presentation): MessageDetails => {
    let attachId = uuidv4()
    let requestBody = {
        "formats": [{
            "attach_id": attachId,
            "format": "dif/presentation-exchange/definition@v1.0"
        }]
    }
    let requestAttachment = {
        "id": attachId,
        "mime-type": "application/json",
        "data": {
            "json": {
                "options": {
                    "challenge": '' + uuidv4(),
                    "domain": "localhost"
                },
                "presentation_definition": presentation.definition
            }
        }
    }
    return {
        id: presentation.id,
        type: "https://didcomm.org/present-proof/2.0/request-presentation",
        from: presentation.connection.yourDID,
        to: presentation.connection.theirDID,
        created_time: Math.floor(Date.now() / 1000).toString(),
        body: requestBody,
        attachments: [requestAttachment]
    }
}

export const presentationToResponse = async (presentation: Presentation): Promise<MessageDetails> => {
    let attachId = uuidv4()
    let requestBody = {
        "formats": [{
            "attach_id": attachId,
            "format": "dif/presentation-exchange/submission@v1.0"
        }]
    }
    let unsignedPresentation: PresentationPayload = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://identity.foundation/presentation-exchange/submission/v1"
        ],
        "type": [
            "VerifiablePresentation",
            "PresentationSubmission"
        ],
        "issuanceDate": new Date().toUTCString(),
        "holder": presentation.connection.yourDID,
        "presentation_submission": presentation.submission?.presentationSubmission,
        "verifiableCredential": presentation.submission?.verifiableCredential,
    }
    let signedPresentation: VerifiablePresentation = await agent.createVerifiablePresentation({
        presentation: unsignedPresentation,
        proofFormat: 'lds',
        challenge: 'TEST_CHALLENGE_STRING'
    })
    let requestAttachment = {
        "id": attachId,
        "mime-type": "application/json",
        "data": {
            "json": signedPresentation
        }
    }
    return {
        id: uuidv4(),
        thid: presentation.id,
        type: "https://didcomm.org/present-proof/2.0/presentation",
        from: presentation.connection.yourDID,
        to: presentation.connection.theirDID,
        created_time: Math.floor(Date.now() / 1000).toString(),
        body: requestBody,
        attachments: [requestAttachment]
    }
}

export const validatePresentationSubmission = async (presentation: Presentation): Promise<boolean> => {
    if (presentation.definition && presentation.submission && presentation.vp) {
        if (!await verifyPresentation(presentation.vp)) {
            return false
        }
        let inputDescriptors = presentation.definition.input_descriptors
        let descriptorMap = presentation.submission.presentationSubmission.descriptor_map
        for (let inputDescriptor of inputDescriptors) {
            let isMissingDescriptorMapObject = true
            for (let descriptorMapObject of descriptorMap) {
                if (inputDescriptor.id == descriptorMapObject.id) {
                    isMissingDescriptorMapObject = false
                    const credentialResult = JSONPath({
                        path: descriptorMapObject['path'],
                        json: presentation.vp
                    });
                    let verifiableCredential: VerifiableCredential = credentialResult[0]
                    if (!validateCandidateCredential(inputDescriptor, verifiableCredential)) {
                        return false
                    }
                }
            }
            if (isMissingDescriptorMapObject) {
                console.log('Missing map object for this input descriptor')
                return false
            }
        }
        return true
    } else {
        console.log('Missing definition or submission')
        return false
    }
}

export const validateCandidateCredential = (inputDescriptor: InputDescriptor, credential: VerifiableCredential): boolean => {
    const ajv = new Ajv()
    let constraints = inputDescriptor.constraints
    if (constraints) {
        let fields = constraints.fields
        for (let field of fields) {
            let isValidField = false
            for (let path of field.path) {
                const result = JSONPath({
                    path: path,
                    json: credential
                });
                if (result) {
                    if (field.filter) {
                        let filterSchema = field.filter
                        // Check if credential matches the filter using JSON Schema
                        const validate = ajv.compile(filterSchema)
                        const valid = validate(result[0])
                        if (valid) {
                            isValidField = true
                            break // Exit path validation loop
                        } else {
                            console.log(validate.errors)
                        }
                    } else {
                        isValidField = true
                        break // Exit path validation loop
                    }
                }
            }
            if (!isValidField) {
                console.log('Credential is not valid for input descriptor = ' + inputDescriptor.id)
                return false
            }
        }
    }
    console.log('Credential is valid for input descriptor = ' + inputDescriptor.id)
    return true
}

export const findCandidateCredentials = (presentation: Presentation, credentials?: VerifiableCredential[]): CandidateCredential[] => {
    if (presentation?.definition && credentials) {
        let candidateCredentials: CandidateCredential[] = []
        for (let inputDescriptor of presentation.definition.input_descriptors) {
            let isCandidateFound = false
            for (let credential of credentials) {
                isCandidateFound = validateCandidateCredential(inputDescriptor, credential)
                if (isCandidateFound) {
                    candidateCredentials.push({
                        input_descriptor: inputDescriptor,
                        credential: credential
                    })
                    break // Break loop when one candidate is found for the input descriptor
                }
            }
            if (!isCandidateFound) {
                console.log('No candidate credential was found for input descriptor = ' + inputDescriptor.id)
                candidateCredentials.push({
                    input_descriptor: inputDescriptor,
                    credential: undefined
                })
            }
        }
        return candidateCredentials
    }
    return []
}
export const generatePresentationSubmission = (presentation: Presentation, candidateCredentials: CandidateCredential[]): GeneratedPresentationSubmission | undefined => {
    if (presentation.definition) {
        if (candidateCredentials) {
            let [descriptorMap, verifiableCredentials] = generateDescriptorMap(candidateCredentials)
            let presentationSubmission: PresentationSubmission = {
                id: uuidv4(),
                definition_id: presentation.definition?.id,
                descriptor_map: descriptorMap,
            }
            return {
                presentationSubmission: presentationSubmission,
                verifiableCredential: verifiableCredentials
            }
        } else {
            console.log('Missing required credentials needed for fulfilling the definition')
        }
    } else {
        console.log('Definition is undefined')
    }
}
export const generateDescriptorMap = (candidateCredentials: CandidateCredential[]): [DescriptorMapObject[], VerifiableCredential[]] => {
    let descriptorMap: DescriptorMapObject[] = []
    let verifiableCredentials: VerifiableCredential[] = []
    candidateCredentials.forEach((candidateCredential, index) => {
        if (candidateCredential.credential) {
            let dmo: DescriptorMapObject = {
                id: candidateCredential.input_descriptor.id,
                format: "ldp_vc",
                path: '$.verifiableCredential[' + index + ']'
            }
            descriptorMap.push(dmo)
            verifiableCredentials.push(candidateCredential.credential)
        } else {
            console.log('Failed to add object due to missing credential')
        }
    })
    return [descriptorMap, verifiableCredentials]
}
