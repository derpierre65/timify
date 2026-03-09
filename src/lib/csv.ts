function createCsv(rows: Array<Array<string | number | null>>) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  for (const row of rows) {
    csvContent += row.map((value) => {
      if (value === null) {
        return '';
      }

      const escaped = value.toString().replace(/"/g, '""');

      if (/[",\r\n]/.test(escaped)) {
        return `"${escaped}"`;
      }

      return escaped;
    }).join(';') + '\r\n';
  }

  return csvContent;
}

function downloadCsv(filename: string, csvContent: string) {
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);

  link.click();
}

export {
  createCsv,
  downloadCsv,
};
