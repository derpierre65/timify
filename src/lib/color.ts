function getAccessibleTextColor(bgColor: string) {
  // Expand shorthand hex (e.g. "#abc") to full form (e.g. "#aabbcc")
  let hex = bgColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((part) => part + part).join('');
  }

  // Parse r/g/b values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 2), 16) / 255;
  const b = parseInt(hex.substring(4, 2), 16) / 255;

  // Calculate luminance
  const luminance: [number, number, number] = [
    r,
    g,
    b,
  ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const bgLuminance = (0.2126 * luminance[0]) + (0.7152 * luminance[1]) + (0.0722 * luminance[2]);

  // Contrast against white and black
  const whiteContrast = 1.05 / (bgLuminance + 0.05);
  const blackContrast = (bgLuminance + 0.05) / 0.05;

  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

export {
  getAccessibleTextColor,
};
