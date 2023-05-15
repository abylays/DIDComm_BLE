import {
    findCandidateCredentials,
    generatePresentationSubmission,
    presentationToResponse,
    validatePresentationSubmission
} from "../src/utils/PresentationUtils";
import {PresentationDefinition} from "../src/models/PresentationDefinition";
import Presentation, {CandidateCredential, PresentationStates} from "../src/models/Presentation";
import {GeneratedPresentationSubmission} from "../src/models/PresentationSubmission";
import {v4 as uuidv4} from "uuid";
import ConnectionDetails, {ConnectionStates} from "../src/models/ConnectionDetails";
import * as constants from "../src/veramo/setup";
import {agent} from "../src/veramo/setup";
import {testAgent} from "../src/veramo/testSetup";
import {getConnection} from "typeorm/globals";
import {CredentialPayload} from "@veramo/core/src/types/vc-data-model";
import {PresentationPayload, VerifiableCredential, VerifiablePresentation} from "@veramo/core";

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-qrcode-scanner', () => jest.fn());

let did: string
let signedCredentialLD: VerifiableCredential
let tamperedSignedCredentialLD: VerifiableCredential

beforeAll(async () => {
    Object.defineProperty(constants, 'agent', {value: testAgent})
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
    await new Promise<void>(resolve => {
        agent.didManagerCreate({
            provider: 'did:key'
        }).then(async identifier => {
            expect(identifier).toHaveProperty('did')
            did = identifier.did
            let unsignedCredential: CredentialPayload =
                {
                    issuer: {id: identifier.did},
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/contexts/acvc/v1'],
                    type: ['VerifiableCredential', 'AccessControl'],
                    issuanceDate: new Date().toISOString(),
                    credentialSchema: {"id": "ae8aba09-a8f6-4962-aa7c-8e323c7ef597", "type": "JsonSchemaValidator2018"},
                    credentialSubject: {
                        name: 'Firstname Lastname',
                        role: 'Admin'
                    },
                }
            signedCredentialLD = await agent.createVerifiableCredential({
                credential: unsignedCredential,
                proofFormat: 'lds'
            })
            let isCredentialLDValid = await agent.verifyCredential({
                credential: signedCredentialLD
            })
            expect(isCredentialLDValid).toBe(true)

            tamperedSignedCredentialLD = JSON.parse(JSON.stringify(signedCredentialLD))
            tamperedSignedCredentialLD.credentialSubject.name = ''
            resolve()
        })
    })
});
afterAll(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
        const repository = getConnection().getRepository(entity.name); // Get repository
        await repository.clear(); // Clear each entity table's content
    }
});

it('Validate LD presentation', async () => {
    let unsignedPresentation: PresentationPayload = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
        ],
        "type": [
            "VerifiablePresentation"
        ],
        "issuanceDate": new Date().toUTCString(),
        "holder": did,
        "verifiableCredential": [signedCredentialLD],
    }
    let signedPresentationLD: VerifiablePresentation = await agent.createVerifiablePresentation({
        presentation: unsignedPresentation,
        proofFormat: 'lds',
        challenge: '123',
        domain: 'localhost'
    })
    let isPresentationValid = await agent.verifyPresentation({
        presentation: signedPresentationLD,
        challenge: '123',
        domain: 'localhost'
    })
    expect(isPresentationValid).toBe(true)

    for (let vc of signedPresentationLD.verifiableCredential!) {
        let isCredentialValid = await agent.verifyCredential({
            credential: vc,
        })
        expect(isCredentialValid).toBe(true)
    }
})

it('Validate LD presentation with tampered credentials', async () => {
    let unsignedPresentation: PresentationPayload = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
        ],
        "type": [
            "VerifiablePresentation"
        ],
        "issuanceDate": new Date().toUTCString(),
        "holder": did,
        "verifiableCredential": [tamperedSignedCredentialLD],
    }
    let signedPresentationLD: VerifiablePresentation = await agent.createVerifiablePresentation({
        presentation: unsignedPresentation,
        proofFormat: 'lds',
        challenge: '123',
        domain: 'localhost'
    })
    let isPresentationValid
    try {
        isPresentationValid = await agent.verifyPresentation({
            presentation: signedPresentationLD,
            challenge: '123',
            domain: 'localhost'
        })
    } catch (e) {
        isPresentationValid = false
    }
    expect(isPresentationValid).toBe(false)


    let isCredentialValid
    try {
        isCredentialValid = await agent.verifyCredential({
            credential: tamperedSignedCredentialLD
        })
    } catch (e) {
        isCredentialValid = false
    }
    expect(isCredentialValid).toBe(false)
})

it('Validate LD presentation submission', async () => {
    let definition: PresentationDefinition = {
        "id": "505b8d87-7c7a-4a99-ad59-835e1ac397d3",
        "name": "Test schema Definition",
        "purpose": "",
        "input_descriptors": [{
            "id": "7bc332a4-e059-415e-a5cd-5f6beffe6f81",
            "name": "Test schema Descriptor",
            "purpose": "desc",
            "constraints": {
                "fields": [{
                    "filter": {"type": "string", "pattern": "ae8aba09-a8f6-4962-aa7c-8e323c7ef597"},
                    "path": ["$.credentialSchema.id"],
                    "purpose": "Get schema with matching id"
                }]
            }
        }]
    }
    let connection: ConnectionDetails = {
        id: "",
        invitationId: "",
        state: ConnectionStates.COMPLETED,
        yourDID: did,
        theirDID: did
    }
    let presentation: Presentation = {
        id: uuidv4(),
        state: PresentationStates.INITIAL,
        connection: connection,
        definition: definition,
        submission: undefined,
    }
    let candidateCredentials: CandidateCredential[] = findCandidateCredentials(presentation, [signedCredentialLD])
    expect(candidateCredentials).toHaveLength(1)
    let generatedPresentationSubmission: GeneratedPresentationSubmission | undefined = generatePresentationSubmission(presentation, candidateCredentials)
    expect(generatedPresentationSubmission).toBeDefined()

    presentation.submission = generatedPresentationSubmission
    let messageToSend = await presentationToResponse(presentation)
    presentation.vp = messageToSend.attachments![0].data.json
    expect(typeof presentation.vp).toBe("object")

    let isValid = await validatePresentationSubmission(presentation)
    expect(isValid).toBe(true)
})
