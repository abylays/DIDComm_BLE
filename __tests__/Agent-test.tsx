import {v4 as uuidv4} from "uuid";
import store from "../src/redux/store/Store";
import Invitation, {InvitationStates} from "../src/models/Invitation";
import {addInvitation} from "../src/redux/reducers/invitationSlice";
import {getServiceUuidFromBleEndpoint} from "../src/utils/AgentUtils";

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-qrcode-scanner', () => jest.fn());

describe('Agent', () => {
    it('Get ServiceUuid from BleEndpoint', async () => {
        const uuid = uuidv4()
        const bleEndpoint = 'ble/' + uuid
        expect(getServiceUuidFromBleEndpoint(bleEndpoint)).toBe(uuid)
    })
})

describe('Invitations', () => {
    it('Invitations should initially be an empty list', () => {
        const state = store.getState()
        expect(state.invitations.ids).toEqual([])
    })
    it('Add one invitation', () => {
        let invitation: Invitation = {
            attachments: "",
            created: "",
            expires: "",
            goal: "",
            goalCode: "",
            id: "123",
            multi: false,
            serviceEndpoints: undefined,
            state: InvitationStates.INITIAL
        }
        store.dispatch(addInvitation(invitation))
        const state = store.getState()
        expect(state.invitations.ids).toEqual(["123"])
    })
})

