package com.mobileapp.bluetooth

import android.bluetooth.*
import android.bluetooth.BluetoothDevice.*
import android.bluetooth.BluetoothGatt.CONNECTION_PRIORITY_HIGH
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.mobileapp.BluetoothModule
import android.bluetooth.BluetoothGattCallback as BluetoothGattCallback1

object BluetoothClient {

    private const val TAG = "BluetoothClient"
    private lateinit var app: ReactContext

    private lateinit var bluetoothManager: BluetoothManager
    private lateinit var adapter: BluetoothAdapter

    private var gattClient: BluetoothGatt? = null
    private var gattClientCallback: BluetoothGattCallback1? = null

    private var messageReadCharacteristic: BluetoothGattCharacteristic? = null
    private var messageWriteCharacteristic: BluetoothGattCharacteristic? = null

    private var scanning = false
    private val handler = Handler(Looper.getMainLooper())
    private const val SCAN_PERIOD: Long = 10000

    fun init(app: ReactContext) {
        BluetoothClient.app = app
        bluetoothManager = app.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        adapter = bluetoothManager.adapter
    }

    fun startScan(): Boolean {
        mLeDevices.clear()
        Log.d(TAG, "Start scan")
        if (!scanning) {
            handler.postDelayed({
                if (scanning) {
                    stopScan()
                }
            }, SCAN_PERIOD)
            scanning = true
            adapter.bluetoothLeScanner.startScan(mLeScanCallback)
            return true
        } else {
            stopScan()
        }
        return false
    }

    fun stopScan() {
        Log.d(TAG, "Stop scan")
        scanning = false
        handler.removeCallbacksAndMessages(null)
        adapter.bluetoothLeScanner.stopScan(mLeScanCallback)
        BluetoothModule.sendMessageEvent(app, "onStopScan", "")
    }

    private val serviceMap = HashMap<BluetoothDevice, String>()

    private val mLeScanCallback: ScanCallback = object : ScanCallback() {
        @RequiresApi(Build.VERSION_CODES.N)
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            super.onScanResult(callbackType, result)
            if (result != null) {
                if (result.device != null) {
                    val service: String = (result.scanRecord?.serviceUuids)?.get(0).toString()
                    addDevice(result.device)
                    serviceMap[result.device] = service
                }
                val deviceList = Arguments.createArray()
                for (device: BluetoothDevice in mLeDevices) {
                    val deviceParams: WritableMap = Arguments.createMap()
                    deviceParams.putString("address", device.address)
                    deviceParams.putString("name", device.name)
                    deviceParams.putString("serviceUuid", serviceMap.getOrDefault(device, ""))
                    deviceParams.putBoolean("paired", (device.bondState == BOND_BONDED))
                    deviceList.pushMap(deviceParams)
                }
                Log.d(TAG, "Devices: $deviceList")
                BluetoothModule.sendArrayEvent(app, "onScanResult", deviceList)
            }
        }

        override fun onBatchScanResults(results: List<ScanResult?>?) {
            super.onBatchScanResults(results)
        }

        override fun onScanFailed(errorCode: Int) {
            super.onScanFailed(errorCode)
            Log.d(TAG, "Scan failed with error code $errorCode")
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun connectDevice(deviceAddress: String) {
        try {
            val device: BluetoothDevice = adapter.getRemoteDevice(deviceAddress)
            val isPaired = device.bondState == BOND_BONDED
            Log.d(TAG, "connectDevice: $deviceAddress, paired = $isPaired")
            gattClientCallback = GattClientCallback()
            gattClient = device.connectGatt(app, false, gattClientCallback, TRANSPORT_LE, PHY_LE_2M_MASK)
        } catch (exception: IllegalArgumentException) {
            Log.w(TAG, "Device not found with provided address.")
        }
    }

    fun disconnectDevice(deviceAddress: String) {
        BluetoothModule.sendMessageEvent(app, "onDisconnectedGATTServer", deviceAddress)
        Log.i(TAG, "Disconnected from GATT server.")
        gattClient?.close()
    }

    fun pairDevice(deviceAddress: String): Boolean {
        val device: BluetoothDevice = adapter.getRemoteDevice(deviceAddress)
        Log.d(TAG, "Start pairing")
        return device.createBond()
    }

    fun readCharacteristic(characteristic: BluetoothGattCharacteristic?) {
        gattClient?.readCharacteristic(characteristic)
    }

    fun writeCharacteristic(characteristic: BluetoothGattCharacteristic?) {
        gattClient?.writeCharacteristic(characteristic)
    }

    fun setCharacteristicNotification(characteristic: BluetoothGattCharacteristic, enabled: Boolean) {
        gattClient?.setCharacteristicNotification(characteristic, enabled)
        if (characteristic.uuid == READ_MESSAGE_UUID) {
            val descriptor = characteristic.getDescriptor(CLIENT_CONFIGURATION_DESCRIPTOR_UUID)
            descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
            gattClient!!.writeDescriptor(descriptor)
        }
    }

    private val mLeDevices: ArrayList<BluetoothDevice> = ArrayList()

    fun addDevice(device: BluetoothDevice?) {
        if (!mLeDevices.contains(device!!)) {
            mLeDevices.add(device)
        }
    }

    val sendData: ((data: ByteArray) -> Unit) = { data ->
        messageWriteCharacteristic?.value = data
        gattClient?.writeCharacteristic(messageWriteCharacteristic)
    }

    private var messageManager: MessageManager = MessageManager({ message ->
        BluetoothModule.sendMessageEvent(app, "onReceivedServerMessage", message)
    }, sendData)

    fun sendMessage(message: String, promise: Promise) {
        if (gattClient?.device == null) {
            Log.d(TAG, "Not connected")
            promise.reject(Throwable("Not connected"))
            return
        }
        if (messageWriteCharacteristic == null) {
            Log.d(TAG, "MessageWriteCharacteristic is not initialized yet")
            promise.reject(Throwable("MessageWriteCharacteristic is not initialized yet"))
            return
        }
        messageManager.sendMessage(message, promise)
    }

    private class GattClientCallback : BluetoothGattCallback1() {

        @RequiresApi(Build.VERSION_CODES.N)
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            super.onConnectionStateChange(gatt, status, newState)
            val isSuccess = status == BluetoothGatt.GATT_SUCCESS
            val isConnected = newState == BluetoothProfile.STATE_CONNECTED
            val isPaired = gatt.device.bondState == BOND_BONDED
            Log.d(
                TAG,
                "onConnectionStateChange: device = ${gatt.device.address}, status = $status, newState = $newState, success = $isSuccess, connected = $isConnected, paired = $isPaired"
            )
            val deviceParams: WritableMap = Arguments.createMap()
            deviceParams.putString("address", gatt.device.address)
            deviceParams.putString("name", gatt.device.name)
            deviceParams.putString("serviceUuid", serviceMap.getOrDefault(gatt.device, ""))
            deviceParams.putBoolean("paired", (gatt.device.bondState == BOND_BONDED))
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                // Successfully connected to the GATT Server
                BluetoothModule.sendMapEvent(app, "onConnectedGATTServer", deviceParams)
                Log.i(TAG, "Connected to GATT server")
                gatt.requestConnectionPriority(CONNECTION_PRIORITY_HIGH)
                gatt.requestMtu(512)
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                // Disconnected from the GATT Server
                disconnectDevice(gatt.device.address)
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            super.onServicesDiscovered(gatt, status)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "onServicesDiscovered: device = ${gatt.device.address}")
                val service = gatt.getService(DIDCOMM_SERVICE_UUID)
                if (service != null) {
                    Log.d(TAG, "MessageReadCharacteristic: " + service.getCharacteristic(READ_MESSAGE_UUID))
                    Log.d(TAG, "MessageWriteCharacteristic: " + service.getCharacteristic(WRITE_MESSAGE_UUID))
                    messageReadCharacteristic = service.getCharacteristic(READ_MESSAGE_UUID)
                    messageWriteCharacteristic = service.getCharacteristic(WRITE_MESSAGE_UUID)
                    /*if (messageReadCharacteristic != null) {
                        setCharacteristicNotification(messageReadCharacteristic!!, true);
                    }*/
                    BluetoothModule.sendMessageEvent(app, "onServicesDiscovered", "true")
                }
            } else {
                Log.d(TAG, "onServicesDiscovered received: $status")
            }
        }

        override fun onCharacteristicRead(
            gatt: BluetoothGatt?,
            characteristic: BluetoothGattCharacteristic,
            status: Int
        ) {
            super.onCharacteristicRead(gatt, characteristic, status)
            Log.d(TAG, "onCharacteristicRead: status = $status, message = ${String(characteristic.value)}")
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt?,
            characteristic: BluetoothGattCharacteristic
        ) {
            super.onCharacteristicChanged(gatt, characteristic)
            Log.d(TAG, "onCharacteristicChanged: value = ${String(characteristic.value)}")
            if (characteristic.uuid == READ_MESSAGE_UUID) {
                val messagePacket = characteristic.value?.toString(Charsets.UTF_8)
                Log.d(TAG, "onCharacteristicChanged: message = \"$messagePacket\"")
                if (messagePacket != null) {
                    messageManager.handleMessagePacket(messagePacket)
                }
            }
        }

        override fun onCharacteristicWrite(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic?,
            status: Int
        ) {
            super.onCharacteristicWrite(gatt, characteristic, status)
            if (characteristic?.uuid == WRITE_MESSAGE_UUID && status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "onCharacteristicWrite: Success")
                messageManager.sendNextMessagePacket()
            }
        }

        override fun onDescriptorRead(
            gatt: BluetoothGatt?,
            descriptor: BluetoothGattDescriptor?,
            status: Int
        ) {
            super.onDescriptorRead(gatt, descriptor, status)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "onDescriptorRead: Success")
            }
        }

        override fun onDescriptorWrite(
            gatt: BluetoothGatt?,
            descriptor: BluetoothGattDescriptor?,
            status: Int
        ) {
            super.onDescriptorWrite(gatt, descriptor, status)
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "onDescriptorWrite: Success")
            }
        }

        override fun onMtuChanged(gatt: BluetoothGatt, newMTU: Int, status: Int) {
            Log.d(TAG, "onClientMtuChanged: Status: \"$status\", Value = \"$newMTU\"")
            if (status == BluetoothGatt.GATT_SUCCESS) {
                messageManager.mtu = newMTU - 3
                BluetoothModule.sendMessageEvent(app, "onClientMtuChanged", messageManager.mtu.toString())

                // Attempts to discover services after successful changed MTU.
                gatt.discoverServices()
            }
        }

        override fun onPhyUpdate(gatt: BluetoothGatt?, txPhy: Int, rxPhy: Int, status: Int) {
            super.onPhyUpdate(gatt, txPhy, rxPhy, status)
            Log.d(TAG, "onPhyUpdate: txPhy: \"$txPhy\", rxPhy = \"$rxPhy\", status = \"$status\"")
        }

        override fun onPhyRead(gatt: BluetoothGatt?, txPhy: Int, rxPhy: Int, status: Int) {
            super.onPhyRead(gatt, txPhy, rxPhy, status)
            Log.d(TAG, "onPhyRead: txPhy: \"$txPhy\", rxPhy = \"$rxPhy\", status = \"$status\"")
        }

        override fun onReadRemoteRssi(gatt: BluetoothGatt?, rssi: Int, status: Int) {
            super.onReadRemoteRssi(gatt, rssi, status)
            Log.d(TAG, "onReadRemoteRssi: rssi: \"$rssi\", status = \"$status\"")
        }
    }
}
