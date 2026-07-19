export const SPEC_FIELDS_BY_CATEGORY: Record<string, { key: string; label: string }[]> = {
  Computing: [
    { key: "cpu", label: "CPU" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "os", label: "Operating System" },
    { key: "gpu", label: "GPU" },
  ],
  Networking: [
    { key: "port_count", label: "Port Count" },
    { key: "poe", label: "PoE" },
    { key: "max_throughput", label: "Max Throughput" },
    { key: "firmware_version", label: "Firmware Version" },
  ],
  Peripherals: [
    { key: "connection_type", label: "Connection Type" },
    { key: "resolution", label: "Resolution" },
    { key: "paper_size", label: "Paper Size" },
    { key: "toner_model", label: "Toner Model" },
  ],
  Infrastructure: [
    { key: "capacity_va", label: "Capacity (VA)" },
    { key: "runtime_minutes", label: "Runtime (min)" },
    { key: "outlets", label: "Outlets" },
    { key: "network_managed", label: "Network Managed" },
  ],
  Mobile: [
    { key: "screen_size", label: "Screen Size" },
    { key: "cellular", label: "Cellular" },
    { key: "battery_health", label: "Battery Health" },
  ],
};
