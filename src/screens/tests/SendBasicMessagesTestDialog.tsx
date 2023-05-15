import * as React from "react";
import {useState} from "react";
import {useSelector} from "react-redux";
import {selectAllConnection, selectConnectionById} from "../../redux/reducers/connectionsSlice";
import {getDisplayName, getSettings} from "../../utils/AgentUtils";
import {View} from "react-native";
import {Button, Dialog, List, Portal} from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import ConnectionDetails from "../../models/ConnectionDetails";
import store from "../../redux/store/Store";
import {basicMessage, messageHandler} from "../../protocols/Protocols";

export const SendBasicMessagesTestDialog = ({
                                                visible,
                                                setVisible
                                            }: { visible: boolean, setVisible: (visible: boolean) => void }) => {

    const [messagesSent, setMessagesSent] = useState<number>(0);
    const [connectionId, setConnectionId] = React.useState<string>('');
    const [showDropDownConnection, setShowDropDownConnection] = useState(false);
    const possibleConnections: { label: string, value: string }[] = useSelector(selectAllConnection).filter((connection) => connection.state == 'completed').map((possibleConnections) => {
        return {
            label: getDisplayName(possibleConnections.theirDID!),
            value: possibleConnections.id
        }
    })
    const [contentLength, setContentLength] = React.useState<number>(0);
    const [showDropDownContentLengths, setShowDropDownContentLengths] = useState(false);
    const contentLengthList = [
        {
            label: '10',
            value: 10,
        },
        {
            label: '100',
            value: 100,
        },
        {
            label: '1000',
            value: 1000,
        },
        {
            label: '10000',
            value: 10000,
        },
        {
            label: '100000',
            value: 100000,
        },
    ];
    const [showDropDown, setShowDropDown] = useState(false);
    const [packingMode, setPackingMode] = useState();
    const packingModeList = [
        {
            label: "None",
            value: "none",
        },
        {
            label: "Authcrypt",
            value: "authcrypt",
        },
        {
            label: "Anoncrypt",
            value: "anoncrypt",
        },
    ];
    return (
        <View>
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Send basic messages test</Dialog.Title>
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
                            title="messagesSent"
                            description={JSON.stringify(messagesSent)}/>
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
                                label={"Select content length"}
                                mode={"outlined"}
                                visible={showDropDownContentLengths}
                                showDropDown={() => setShowDropDownContentLengths(true)}
                                onDismiss={() => setShowDropDownContentLengths(false)}
                                value={contentLength}
                                setValue={setContentLength}
                                list={contentLengthList}
                            />
                        </View>
                        <View style={{marginTop: 8}}>
                            <DropDown
                                label={"Message encryption"}
                                mode={"outlined"}
                                visible={showDropDown}
                                showDropDown={() => setShowDropDown(true)}
                                onDismiss={() => setShowDropDown(false)}
                                value={packingMode}
                                setValue={setPackingMode}
                                list={packingModeList}
                            />
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setVisible(false)
                        }}>Cancel</Button>
                        <Button onPress={async () => {
                            let connection: ConnectionDetails | undefined = selectConnectionById(store.getState(), connectionId)
                            setMessagesSent(0)
                            if (connection && packingMode) {
                                let content = "x".repeat(contentLength);
                                console.log('Message content length is : ' + content.length)
                                for (let i = 100; i > 0; i--) {
                                    console.log('Times left: ' + i)
                                    await basicMessage.sendBasicMessage(content, {
                                        from: connection.yourDID,
                                        to: connection.theirDID,
                                        packingMode: packingMode
                                    })
                                    if (getSettings().disconnectAfterSentMessage && messageHandler.bluetoothClient.connectedDevice) {
                                        await messageHandler.bluetoothClient?.disconnectDevice() // Disconnect when done sending message
                                        await new Promise<void>(resolve => {
                                            setTimeout(() => {
                                                resolve()
                                            }, 5000)
                                        })
                                    }
                                    setMessagesSent(prevState => prevState + 1)
                                }
                            }
                        }}>Start</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}
