import IdentifierDetails from "../models/IdentifierDetails";
import {selectIdentifierDetailById, updateIdentifierDetail} from "../redux/reducers/identifierDetailsSlice";
import store from "../redux/store/Store";
import {agent} from "../veramo/setup";
import {DIDResolutionResult, IService} from "@veramo/core";
import {showGreenSnackBar} from "./Snackbar";
import {Clipboard} from "react-native";
import {Settings} from "../models/Settings";

export const isTesting = (): boolean => {
    return store?.getState()?.agent?.isTesting
}

export const getDefaultDID = (): IdentifierDetails | undefined => {
    const defaultDID: string | undefined = store.getState().agent.defaultIdentifier;
    return selectIdentifierDetailById(store.getState(), defaultDID)
}

export const getSettings = (): Settings => {
    return store?.getState()?.agent?.settings
}

export const createIdentifier = async (name: string): Promise<IdentifierDetails | undefined> => {
    const bluetoothServiceEndpoint: string = store.getState().agent.bluetoothServiceEndpoint;
    const identifier = await agent.didManagerCreate({
        provider: 'did:key',
    })
    let didResolution: DIDResolutionResult = await agent.resolveDid({didUrl: identifier.did})
    let services = []
    if (bluetoothServiceEndpoint) {
        const service: IService = {
            id: '#1',
            type: 'DIDCommMessaging',
            serviceEndpoint: bluetoothServiceEndpoint
        }
        services.push(service)
    }
    return {
        did: identifier.did,
        name: name,
        provider: identifier.provider,
        alias: identifier.alias,
        keys: identifier.keys,
        services: services,
        didDocument: didResolution.didDocument ?? undefined,
        owned: true
    }
}

export const addBLEService = (identifierDetails: IdentifierDetails) => {
    const bluetoothServiceEndpoint: string = store.getState().agent.bluetoothServiceEndpoint;
    const service: IService = {
        id: '#' + (identifierDetails.services.length + 1),
        type: 'DIDCommMessaging',
        description: 'Used for BLE connection',
        serviceEndpoint: bluetoothServiceEndpoint
    }
    console.log(service)
    let services: IService[] = [...identifierDetails.services]
    services.push(service)
    store.dispatch(updateIdentifierDetail({
        id: identifierDetails.did,
        changes: {services: services},
    }))
    showGreenSnackBar('DIDComm Bluetooth LE messaging service added')
}

export const copyDIDToClipboard = (did: string | undefined) => {
    if (did) {
        Clipboard.setString(did)
        showGreenSnackBar('DID is copied to Clipboard')
    }
}

export const getDisplayName = (did: string | undefined): string => {
    if (did) {
        const identifierDetails: IdentifierDetails | undefined = selectIdentifierDetailById(store.getState(), did)
        let name = ''
        if (identifierDetails?.name) {
            name = identifierDetails.name
        } else if (identifierDetails?.did) {
            name = identifierDetails.did
        }
        return name
    }
    return 'Unknown'
}

export const getServiceUuidFromBleEndpoint = (bleEndpoint: string): string => {
    return bleEndpoint.substring(4)
}

