import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView} from 'react-native';
import {List} from "react-native-paper";
import {SendBasicMessagesTestDialog} from "./tests/SendBasicMessagesTestDialog";
import {ConnectDIDsTestDialog} from "./tests/ConnectDIDsTestDialog";
import {PingTestDialog} from "./tests/PingTestDialog";
import {PresentationTestDialog} from "./tests/PresentationTestDialog";
import performance from "react-native-performance";
import {showGreenSnackBar, showRedSnackBar} from "../utils/Snackbar";
import {setIsTesting} from "../redux/reducers/agentSlice";
import {useDispatch, useSelector} from "react-redux";

import {openDatabase, SQLError, Transaction} from "react-native-sqlite-storage";
import {getSettings} from "../utils/AgentUtils";
import RNFS from 'react-native-fs';
import RNFetchBlob from "rn-fetch-blob";
import {RootState} from "../redux/reducers/rootReducer";

export const TestsScreen = () => {
    const [visible1, setVisible1] = React.useState(false);
    const [visible2, setVisible2] = React.useState(false);
    const [visible3, setVisible3] = React.useState(false);
    const [visible4, setVisible4] = React.useState(false);
    const testing: boolean = useSelector((state: RootState) => state.agent.isTesting)
    const dispatch = useDispatch()

    useLayoutEffect(() => {
        dispatch(setIsTesting(true))
        return () => {
            dispatch(setIsTesting(false))
        }
    }, [])

    return (<><ScrollView>
        <List.Item
            title="Testing mode"
            description={JSON.stringify(testing)}/>
        <List.Item
            title="Using settings"
            descriptionNumberOfLines={5}
            description={JSON.stringify(getSettings())}/>
        <List.Item
            title="Print measurements"
            onPress={() => {
                console.log(JSON.stringify(performance.getEntriesByType('measure')))
                console.log(JSON.stringify(performance.getEntriesByType('mark')))
                showGreenSnackBar(`Printed: measures ${performance.getEntriesByType('measure').length}, marks ${performance.getEntriesByType('mark').length}`)
            }}/>
        <List.Item
            title="Clear measurements"
            onPress={() => {
                showGreenSnackBar('Cleared')
                console.log('Cleared')
                performance.clearMarks()
                performance.clearMeasures()
            }}/>
        <List.Item
            title="Save measurements to database"
            onPress={async () => {
                let db = openDatabase({
                    name: 'performance.db',
                    location: 'default'
                }, () => console.log('Database opened'), (error: SQLError) => console.log('Database error: ' + error));
                await db.transaction(async (tx: Transaction) => {

                    await tx.executeSql('CREATE TABLE IF NOT EXISTS Performance(id INTEGER PRIMARY KEY NOT NULL, name TEXT, entryType TEXT, startTime FLOAT, duration FLOAT, messageId TEXT, messageType TEXT, messageContentLength TEXT, messagePackingMode TEXT, messagePackedBytes INTEGER)')
                    for (const measure of performance.getEntriesByType('measure')) {
                        tx.executeSql(`INSERT INTO Performance (name, entryType, startTime, duration, messageId,
                                                                messageType, messageContentLength,
                                                                messagePackingMode, messagePackedBytes)
                                       VALUES ('${measure?.name}', '${measure?.entryType}', ${measure?.startTime},
                                               ${measure?.duration},
                                               '${measure.detail?.messageId}', '${measure.detail?.messageType}',
                                               '${measure.detail?.messageContentLength}',
                                               '${measure.detail?.messagePackingMode}',
                                               '${measure.detail?.messagePackedBytes}
                                           ')`, [], (transaction, resultSet) => {
                            console.log(resultSet)
                        })
                    }
                    for (const mark of performance.getEntriesByType('mark')) {
                        tx.executeSql(`INSERT INTO Performance (name, entryType, startTime, duration,
                                                                messageId, messageType, messageContentLength,
                                                                messagePackingMode, messagePackedBytes)
                                       VALUES ('${mark?.name}', '${mark?.entryType}', ${mark?.startTime},
                                               ${mark?.duration},
                                               '${mark.detail?.messageId}', '${mark.detail?.messageType}',
                                               '${mark.detail?.messageContentLength}',
                                               '${mark.detail?.messagePackingMode}',
                                               '${mark.detail?.messagePackedBytes}
                                           ')`, [], (transaction, resultSet) => {
                            console.log(resultSet)
                        })
                    }
                }, (error: SQLError) => console.log('Database error: ' + JSON.stringify(error)), async (success: Transaction) => {
                    showGreenSnackBar('Saved')
                    console.log('Saved')
                    await db.close()
                })
            }}/>
        <List.Item
            title="Export database"
            onPress={async () => {
                await RNFetchBlob.fs.cp('/data/data/com.mobileapp/databases/performance.db', RNFS.ExternalStorageDirectoryPath + '/Android/data/com.mobileapp/files/performance.db')
                    .then(() => {
                        showGreenSnackBar('Exported')
                    })
                    .catch(() => {
                        showRedSnackBar('Error')
                    })

            }}/>
        <List.Item
            title="Clear database"
            onPress={async () => {
                let db = openDatabase({
                    name: 'performance.db',
                    location: 'default'
                }, () => console.log('Database opened'), async (error: SQLError) => {
                    console.log('Database error: ' + error)
                    showRedSnackBar('Database error: ' + JSON.stringify(error))
                    await db.close()
                });
                await db.transaction(async (tx: Transaction) => {
                    await tx.executeSql('DROP TABLE Performance')
                }, (error: SQLError) => {
                    console.log('Database error: ' + JSON.stringify(error))
                    showRedSnackBar('Database error: ' + JSON.stringify(error))
                }, async (success: Transaction) => {
                    showGreenSnackBar('Cleared')
                    console.log('Cleared')
                    await db.close()
                })
            }}/>
        <List.Subheader>Tests</List.Subheader>
        <ConnectDIDsTestDialog visible={visible1} setVisible={setVisible1}/>
        <PingTestDialog visible={visible2} setVisible={setVisible2}/>
        <SendBasicMessagesTestDialog visible={visible3} setVisible={setVisible3}/>
        <PresentationTestDialog visible={visible4} setVisible={setVisible4}/>
        <List.Item
            title="Send connection invitations"
            onPress={async () => {
                setVisible1(true)
            }}/>
        <List.Item
            title="Send and receive pings"
            onPress={async () => {
                setVisible2(true)
            }}/>
        <List.Item
            title="Send basic messages"
            onPress={async () => {
                setVisible3(true)
            }}/>
        <List.Item
            title="Send presentations requests"
            onPress={async () => {
                setVisible4(true)
            }}/>
    </ScrollView></>);
}
