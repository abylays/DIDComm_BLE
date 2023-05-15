import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {DataTable} from "react-native-paper";
import {useSelector} from "react-redux";
import {SafeAreaView} from "react-native-safe-area-context";
import {selectAllConnection} from "../../redux/reducers/connectionsSlice";
import ConnectionDetails from "../../models/ConnectionDetails";

export const ConnectionsScreen = ({navigation}: { navigation: any }) => {
    const connectionDetails: ConnectionDetails[] = useSelector(selectAllConnection)
    const ConnectionsTable = () =>
        <View style={styles.container}>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={{flex: 3}}>Their DID</DataTable.Title>
                    <DataTable.Title style={{flex: 3}}>Your DID</DataTable.Title>
                    <DataTable.Title style={{flex: 3}}>State</DataTable.Title>
                </DataTable.Header>


                {connectionDetails.map((details) => (
                    <DataTable.Row key={details.id}
                                   onPress={() => navigation.navigate('ConnectionView', {connectionId: details.id})}>
                        <DataTable.Cell style={{flex: 3}}>{details.theirDID}</DataTable.Cell>
                        <DataTable.Cell style={{flex: 3}}>{details.yourDID}</DataTable.Cell>
                        <DataTable.Cell style={{flex: 3}}>{details.state}</DataTable.Cell>
                    </DataTable.Row>
                ))}

            </DataTable>
        </View>
    return (<SafeAreaView>
        <ScrollView>
            <ConnectionsTable/>
        </ScrollView>
    </SafeAreaView>);
}

const styles = StyleSheet.create({
    container: {
        padding: 8
    },
});
