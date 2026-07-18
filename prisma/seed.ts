import { PrismaClient, UserRole, UserStatus, AssignmentClosedReason } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function uuid(): string {
  return crypto.randomUUID();
}

async function main() {
  console.log("Seeding database...");

  // ─── Device Types ───────────────────────────────────────
  const deviceTypes = await Promise.all([
    prisma.deviceType.create({ data: { id: uuid(), name: "Desktop PC", category: "Computing", description: "Standard desktop computer" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Laptop", category: "Computing", description: "Portable laptop computer" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Server", category: "Computing", description: "Rack or tower server" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Router", category: "Networking", description: "Network router" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Switch", category: "Networking", description: "Network switch" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Firewall", category: "Networking", description: "Network firewall appliance" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Access Point", category: "Networking", description: "Wireless access point" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Printer", category: "Peripherals", description: "Printer or multifunction device" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Monitor", category: "Peripherals", description: "Display monitor" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "Scanner", category: "Peripherals", description: "Document or image scanner" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "UPS", category: "Infrastructure", description: "Uninterruptible power supply" } }),
    prisma.deviceType.create({ data: { id: uuid(), name: "NAS", category: "Infrastructure", description: "Network attached storage" } }),
  ]);
  console.log(`  Created ${deviceTypes.length} device types`);

  // ─── Device Statuses ────────────────────────────────────
  const statuses = await Promise.all([
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Available", color: "#22c55e", sortOrder: 0 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Assigned", color: "#3b82f6", sortOrder: 1 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Maintenance", color: "#f59e0b", sortOrder: 2 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Repair", color: "#f97316", sortOrder: 3 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Retired", color: "#6b7280", sortOrder: 4 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Lost", color: "#ef4444", sortOrder: 5 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Broken", color: "#ef4444", sortOrder: 6 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Reserved", color: "#8b5cf6", sortOrder: 7 } }),
    prisma.deviceStatus.create({ data: { id: uuid(), name: "Disposed", color: "#6b7280", sortOrder: 8 } }),
  ]);
  const statusMap = Object.fromEntries(statuses.map((s) => [s.name, s.id]));
  console.log(`  Created ${statuses.length} device statuses`);

  // ─── Departments ────────────────────────────────────────
  const departments = await Promise.all([
    prisma.department.create({ data: { id: uuid(), name: "Information Technology", code: "IT" } }),
    prisma.department.create({ data: { id: uuid(), name: "Human Resources", code: "HR" } }),
    prisma.department.create({ data: { id: uuid(), name: "Finance", code: "FIN" } }),
    prisma.department.create({ data: { id: uuid(), name: "Operations", code: "OPS" } }),
    prisma.department.create({ data: { id: uuid(), name: "Marketing", code: "MKT" } }),
    prisma.department.create({ data: { id: uuid(), name: "Engineering", code: "ENG" } }),
  ]);
  console.log(`  Created ${departments.length} departments`);

  // ─── Locations ──────────────────────────────────────────
  const locations = await Promise.all([
    prisma.location.create({ data: { id: uuid(), name: "HQ Main", building: "Building A", floor: "1", room: "101" } }),
    prisma.location.create({ data: { id: uuid(), name: "HQ Main", building: "Building A", floor: "1", room: "102" } }),
    prisma.location.create({ data: { id: uuid(), name: "HQ Main", building: "Building A", floor: "2", room: "201" } }),
    prisma.location.create({ data: { id: uuid(), name: "HQ Main", building: "Building A", floor: "2", room: "202" } }),
    prisma.location.create({ data: { id: uuid(), name: "HQ Main", building: "Building A", floor: "3", room: "301" } }),
    prisma.location.create({ data: { id: uuid(), name: "Server Room", building: "Building A", floor: "1", room: "SR-01" } }),
    prisma.location.create({ data: { id: uuid(), name: "Branch Office", building: "Building B", floor: "1", room: "110" } }),
    prisma.location.create({ data: { id: uuid(), name: "Branch Office", building: "Building B", floor: "2", room: "210" } }),
    prisma.location.create({ data: { id: uuid(), name: "Warehouse", building: "Building C", floor: "1", room: "W-01" } }),
    prisma.location.create({ data: { id: uuid(), name: "Conference Room", building: "Building A", floor: "2", room: "CR-01" } }),
  ]);
  console.log(`  Created ${locations.length} locations`);

  // ─── Manufacturers ──────────────────────────────────────
  const manufacturers = await Promise.all([
    prisma.manufacturer.create({ data: { id: uuid(), name: "Dell", website: "https://dell.com" } }),
    prisma.manufacturer.create({ data: { id: uuid(), name: "HP", website: "https://hp.com" } }),
    prisma.manufacturer.create({ data: { id: uuid(), name: "Lenovo", website: "https://lenovo.com" } }),
    prisma.manufacturer.create({ data: { id: uuid(), name: "Cisco", website: "https://cisco.com" } }),
    prisma.manufacturer.create({ data: { id: uuid(), name: "Ubiquiti", website: "https://ubiquiti.com" } }),
  ]);
  console.log(`  Created ${manufacturers.length} manufacturers`);

  // ─── Vendors ────────────────────────────────────────────
  const vendors = await Promise.all([
    prisma.vendor.create({ data: { id: uuid(), name: "TechSupply Co.", email: "sales@techsupply.com", phone: "+1-555-0101" } }),
    prisma.vendor.create({ data: { id: uuid(), name: "IT Distributors Inc.", email: "orders@itdist.com", phone: "+1-555-0102" } }),
    prisma.vendor.create({ data: { id: uuid(), name: "Global Hardware Ltd.", email: "info@globalhw.com", phone: "+1-555-0103" } }),
    prisma.vendor.create({ data: { id: uuid(), name: "NetWorld Supplies", email: "contact@networld.com", phone: "+1-555-0104" } }),
    prisma.vendor.create({ data: { id: uuid(), name: "OfficeTech Solutions", email: "sales@officetech.com", phone: "+1-555-0105" } }),
  ]);
  console.log(`  Created ${vendors.length} vendors`);

  // ─── Admin User ─────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      id: uuid(),
      employeeId: "EMP-001",
      firstName: "Admin",
      lastName: "User",
      email: "admin@jidaar.com",
      phone: "+1-555-0001",
      departmentId: departments[0].id,
      jobTitle: "IT Administrator",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: adminPasswordHash,
      officeLocation: "HQ Main",
    },
  });
  console.log(`  Created admin user: ${admin.email}`);

  // ─── Regular Users (30) ─────────────────────────────────
  const firstNames = [
    "Ahmed", "Fatima", "Omar", "Layla", "Hassan", "Noor", "Yusuf", "Mona",
    "Khalid", "Sara", "Ali", "Huda", "Mahmoud", "Leila", "Tariq", "Amira",
    "Rashid", "Dina", "Samir", "Nadia", "Faisal", "Rana", "Adel", "Ghada",
    "Bilal", "Yasmin", "Ibrahim", "Mariam", "Zaid", "Salma",
  ];
  const lastNames = [
    "Al-Rashid", "Mahmoud", "Hassan", "Ali", "Omar", "Ibrahim", "Khalid",
    "Abdelkarim", "Farouk", "Nasser", "Saleh", "Mansour", "Youssef", "Taha",
    "Kamal", "Eid", "Sherif", "Mostafa", "Hamdi", "Galal", "Ashraf", "Lotfy",
    "Ismail", "Awad", "Zaki", "Fawzy", "Metcalf", "Reed", "Bennett", "Cox",
  ];
  const jobTitles = [
    "Software Engineer", "Network Administrator", "HR Manager", "Financial Analyst",
    "Operations Manager", "Marketing Specialist", "System Administrator", "Database Administrator",
    "IT Support Specialist", "Project Manager", "Business Analyst", "Security Analyst",
    "DevOps Engineer", "Quality Assurance Engineer", "Technical Writer",
  ];

  const userPasswordHash = await bcrypt.hash("password123", 12);
  const users = [];

  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        employeeId: `EMP-${String(i + 2).padStart(3, "0")}`,
        firstName: firstNames[i],
        lastName: lastNames[i],
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase().replace("'", "")}@company.com`,
        phone: `+1-555-${String(i + 100).padStart(4, "0")}`,
        departmentId: departments[i % departments.length].id,
        jobTitle: jobTitles[i % jobTitles.length],
        role: UserRole.READ_ONLY,
        status: UserStatus.ACTIVE,
        passwordHash: userPasswordHash,
        officeLocation: i % 3 === 0 ? "Branch Office" : "HQ Main",
      },
    });
    users.push(user);
  }
  console.log(`  Created ${users.length} regular users`);

  // ─── Devices (75) ──────────────────────────────────────
  const deviceNames: Record<string, string[]> = {
    "Desktop PC": [
      "Marketing Desktop 01", "Finance Desktop 01", "HR Desktop 01", "Ops Desktop 01",
      "IT Desktop 01", "Eng Desktop 01", "Marketing Desktop 02", "Finance Desktop 02",
      "Reception Desktop", "Conference Desktop 01", "Training Desktop 01", "Admin Desktop 01",
    ],
    "Laptop": [
      "Ahmed's Laptop", "Fatima's Laptop", "Omar's Laptop", "Layla's Laptop",
      "Hassan's Laptop", "Noor's Laptop", "Yusuf's Laptop", "Mona's Laptop",
      "Khalid's Laptop", "Sara's Laptop", "Dev Laptop 01", "Dev Laptop 02",
      "Dev Laptop 03", "Manager Laptop 01", "Manager Laptop 02", "Sales Laptop 01",
      "Sales Laptop 02", "Sales Laptop 03", "Field Laptop 01", "Field Laptop 02",
      "Exec Laptop 01", "Exec Laptop 02", "Temp Laptop 01", "Training Laptop 01",
      "Training Laptop 02",
    ],
    "Server": ["Web Server 01", "DB Server 01", "App Server 01", "File Server 01", "Backup Server 01"],
    "Router": ["Core Router 01", "Branch Router 01", "WAN Router 01"],
    "Switch": ["Core Switch 01", "Floor 1 Switch", "Floor 2 Switch", "Floor 3 Switch", "Server Room Switch"],
    "Firewall": ["Main Firewall 01", "DMZ Firewall 01"],
    "Access Point": ["AP Floor 1 01", "AP Floor 2 01", "AP Floor 3 01", "AP Conference 01", "AP Branch 01"],
    "Printer": ["HP Printer 01", "HP Printer 02", "Reception Printer", "Finance Printer", "Branch Printer"],
    "Monitor": ["Dell Monitor 01", "Dell Monitor 02", "Dell Monitor 03", "Dell Monitor 04"],
    "Scanner": ["Document Scanner 01", "Receipt Scanner 01"],
    "UPS": ["Server Room UPS 01", "Server Room UPS 02", "Office UPS 01"],
    "NAS": ["NAS 01", "NAS 02"],
  };

  const osOptions = ["Windows 11 Pro", "Windows 10 Pro", "Ubuntu 22.04 LTS", "macOS Sonoma", null];
  const cpuOptions = ["Intel i5-13400", "Intel i7-13700K", "AMD Ryzen 5 5600X", "AMD Ryzen 7 5800X", "Intel Xeon E-2388G", null];
  const ramOptions = ["8GB DDR4", "16GB DDR4", "32GB DDR5", "64GB DDR5", null];
  const storageOptions = ["256GB NVMe", "512GB NVMe", "1TB NVMe", "2TB SATA SSD", "4TB HDD", null];

  const devices = [];
  let assetCounter = 1;

  for (const [typeName, names] of Object.entries(deviceNames)) {
    const type = deviceTypes.find((t) => t.name === typeName)!;
    for (const deviceName of names) {
      const isLaptop = typeName === "Laptop";
      const isDesktop = typeName === "Desktop PC";
      const isComputing = isLaptop || isDesktop || typeName === "Server";
      const isNetworking = ["Router", "Switch", "Firewall", "Access Point"].includes(typeName);

      const specs: Record<string, string> = {};
      if (isComputing) {
        if (cpuOptions[Math.floor(Math.random() * cpuOptions.length)]) specs.cpu = cpuOptions[Math.floor(Math.random() * cpuOptions.length)]!;
        if (ramOptions[Math.floor(Math.random() * ramOptions.length)]) specs.ram = ramOptions[Math.floor(Math.random() * ramOptions.length)]!;
        if (storageOptions[Math.floor(Math.random() * storageOptions.length)]) specs.storage = storageOptions[Math.floor(Math.random() * storageOptions.length)]!;
        if (osOptions[Math.floor(Math.random() * osOptions.length)]) specs.os = osOptions[Math.floor(Math.random() * osOptions.length)]!;
      }
      if (isNetworking) {
        specs.portCount = String(Math.floor(Math.random() * 48) + 4);
        if (typeName === "Switch") specs.poe = Math.random() > 0.5 ? "Yes" : "No";
      }

      const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];

      const purchaseDate = new Date(2022, Math.floor(Math.random() * 24), Math.floor(Math.random() * 28) + 1);
      const warrantyDate = new Date(purchaseDate);
      warrantyDate.setFullYear(warrantyDate.getFullYear() + (isLaptop || isDesktop ? 3 : 5));

      const device = await prisma.device.create({
        data: {
          id: uuid(),
          assetId: `JDR-${String(assetCounter++).padStart(4, "0")}`,
          name: deviceName,
          deviceTypeId: type.id,
          manufacturerId: mfr.id,
          model: `${mfr.name} ${typeName} ${String(assetCounter).padStart(2, "0")}`,
          serialNumber: `SN-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
          hostname: isComputing ? `PC-${assetCounter.toString().padStart(3, "0")}` : null,
          ipAddress: isNetworking || isComputing ? `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 200) + 10}` : null,
          macAddress: `${Math.floor(Math.random() * 256).toString(16).padStart(2, "0")}:${Math.floor(Math.random() * 256).toString(16).padStart(2, "0")}:${Math.floor(Math.random() * 256).toString(16).padStart(2, "0")}:${Math.floor(Math.random() * 256).toString(16).padStart(2, "0")}:${Math.floor(Math.random() * 256).toString(16).padStart(2, "0")}:${Math.floor(Math.random() * 256).toString(16).padStart(2, "0")}`,
          statusId: statusMap["Available"],
          departmentId: dept.id,
          locationId: loc.id,
          specifications: specs,
          purchaseDate,
          warrantyExpiration: warrantyDate,
          vendorId: vendor.id,
          purchasePrice: Math.floor(Math.random() * 3000) + 200,
        },
      });
      devices.push(device);
    }
  }
  console.log(`  Created ${devices.length} devices`);

  // ─── Assignments (25) ──────────────────────────────────
  const availableDevices = devices.filter((d) => d.statusId === statusMap["Available"]);
  const assignmentsToCreate = 25;

  for (let i = 0; i < assignmentsToCreate; i++) {
    const device = availableDevices[i];
    if (!device) break;
    const user = users[i % users.length];
    const assignmentDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const expectedReturn = new Date(assignmentDate);
    expectedReturn.setMonth(expectedReturn.getMonth() + 6);

    const isReturned = i > 18;
    const isOverdue = i >= 15 && i <= 18;

    await prisma.assignment.create({
      data: {
        id: uuid(),
        deviceId: device.id,
        userId: user.id,
        assignedById: admin.id,
        assignmentDate,
        expectedReturnDate: isOverdue ? new Date(2025, 0, 1) : expectedReturn,
        returnDate: isReturned ? new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1) : null,
        closedReason: isReturned ? AssignmentClosedReason.RETURNED : null,
        conditionBefore: isReturned ? "Good condition" : null,
        conditionAfter: isReturned ? "Good condition, minor wear" : null,
        notes: i % 3 === 0 ? "Urgent need for project deadline" : null,
      },
    });

    if (!isReturned) {
      await prisma.device.update({
        where: { id: device.id },
        data: { statusId: statusMap["Assigned"] },
      });
    }
  }
  console.log(`  Created ${assignmentsToCreate} assignments`);

  // ─── Additional statuses for some devices ───────────────
  const maintenanceDevices = devices.slice(60, 63);
  for (const d of maintenanceDevices) {
    await prisma.device.update({
      where: { id: d.id },
      data: { statusId: statusMap["Maintenance"] },
    });
  }

  const retiredDevices = devices.slice(70, 73);
  for (const d of retiredDevices) {
    await prisma.device.update({
      where: { id: d.id },
      data: { statusId: statusMap["Retired"] },
    });
  }

  const brokenDevices = devices.slice(73, 75);
  for (const d of brokenDevices) {
    await prisma.device.update({
      where: { id: d.id },
      data: { statusId: statusMap["Broken"] },
    });
  }

  console.log("Seeding complete!");
  console.log(`  Admin login: admin@jidaar.com / admin123`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
