export interface Device {
    address: string
    name: string
    serviceUuid?: string
    paired: boolean
    mtu?: string
}
