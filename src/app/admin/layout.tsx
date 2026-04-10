export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[var(--color-fondo-pagina)] text-foreground">
      {children}
    </div>
  );
}
