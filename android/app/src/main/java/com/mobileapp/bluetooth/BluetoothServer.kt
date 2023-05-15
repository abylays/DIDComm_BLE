package com.mobileapp.bluetooth

import android.bluetooth.*
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import androidx.lifecycle.MutableLiveData
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.mobileapp.BluetoothModule
import java.util.*

object BluetoothServer {

    private const val TAG = "BluetoothServer"
    private lateinit var app: ReactContext

    private val requestEnableBluetooth = MutableLiveData<Boolean>()
    private lateinit var bluetoothManager: BluetoothManager
    private lateinit var adapter: BluetoothAdapter

    private var advertiser: BluetoothLeAdvertiser? = null
    private var advertiseCallback: AdvertiseCallback? = null

    private lateinit var advertiseSettings: AdvertiseSettings
    private lateinit var advertiseData: AdvertiseData

    private var gattServer: BluetoothGattServer? = null
    private var gattServerCallback: BluetoothGattServerCallback? = null
    private lateinit var gattService: BluetoothGattService

    private var connectedDevice: BluetoothDevice? = null

    private lateinit var messageReadCharacteristic: BluetoothGattCharacteristic
    private lateinit var messageWriteCharacteristic: BluetoothGattCharacteristic

    fun init(app: ReactContext, pairing: Boolean) {
        BluetoothServer.app = app
        advertiseSettings = buildAdvertiseSettings()
        gattService = buildGattService(pairing)
        bluetoothManager = app.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        adapter = bluetoothManager.adapter
    }

    fun startServer(serviceUuid: UUID) {
        if (!adapter.isEnabled) {
            requestEnableBluetooth.postValue(true)
        } else {
            requestEnableBluetooth.postValue(false)
            setupGattServer()
            startAdvertisement(serviceUuid)
        }
        Log.d(
            "BluetoothModule", "ChatServer.startServer()"
        )
        if (connectedDevice != null) {
            Log.d(
                "BluetoothModule", "Connected to device: " + connectedDevice?.address
            )
        }
    }

    fun stopServer() {
        stopAdvertising()
        gattServer?.close()
    }

    private fun setupGattServer() {
        gattServerCallback = GattServerCallback()
        gattServer = bluetoothManager.openGattServer(
            app,
            gattServerCallback,
        ).apply {
            addService(gattService)
        }
    }

    private fun buildGattService(pairing: Boolean): BluetoothGattService {
        val service = BluetoothGattService(DIDCOMM_SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        val writeMessagePermission =
            if (pairing) BluetoothGattCharacteristic.PERMISSION_WRITE_ENCRYPTED_MITM else BluetoothGattCharacteristic.PERMISSION_WRITE
        messageReadCharacteristic = BluetoothGattCharacteristic(
            READ_MESSAGE_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ,
            BluetoothGattCharacteristic.PERMISSION_READ
        )
        messageWriteCharacteristic = BluetoothGattCharacteristic(
            WRITE_MESSAGE_UUID,
            BluetoothGattCharacteristic.PROPERTY_WRITE,
            writeMessagePermission,
        )
        val clientConfigurationDescriptor = BluetoothGattDescriptor(
            CLIENT_CONFIGURATION_DESCRIPTOR_UUID,
            BluetoothGattDescriptor.PERMISSION_READ or BluetoothGattDescriptor.PERMISSION_WRITE
        ).apply {
            value = BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE
        }
        messageReadCharacteristic.addDescriptor(clientConfigurationDescriptor)
        service.addCharacteristic(messageReadCharacteristic)
        service.addCharacteristic(messageWriteCharacteristic)
        return service
    }

    private fun startAdvertisement(serviceUuid: UUID) {
        advertiser = adapter.bluetoothLeAdvertiser
        advertiseData = buildAdvertiseData(serviceUuid)
        advertiseCallback = DeviceAdvertiseCallback()
        advertiser?.startAdvertising(advertiseSettings, advertiseData, advertiseCallback)
        Log.d(TAG, "Advertisement started with uuid: $serviceUuid")
    }

    private fun stopAdvertising() {
        Log.d(TAG, "Advertisement stopped")
        advertiser?.stopAdvertising(advertiseCallback)
        BluetoothModule.sendMessageEvent(app, "onAdvertisementEvent", "false")
    }

    private fun buildAdvertiseData(serviceUuid: UUID): AdvertiseData {
        val dataBuilder = AdvertiseData.Builder()
            .addServiceUuid(ParcelUuid(serviceUuid))
            .setIncludeDeviceName(false)
        return dataBuilder.build()
    }

    private fun buildAdvertiseSettings(): AdvertiseSettings {
        return AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true)
            .setTimeout(0)
            .build()
    }

    fun disconnectDevice(deviceAddress: String) {
        BluetoothModule.sendMessageEvent(app, "onDisconnectedGATTClient", deviceAddress)
        Log.d(TAG, "Disconnected from GATT client.")
        connectedDevice = null
    }

    fun pairDevice(deviceAddress: String): Boolean {
        val device: BluetoothDevice = adapter.getRemoteDevice(deviceAddress)
        Log.d(TAG, "Start pairing")
        return device.createBond()
    }

    private val sendData: ((data: ByteArray) -> Unit) = { data ->
        messageReadCharacteristic.value = data
        gattServer?.notifyCharacteristicChanged(connectedDevice, messageReadCharacteristic, false)
    }

    private var messageManager: MessageManager = MessageManager({ message ->
        BluetoothModule.sendMessageEvent(app, "onReceivedClientMessage", message)
    }, sendData)

    fun sendMessage(message: String, promise: Promise) {
        if (connectedDevice == null) {
            Log.d(TAG, "Not connected")
            promise.reject(Throwable("Not connected"))
            return
        }
        messageManager.sendMessage(message, promise)
    }

    private class GattServerCallback : BluetoothGattServerCallback() {

        override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
            super.onConnectionStateChange(device, status, newState)
            val isSuccess = status == BluetoothGatt.GATT_SUCCESS
            val isConnected = newState == BluetoothProfile.STATE_CONNECTED
            val isPaired = device.bondState == BluetoothDevice.BOND_BONDED
            Log.d(
                TAG,
                "onConnectionStateChange: device = ${device.address}, status = $status, newState = $newState,  success = $isSuccess, connected = $isConnected, paired = $isPaired"
            )
            val deviceParams: WritableMap = Arguments.createMap()
            deviceParams.putString("address", device.address)
            deviceParams.putString("name", device.name)
            deviceParams.putBoolean("paired", (device.bondState == BluetoothDevice.BOND_BONDED))
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                // Successfully connected to the GATT Server
                connectedDevice = device
                BluetoothModule.sendMapEvent(app, "onConnectedGATTClient", deviceParams)
                Log.d(TAG, "Connected to GATT client")
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                // Disconnected from the GATT Server
                disconnectDevice(device.address)
            }
        }

        override fun onCharacteristicReadRequest(
            device: BluetoothDevice,
            requestId: Int,
            offset: Int,
            characteristic: BluetoothGattCharacteristic
        ) {
            super.onCharacteristicReadRequest(device, requestId, offset, characteristic)
            Log.d(
                TAG,
                "onCharacteristicReadRequest: characteristic uuid = ${characteristic.uuid}, value = ${characteristic.value}, offset = $offset"
            )
            if (characteristic.uuid == READ_MESSAGE_UUID) {
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, characteristic.value)
            }
        }

        override fun onCharacteristicWriteRequest(
            device: BluetoothDevice,
            requestId: Int,
            characteristic: BluetoothGattCharacteristic,
            preparedWrite: Boolean,
            responseNeeded: Boolean,
            offset: Int,
            value: ByteArray?
        ) {
            super.onCharacteristicWriteRequest(
                device,
                requestId,
                characteristic,
                preparedWrite,
                responseNeeded,
                offset,
                value
            )
            if (characteristic.uuid == WRITE_MESSAGE_UUID) {
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, null)
                val messagePacket = value?.toString(Charsets.UTF_8)
                Log.d(
                    TAG,
                    "onCharacteristicWriteRequest: offset = ${offset}, responseNeeded = $responseNeeded"
                )
                if (messagePacket != null) {
                    messageManager.handleMessagePacket(messagePacket)
                }
            }
        }

        override fun onDescriptorReadRequest(
            device: BluetoothDevice,
            requestId: Int,
            offset: Int,
            descriptor: BluetoothGattDescriptor
        ) {
            super.onDescriptorReadRequest(device, requestId, offset, descriptor)
            Log.d(TAG, "onDescriptorReadRequest: descriptor uuid = \"${descriptor.uuid}\"")
        }

        override fun onDescriptorWriteRequest(
            device: BluetoothDevice,
            requestId: Int,
            descriptor: BluetoothGattDescriptor,
            preparedWrite: Boolean,
            responseNeeded: Boolean,
            offset: Int,
            value: ByteArray
        ) {
            super.onDescriptorWriteRequest(device, requestId, descriptor, preparedWrite, responseNeeded, offset, value)
            if (CLIENT_CONFIGURATION_DESCRIPTOR_UUID == descriptor.uuid) {
                Log.d(TAG, "onDescriptorWriteRequest: value = ${String(value)}, responseNeeded = $responseNeeded")
                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, null)
            }
        }

        override fun onNotificationSent(device: BluetoothDevice, status: Int) {
            super.onNotificationSent(device, status)
            Log.d(
                TAG, "onNotificationSent: device = ${device.address}, status= $status"
            )
            messageManager.sendNextMessagePacket()
        }

        override fun onMtuChanged(device: BluetoothDevice, newMTU: Int) {
            messageManager.mtu = newMTU - 3
            Log.d(TAG, "onServerMtuChanged: value = \"${messageManager.mtu}\"")
            BluetoothModule.sendMessageEvent(app, "onServerMtuChanged", messageManager.mtu.toString())
        }

        override fun onPhyUpdate(device: BluetoothDevice?, txPhy: Int, rxPhy: Int, status: Int) {
            super.onPhyUpdate(device, txPhy, rxPhy, status)
            Log.d(TAG, "onPhyUpdate: txPhy: \"$txPhy\", rxPhy = \"$rxPhy\", status = \"$status\"")
        }

        override fun onPhyRead(device: BluetoothDevice?, txPhy: Int, rxPhy: Int, status: Int) {
            super.onPhyRead(device, txPhy, rxPhy, status)
            Log.d(TAG, "onPhyRead: txPhy: \"$txPhy\", rxPhy = \"$rxPhy\", status = \"$status\"")
        }


    }

    private class DeviceAdvertiseCallback : AdvertiseCallback() {
        override fun onStartFailure(errorCode: Int) {
            super.onStartFailure(errorCode)
            Log.d(TAG, "Advertisement failed: $errorCode")
            BluetoothModule.sendMessageEvent(app, "onAdvertisementEvent", "false")
        }

        override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
            super.onStartSuccess(settingsInEffect)
            Log.d(TAG, "Advertisement successfully started")
            BluetoothModule.sendMessageEvent(app, "onAdvertisementEvent", "true")
        }
    }
}
