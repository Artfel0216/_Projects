const HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb";
const HR_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";
const BATTERY_SERVICE = "0000180f-0000-1000-8000-00805f9b34fb";
const BATTERY_LEVEL = "00002a19-0000-1000-8000-00805f9b34fb";
const DEVICE_NAME = "00002a00-0000-1000-8000-00805f9b34fb";

export type HRData = {
  bpm: number;
  sensorContact: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
  battery?: number;
};

export type DeviceInfo = {
  name: string;
  id: string;
  battery?: number;
};

export type ConnectionState = "idle" | "scanning" | "connecting" | "connected" | "disconnected" | "unsupported";

export type BTEventCallback = {
  onHR: (data: HRData) => void;
  onState: (state: ConnectionState) => void;
  onDevice: (device: DeviceInfo) => void;
  onError: (error: string) => void;
};

function isWebBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

function parseHRValue(value: DataView): HRData {
  const flags = value.getUint8(0);
  const is16Bit = !!(flags & 0x01);
  const sensorContact = !!(flags & 0x06);
  const offset = 1;

  const bpm = is16Bit ? value.getUint16(offset, true) : value.getUint8(offset);

  let idx = offset + (is16Bit ? 2 : 1);
  let energyExpended: number | undefined;
  if (flags & 0x08) {
    energyExpended = value.getUint16(idx, true);
    idx += 2;
  }

  const rrIntervals: number[] = [];
  if (flags & 0x10) {
    while (idx + 2 <= value.byteLength) {
      rrIntervals.push(value.getUint16(idx, true));
      idx += 2;
    }
  }

  return { bpm, sensorContact, energyExpended, rrIntervals };
}

export class BluetoothManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private hrCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private _battery: number | undefined;
  private callbacks: BTEventCallback;
  private _state: ConnectionState = "idle";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(callbacks: BTEventCallback) {
    this.callbacks = callbacks;
  }

  get state(): ConnectionState {
    return this._state;
  }

  private setState(s: ConnectionState) {
    this._state = s;
    this.callbacks.onState(s);
  }

  async scan(): Promise<void> {
    if (!isWebBluetoothSupported()) {
      this.setState("unsupported");
      this.callbacks.onError("Bluetooth não suportado neste dispositivo.");
      return;
    }

    this.setState("scanning");

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: false,
        filters: [{ services: [HR_SERVICE] }],
        optionalServices: [BATTERY_SERVICE],
      });

      if (!this.device) {
        this.setState("idle");
        return;
      }

      this.device.addEventListener("gattserverdisconnected", () => {
        this.setState("disconnected");
        this.attemptReconnect();
      });

      this.callbacks.onDevice({
        name: this.device.name || "Desconhecido",
        id: this.device.id,
      });

      await this.connect();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotFoundError") {
        this.setState("idle");
        return;
      }
      this.setState("disconnected");
      this.callbacks.onError(err instanceof Error ? err.message : "Erro ao escanear");
    }
  }

  private async connect(): Promise<void> {
    if (!this.device) return;
    this.setState("connecting");

    try {
      this.server = await this.device.gatt?.connect() ?? null;
      if (!this.server) throw new Error("Falha ao conectar no GATT server");

      const hrService = await this.server.getPrimaryService(HR_SERVICE);
      this.hrCharacteristic = await hrService.getCharacteristic(HR_MEASUREMENT);
      await this.hrCharacteristic.startNotifications();
      this.hrCharacteristic.addEventListener("characteristicvaluechanged", this.onHRChange);

      try {
        const batteryService = await this.server.getPrimaryService(BATTERY_SERVICE);
        this.batteryCharacteristic = await batteryService.getCharacteristic(BATTERY_LEVEL);
        const value = await this.batteryCharacteristic.readValue();
        this._battery = value.getUint8(0);
        this.callbacks.onDevice({
          name: this.device.name || "Desconhecido",
          id: this.device.id,
          battery: this._battery,
        });
      } catch {
        // Bateria opcional
      }

      this.reconnectAttempts = 0;
      this.setState("connected");
    } catch (err: unknown) {
      this.setState("disconnected");
      this.callbacks.onError(err instanceof Error ? err.message : "Falha na conexão");
    }
  }

  private onHRChange = (event: Event) => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    if (!characteristic.value) return;
    const data = parseHRValue(characteristic.value);
    data.battery = this._battery;
    this.callbacks.onHR(data);
  };

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    if (!this.device || !this.device.gatt) return;
    this.reconnectAttempts++;
    this.setState("connecting");
    this.connect();
  }

  async disconnect(): Promise<void> {
    this.reconnectAttempts = this.maxReconnectAttempts;
    if (this.hrCharacteristic) {
      try {
        await this.hrCharacteristic.stopNotifications();
        this.hrCharacteristic.removeEventListener("characteristicvaluechanged", this.onHRChange);
      } catch { /* ignorar */ }
      this.hrCharacteristic = null;
    }
    if (this.server) {
      try { this.server.disconnect(); } catch { /* ignorar */ }
      this.server = null;
    }
    this.device = null;
    this.batteryCharacteristic = null;
    this.setState("disconnected");
  }

  isSupported(): boolean {
    return isWebBluetoothSupported();
  }
}
