export function composeMessage(
  template: string,
  values: { ten_khach: string; mst: string; phan_mem: string },
) {
  const used = new Set<string>();
  const body = template.replace(
    /\{\{\s*(ten_khach|mst|phan_mem)\s*\}\}/gi,
    (_, key: string) => {
      const name = key.toLowerCase() as keyof typeof values;
      used.add(name);
      return values[name];
    },
  );
  const labels = {
    ten_khach: "Khách hàng",
    mst: "Mã số thuế",
    phan_mem: "Phần mềm/hệ thống",
  };
  const context = (Object.keys(values) as (keyof typeof values)[])
    .filter((k) => values[k] && !used.has(k))
    .map((k) => `${labels[k]}: ${values[k]}`)
    .join("\n");
  return [context, body].filter(Boolean).join("\n\n").trim();
}
