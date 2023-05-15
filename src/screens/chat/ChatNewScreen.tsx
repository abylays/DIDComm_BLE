import * as React from 'react';
import {useEffect, useLayoutEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {DataTable, TextInput} from "react-native-paper";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/reducers/rootReducer";
import IdentifierDetails from "../../models/IdentifierDetails";
import {selectIdentifierDetailById} from "../../redux/reducers/identifierDetailsSlice";
import Chat from "../../models/Chat";
import {selectAllConnection} from "../../redux/reducers/connectionsSlice";
import ConnectionDetails from "../../models/ConnectionDetails";
import {getChat} from "../../utils/ChatUtils";
import {getDisplayName} from "../../utils/AgentUtils";
import {Header} from "../../components/Header";

export const ChatNewScreen = ({navigation}: { navigation: any }) => {
    const connectionDetails: ConnectionDetails[] = useSelector(selectAllConnection)
    const defaultDID: string | undefined = useSelector((state: RootState) => state.agent.defaultIdentifier);
    const identifierDetails: IdentifierDetails | undefined = useSelector((state: RootState) => selectIdentifierDetailById(state, defaultDID))

    const [fromDID, setFromDID] = React.useState("");
    const [toDID, setToDID] = React.useState("");

    useEffect(() => {
        setFromDID(identifierDetails?.did ?? 'No default')
        setToDID('')
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Bluetooth" icon="bluetooth-connect" onPress={async () => {
                navigation.navigate('BluetoothMessaging')
            }}/>
        })
    })

    const ConnectionsTable = () => <View style={styles.container}>
        <DataTable>
            <DataTable.Header>
                <DataTable.Title>To DID Name</DataTable.Title>
                <DataTable.Title>From DID Name</DataTable.Title>
            </DataTable.Header>
            {toDID ? (
                <DataTable.Row onPress={() => {
                    // Lookup existing chat for this from/to pair
                    let chat: Chat = getChat(fromDID, toDID)
                    navigation.navigate('ChatMessages', {chatId: chat.id})
                }
                }>
                    <DataTable.Cell><Text>{getDisplayName(toDID)}</Text></DataTable.Cell>
                    <DataTable.Cell><Text>{getDisplayName(fromDID)}</Text></DataTable.Cell>
                </DataTable.Row>
            ) : <></>}
            {connectionDetails.filter((connection) => connection.yourDID.includes(fromDID) && connection.theirDID?.includes(toDID) && connection.state == 'completed').map((connection: ConnectionDetails) => (
                <DataTable.Row key={connection.id} onPress={() => {
                    // Lookup existing chat for this from/to pair
                    let chat: Chat = getChat(connection.yourDID, connection.theirDID!)
                    navigation.navigate('ChatMessages', {chatId: chat.id})
                }}>
                    <DataTable.Cell style={{flex: 4}}>{getDisplayName(connection.theirDID)}</DataTable.Cell>
                    <DataTable.Cell style={{flex: 4}}>{getDisplayName(connection.yourDID)}</DataTable.Cell>
                </DataTable.Row>
            ))}

        </DataTable>
    </View>
    return (<SafeAreaView>
        <TextInput
            label="From DID"
            value={fromDID}
            onChangeText={text => setFromDID(text)}
        />
        <TextInput
            label="To DID"
            value={toDID}
            onChangeText={text => setToDID(text)}
        />
        <ConnectionsTable/>
    </SafeAreaView>)
        ;
}

const styles = StyleSheet.create({
    container: {
        padding: 8
    },
});


