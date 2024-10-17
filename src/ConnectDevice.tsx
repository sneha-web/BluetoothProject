import { StyleSheet, Text, View, SafeAreaView, Alert, PermissionsAndroid, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react';
import BleManager from "react-native-ble-manager";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { NativeEventEmitter, NativeModules } from 'react-native';
import RippleEffect from './RippleEffect';
import ButtonComp from './Components/ButtonComp';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Type definitions
type BluetoothData = number;

const ConnectDevice = () => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [bleDevices, setDevices] = useState<BluetoothData[]>([]);
    const [isScanning, setScanning] = useState<boolean>(false);
    const [currentDevice, setCurrentDevice] = useState<any>()

    useEffect(() => {
        BleManager.start({ showAlert: false }).then(() => {
            console.log("module initialized")
        });
    })

    useEffect(() => {
        BleManager.enableBluetooth()
            .then(() => {
                console.log("the bluetooth is already enabled or the user confirm")
                requestPermission()
            })
            .catch((error) => {
                console.log(error, "the user refuse to enable bluetooth")
            })
    }, [])

    useEffect(() => {
        let stopListener = bleManagerEmitter.addListener('BleManagerStopScan', () => {
            setScanning(false)
            handleGetConnectedDevices()
            console.log("stop")
        })

        return () => stopListener.remove()
    })

    const requestPermission = async () => {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ])

        if (granted) {
            startScanning()
        }
    }

    // Start scanning for Bluetooth devices
    const startScanning = () => {
        if (!isScanning) {
            BleManager.scan([], 10, false).then(() => {
                console.log('Scanning...');
                setScanning(true)
            }).catch((error: any) => {
                console.log(error)
            })
        }
    };

    const handleGetConnectedDevices = () => {
        BleManager.getDiscoveredPeripherals().then((result: any) => {
            if (result.length === 0) {
                console.log("No Device Found")
                startScanning()
            } else {
                console.log("Result", JSON.stringify(result))
                const allDevices = result.filter((item: any) => item.name !== null)
                setDevices(allDevices)
            }

            console.log("Discovered peripherals :" + result)
        })
    }

    const onConnect = async (item: any) => {
        BleManager.connect(item.id)
            .then(() => {
                console.log('Connected');
                setIsConnected(true);
                simulateDataReading();
            })
            .catch((error) => {
                console.log('Connection error', error);
            });
    }

    const simulateDataReading = () => {
        setInterval(() => {
            const randomData = Math.floor(Math.random() * 100);
            setDevices((prevData: any) => [...prevData, randomData]);

            // Store data offline
            storeData([...bleDevices, randomData]);
        }, 5000);
    };

    const storeData = async (data: any) => {
        try {
            const jsonData = JSON.stringify(data);
            await AsyncStorage.setItem('@bluetooth_data', jsonData);
        } catch (e) {
            console.error(e);
        }
    };

    const syncData = async () => {
        const networkState = await NetInfo.fetch();
        if (networkState.isConnected) {
            const jsonData = await AsyncStorage.getItem('@bluetooth_data');
            if (jsonData !== null) {
                console.log('Syncing data to cloud...');
                // Simulate cloud sync
                setScanning(true);
                setTimeout(() => {
                    console.log('Data synced to cloud:', jsonData);
                    setScanning(false);
                }, 3000);
            }
        } else {
            Alert.alert('No internet connection');
        }
    };



    const renderDeviceItem = ({ item }: any) => {
        return (
            <View style={styles.deviceCard}>
                <Text numberOfLines={1} style={styles.deviceText}>Data: {item}</Text>
                <TouchableOpacity
                    onPress={() => onConnect(item)}
                    style={styles.button}>
                    <Text style={styles.deviceText}>Connect</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Bluetooth Device Simulation</Text>
            {isScanning ?
                <RippleEffect />
                :
                <>
                    <FlatList
                        data={bleDevices}
                        renderItem={renderDeviceItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </>
            }

            <ButtonComp
                title="Start Scan"
                onPress={startScanning}
                disable={false}
            />
             <ButtonComp
                title="Sync Data"
                onPress={syncData}
                disable={isScanning}
            />

        </SafeAreaView>
    )
}

export default ConnectDevice

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    deviceCard: {
        width: "85%",
        padding: 15,
        marginVertical: 15,
        borderRadius: 20,
        backgroundColor: "rgba(0, 150, 255, 0.3)",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    deviceText: {
        fontSize: 18,
        color: "#000"
    },
    button: {
        width: 100,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        backgroundColor: "rgba(0, 150, 255, 0.9)"
    }
})