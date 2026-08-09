import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 mt-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo withWordmark />
        <p className="text-xs text-ink-400">Built as a Smart Link Router & Blog CMS assessment project.</p>
      </div>
    </footer>
  );
}
