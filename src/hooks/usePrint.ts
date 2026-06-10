export function usePrint() {
  const print = (elementId?: string) => {
    if (elementId) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const w = window.open("", "_blank");
      w?.document.write(`<html><head><link rel="stylesheet" href="/print.css"></head><body>${el.innerHTML}</body></html>`);
      w?.document.close();
      w?.print();
    } else {
      window.print();
    }
  };
  return { print };
}
