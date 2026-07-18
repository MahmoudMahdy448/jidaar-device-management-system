export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your IT assets and assignments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total devices", value: "—" },
          { label: "Active assignments", value: "—" },
          { label: "Departments", value: "—" },
          { label: "Users", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-1 rounded-xl border p-4"
          >
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <span className="text-2xl font-semibold text-foreground">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Dashboard charts and activity feed will be implemented in Phase 7.
        </p>
      </div>
    </div>
  );
}
