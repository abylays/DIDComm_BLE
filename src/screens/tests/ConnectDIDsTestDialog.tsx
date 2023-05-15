import * as React from "react";
import {useState} from "react";
import {View} from "react-native";
import {Button, Dialog, List, Portal} from "react-native-paper";
import {connectionServer, messageHandler} from "../../protocols/Protocols";
import ConnectionDetails from "../../models/ConnectionDetails";
import IdentifierDetails from "../../models/IdentifierDetails";
import {getDisplayName} from "../../utils/AgentUtils";
import {showGreenSnackBar} from "../../utils/Snackbar";
import {createConnectInvitation} from "../../utils/ConnectionUtils";
import {useSelector} from "react-redux";
import {selectAllConnection, selectConnectionById} from "../../redux/reducers/connectionsSlice";
import DropDown from "react-native-paper-dropdown";
import store from "../../redux/store/Store";
import {selectIdentifierDetailById} from "../../redux/reducers/identifierDetailsSlice";

export const ConnectDIDsTestDialog = ({
                                          visible,
                                          setVisible
                                      }: { visible: boolean, setVisible: (visible: boolean) => void }) => {

    const [invitationsCompleted, setInvitationsCompleted] = useState<number>(0);

    const [connectionId, setConnectionId] = React.useState<string>('');
    const [showDropDownConnection, setShowDropDownConnection] = useState(false);
    const possibleConnections: { label: string, value: string }[] = useSelector(selectAllConnection).filter((connection) => connection.state == 'completed').map((possibleConnections) => {
        return {
            label: getDisplayName(possibleConnections.theirDID!),
            value: possibleConnections.id
        }
    })

    const sendInvitationTest = (connection: ConnectionDetails, identifierDetails: IdentifierDetails) => {
        const onAccepted = async (connection: ConnectionDetails) => {
            console.log('Invitation (' + invitation?.id + '): Successfully completed')
            showGreenSnackBar('Invitation (' + invitation?.id + '): Successfully completed')
            let invitationsCompleted: number
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve()
                }, 5000)
            })
            setInvitationsCompleted(prevState => {
                invitationsCompleted = prevState + 1
                console.log('invitationsCompleted: ' + invitationsCompleted)
                if (invitationsCompleted < 100) {
                    sendInvitationTest(connection, identifierDetails)
                }
                return invitationsCompleted
            })
        }
        let invitation = createConnectInvitation(identifierDetails, onAccepted)
        if (invitation) {
            connectionServer.sendInvitation(invitation, connection.theirDID)
        }
    }


    return (
        <View>
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Send connection invitations</Dialog.Title>
                    <Dialog.Content>
                        <List.Item
                            title="bluetoothClientConnectedDevice"
                            descriptionNumberOfLines={5}
                            description={JSON.stringify(messageHandler.bluetoothClient.connectedDevice)}/>
                        <List.Item
                            title="bluetoothServerConnectedDevice"
                            descriptionNumberOfLines={5}
                            description={JSON.stringify(messageHandler.bluetoothServer.connectedDevice)}/>
                        <List.Item
                            title="invitationsCompleted"
                            description={JSON.stringify(invitationsCompleted)}/>
                        <View>
                            <DropDown
                                label={"Select connection to use for sending"}
                                mode={"outlined"}
                                visible={showDropDownConnection}
                                showDropDown={() => setShowDropDownConnection(true)}
                                onDismiss={() => setShowDropDownConnection(false)}
                                value={connectionId}
                                setValue={setConnectionId}
                                list={possibleConnections}
                            />
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setVisible(false)
                        }}>Cancel</Button>
                        <Button onPress={async () => {
                            let connection: ConnectionDetails | undefined = selectConnectionById(store.getState(), connectionId)
                            setInvitationsCompleted(0)
                            if (connection) {
                                const identifierDetails: IdentifierDetails | undefined = selectIdentifierDetailById(store.getState(), connection?.yourDID)
                                if (identifierDetails) {
                                    sendInvitationTest(connection, identifierDetails)
                                }
                            }
                        }}>Start</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}
