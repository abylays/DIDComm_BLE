import * as React from "react";
import {useState} from "react";
import {useSelector} from "react-redux";
import {selectAllConnection, selectConnectionById} from "../../redux/reducers/connectionsSlice";
import {getDisplayName} from "../../utils/AgentUtils";
import {View} from "react-native";
import {Button, Dialog, List, Portal} from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import ConnectionDetails from "../../models/ConnectionDetails";
import store from "../../redux/store/Store";
import {connectionServer, messageHandler, verifierService} from "../../protocols/Protocols";
import {createPresentation} from "../../utils/PresentationUtils";
import {PresentationDefinition} from "../../models/PresentationDefinition";
import {selectAllDefinitions, selectDefinitionById} from "../../redux/reducers/DefinitionsSlice";
import {showGreenSnackBar} from "../../utils/Snackbar";
import performance from "react-native-performance";
import {createProofInvitation} from "../../utils/ConnectionUtils";
import IdentifierDetails from "../../models/IdentifierDetails";
import {selectIdentifierDetailById} from "../../redux/reducers/identifierDetailsSlice";

export const PresentationTestDialog = ({
                                           visible,
                                           setVisible
                                       }: { visible: boolean, setVisible: (visible: boolean) => void }) => {


    const [invitationsCompleted, setInvitationsCompleted] = useState<number>(0);
    const [presentationsCompleted, setPresentationsCompleted] = useState<number>(0);

    const [connectionId, setConnectionId] = React.useState<string>('');
    const [showDropDownConnection, setShowDropDownConnection] = useState(false);
    const possibleConnections: { label: string, value: string }[] = useSelector(selectAllConnection).filter((connection) => connection.state == 'completed').map((possibleConnections) => {
        return {
            label: getDisplayName(possibleConnections.theirDID!),
            value: possibleConnections.id
        }
    })
    const definitions: PresentationDefinition[] = selectAllDefinitions(store.getState())
    const [definitionId, setDefinitionId] = React.useState("");
    const [showDropDownDefinition, setShowDropDownDefinition] = useState(false);
    const possibleDefinitions: { label: string, value: string }[] = definitions.map((possibleDefinition: PresentationDefinition) => {
        return {
            label: possibleDefinition.name,
            value: possibleDefinition.id
        }
    })

    let testId: number = 0

    const sendInvitationTest = (connection: ConnectionDetails, definition: PresentationDefinition, identifierDetails: IdentifierDetails) => {
        testId++
        const onAccepted = async (connection: ConnectionDetails) => {
            performance.measure('onAcceptedMeasure', {start: 'createProofInvitationMark:' + testId});
            console.log('Invitation (' + invitation?.id + '): Successfully completed')
            showGreenSnackBar('Invitation (' + invitation?.id + '): Successfully completed')

            let invitationsCompleted: number
            setInvitationsCompleted(prevState => {
                invitationsCompleted = prevState + 1
                console.log('invitationsCompleted: ' + invitationsCompleted)
                return invitationsCompleted
            })

            // Send presentation request here
            if (definition) {
                let presentation = createPresentation(definition, connection, {
                    onVerified: async () => {
                        performance.measure('onVerifiedPresentationMeasure', {start: 'createProofInvitationMark:' + testId});
                        console.log('Successfully verified presentation id = ' + presentation.id)
                        showGreenSnackBar('Successfully verified presentation id = ' + presentation.id)

                        let presentationsCompleted: number
                        await new Promise<void>(resolve => {
                            setTimeout(() => {
                                resolve()
                            }, 5000)
                        })
                        setPresentationsCompleted(prevState => {
                            presentationsCompleted = prevState + 1
                            console.log('presentationsCompleted: ' + presentationsCompleted)
                            if (presentationsCompleted < 100) {
                                sendInvitationTest(connection, definition, identifierDetails)
                            }
                            return presentationsCompleted
                        })
                    }
                })
                console.log('Presentation (' + presentation.id + '): Sending presentation request')
                verifierService.sendPresentationRequest(presentation)
            }
        }
        performance.mark('createProofInvitationMark:' + testId);
        let invitation = createProofInvitation(identifierDetails, definition, onAccepted)
        if (invitation) {
            connectionServer.sendInvitation(invitation, connection.theirDID)
        }
    }

    return (
        <View>
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Send presentations requests</Dialog.Title>
                    <Dialog.Content style={{flexDirection: 'column'}}>
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
                        <List.Item
                            title="presentationsCompleted"
                            description={JSON.stringify(presentationsCompleted)}/>
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
                        <View style={{marginTop: 8}}>
                            <DropDown
                                label={"Select a presentation definition to use"}
                                mode={"outlined"}
                                visible={showDropDownDefinition}
                                showDropDown={() => setShowDropDownDefinition(true)}
                                onDismiss={() => setShowDropDownDefinition(false)}
                                value={definitionId}
                                setValue={setDefinitionId}
                                list={possibleDefinitions}
                            />
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setVisible(false)
                        }}>Cancel</Button>
                        <Button onPress={async () => {
                            let connection: ConnectionDetails | undefined = selectConnectionById(store.getState(), connectionId)
                            let definition: PresentationDefinition | undefined = selectDefinitionById(store.getState(), definitionId)
                            setInvitationsCompleted(0)
                            setPresentationsCompleted(0)
                            if (connection && definition) {
                                const identifierDetails: IdentifierDetails | undefined = selectIdentifierDetailById(store.getState(), connection?.yourDID)
                                if (identifierDetails) {
                                    sendInvitationTest(connection, definition, identifierDetails)
                                }
                            }
                        }}>Start</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}
