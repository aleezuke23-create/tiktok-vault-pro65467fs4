export const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CO", name: "Colômbia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "FR", name: "França", flag: "🇫🇷" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "IT", name: "Itália", flag: "🇮🇹" },
  { code: "NL", name: "Países Baixos", flag: "🇳🇱" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "AU", name: "Austrália", flag: "🇦🇺" },
  { code: "JP", name: "Japão", flag: "🇯🇵" },
  { code: "KR", name: "Coreia do Sul", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "Índia", flag: "🇮🇳" },
  { code: "ID", name: "Indonésia", flag: "🇮🇩" },
  { code: "PH", name: "Filipinas", flag: "🇵🇭" },
  { code: "TH", name: "Tailândia", flag: "🇹🇭" },
  { code: "VN", name: "Vietnã", flag: "🇻🇳" },
  { code: "TR", name: "Turquia", flag: "🇹🇷" },
  { code: "SA", name: "Arábia Saudita", flag: "🇸🇦" },
  { code: "AE", name: "Emirados Árabes", flag: "🇦🇪" },
  { code: "ZA", name: "África do Sul", flag: "🇿🇦" },
  { code: "NG", name: "Nigéria", flag: "🇳🇬" },
  { code: "EG", name: "Egito", flag: "🇪🇬" },
];

export function getCountry(code: string | null | undefined) {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) ?? null;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
