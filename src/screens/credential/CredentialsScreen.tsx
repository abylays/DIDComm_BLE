import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Avatar, DataTable} from "react-native-paper";
import {useSelector} from "react-redux";
import {SafeAreaView} from "react-native-safe-area-context";
import CredentialDetails from "../../models/CredentialDetails";
import {selectAllCredentials} from "../../redux/reducers/credentialsSlice";
import {Header} from "../../components/Header";

export const CredentialsScreen = ({navigation}: { navigation: any }) => {
    const credentialDetails: CredentialDetails[] = useSelector(selectAllCredentials)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Schemas" onPress={async () => {
                console.log('Schemas')
                navigation.navigate('Schemas')
            }}/>
        })
    })
    const CredentialsTable = () => <View style={styles.container}>
        <DataTable>
            <DataTable.Header>
                <DataTable.Title style={{flex: 2}}>Icon</DataTable.Title>
                <DataTable.Title style={{flex: 3}}>Type</DataTable.Title>
                <DataTable.Title style={{flex: 3}}>Issuer</DataTable.Title>
                <DataTable.Title style={{flex: 2}}>Issued?</DataTable.Title>
            </DataTable.Header>
            {credentialDetails.map((details: CredentialDetails) => (
                <DataTable.Row key={details.verifiableCredential.id}
                               onPress={() => navigation.navigate('CredentialView', {credentialId: details.verifiableCredential.id})}>
                    <DataTable.Cell style={{flex: 2}}><Avatar.Icon size={28}
                                                                   icon="card-account-details-outline"/></DataTable.Cell>
                    <DataTable.Cell style={{flex: 3}}>{details.verifiableCredential.type?.toString()}</DataTable.Cell>
                    <DataTable.Cell style={{flex: 3}}>{
                        // @ts-ignore
                        details?.verifiableCredential.issuer?.id
                    }</DataTable.Cell>
                    <DataTable.Cell style={{flex: 2}}>{details.issued ? 'Yes' : 'No'}</DataTable.Cell>
                </DataTable.Row>
            ))}
        </DataTable>
    </View>
    return (<SafeAreaView>
        <ScrollView>
            <CredentialsTable/>
        </ScrollView>
    </SafeAreaView>);
}

const styles = StyleSheet.create({
    container: {
        padding: 8
    },
});
