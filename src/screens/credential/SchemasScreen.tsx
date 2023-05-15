import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Avatar, Button, DataTable} from "react-native-paper";
import {useSelector} from "react-redux";
import {SafeAreaView} from "react-native-safe-area-context";
import Schema from "../../models/Schema";
import {selectAllSchemas} from "../../redux/reducers/SchemasSlice";
import {Header} from "../../components/Header";

export const SchemasScreen = ({navigation}: { navigation: any }) => {
    const schemas: Schema[] = useSelector(selectAllSchemas)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Create ACVC" icon="plus-circle-outline" onPress={async () => {
                console.log('Create')
                navigation.navigate('SchemaCreate')
            }}/>
        })
    })
    const SchemasTable = () => <View style={styles.container}>
        <DataTable>
            <DataTable.Header>
                <DataTable.Title style={{flex: 2}}>Icon</DataTable.Title>
                <DataTable.Title style={{flex: 3}}>Name</DataTable.Title>
                <DataTable.Title style={{flex: 2}}>Version</DataTable.Title>
                <DataTable.Title style={{flex: 3}}>Action</DataTable.Title>
            </DataTable.Header>
            {schemas.map((schema) => (
                <DataTable.Row key={schema.id}
                               onPress={() => {
                                   navigation.navigate('SchemaView', {schemaId: schema.id})
                               }}>
                    <DataTable.Cell style={{flex: 2}}><Avatar.Icon size={28}
                                                                   icon="card-account-details-outline"/></DataTable.Cell>
                    <DataTable.Cell style={{flex: 3}}>{schema.name}</DataTable.Cell>
                    <DataTable.Cell style={{flex: 2}}>{schema.version}</DataTable.Cell>
                    <DataTable.Cell style={{flex: 3}}>
                        <Button onPress={() => {
                            console.log('Issue')
                            navigation.navigate('CredentialIssue', {schemaId: schema.id})
                        }}>Issue</Button>
                    </DataTable.Cell>
                </DataTable.Row>
            ))}
        </DataTable>
    </View>
    return (<SafeAreaView>
        <ScrollView>
            <SchemasTable/>
        </ScrollView>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        padding: 8
    },
});
