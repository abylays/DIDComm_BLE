import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/reducers/rootReducer";
import ConnectionDetails from "../../models/ConnectionDetails";
import {deleteConnection, selectConnectionById} from "../../redux/reducers/connectionsSlice";
import {Avatar, Divider, List} from "react-native-paper";
import IdentifierDetails from "../../models/IdentifierDetails";
import {selectIdentifierDetailById} from "../../redux/reducers/identifierDetailsSlice";
import {Header} from "../../components/Header";

export const ConnectionViewScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const connectionId: string = route.params.connectionId;
    const connection: ConnectionDetails = useSelector((state: RootState) => selectConnectionById(state, connectionId))!

    const yourDID: IdentifierDetails | undefined = useSelector((state: RootState) => selectIdentifierDetailById(state, connection.yourDID))
    const theirDID: IdentifierDetails | undefined = useSelector((state: RootState) => selectIdentifierDetailById(state, connection.theirDID!))

    const dispatch = useDispatch();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Delete" icon="delete-outline" onPress={async () => {
                dispatch(deleteConnection(connection.id))
                console.log('Deleted successfully')
                navigation.goBack()
            }}/>
        })
    })

    return (<ScrollView>
        <View style={styles.container}>
            <Text>Your DID</Text>
            <List.Item
                title={yourDID?.name}
                description={connection?.yourDID}
                onPress={() => {
                    navigation.navigate('IdentifierView', {identifier: connection.yourDID})
                }}
                left={() => <Avatar.Icon icon="account"/>}/>
            <Divider/>
            <List.Item
                title={'State: ' + connection.state}
                left={props => <List.Icon {...props} icon="swap-vertical"/>}
            />
            <Divider/>

            <Text style={{marginTop: 8}}>Their DID</Text>
            <List.Item
                title={theirDID?.name}
                description={connection?.theirDID}
                onPress={() => {
                    navigation.navigate('IdentifierView', {identifier: connection.theirDID})
                }}
                left={() => <Avatar.Icon icon="account"/>}/>
        </View>
    </ScrollView>);
}

const styles = StyleSheet.create({
    container: {
        margin: 8
    }
})
