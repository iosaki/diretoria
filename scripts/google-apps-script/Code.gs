/**
 * Lista de interesse da loja Diretoria Futsal.
 * Cole este arquivo no Apps Script vinculado à planilha e execute setup().
 */
const CONFIG = {
  spreadsheetId: "1KjiRWh4wcoZfS4Frw5pPO2qxhyvA71-5trClqA1-jgk",
  targetsSheet: "Metas da loja",
  requestsSheet: "Lista de interesse",
  products: ["Manto I", "Manto II", "Manto III", "Manto IV", "Boné", "Top", "Corta-vento", "Moletom"],
};

function setup() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  let targets = spreadsheet.getSheetByName(CONFIG.targetsSheet);
  if (!targets) targets = spreadsheet.insertSheet(CONFIG.targetsSheet);
  if (targets.getLastRow() === 0) {
    targets.getRange(1, 1, 1, 2).setValues([["Produto", "Mínimo para fabricação"]]);
    targets.getRange(2, 1, CONFIG.products.length, 2).setValues(CONFIG.products.map((product) => [product, ""]));
    targets.setFrozenRows(1);
    targets.autoResizeColumns(1, 2);
  }

  let requests = spreadsheet.getSheetByName(CONFIG.requestsSheet);
  if (!requests) requests = spreadsheet.insertSheet(CONFIG.requestsSheet);
  if (requests.getLastRow() === 0) {
    requests.appendRow(["Data", "Nome", "WhatsApp", "Produto", "Tamanho", "Quantidade"]);
    requests.setFrozenRows(1);
    requests.autoResizeColumns(1, 6);
  }
  return "Abas prontas. Preencha os mínimos de fabricação na aba Metas da loja.";
}

function doGet(event) {
  const callback = String(event.parameter.callback || "");
  if (!/^interestCallback\d+$/.test(callback) || event.parameter.action !== "totals") {
    return ContentService.createTextOutput("Requisição inválida.");
  }
  const totals = getTotals_();
  return ContentService.createTextOutput(`${callback}(${JSON.stringify(totals)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(event) {
  let ok = false;
  try {
    const name = clean_(event.parameter.name, 120);
    const whatsapp = clean_(event.parameter.whatsapp, 30);
    const product = clean_(event.parameter.product, 80);
    const size = clean_(event.parameter.size, 20);
    const quantity = Number(event.parameter.quantity);
    if (!name || !whatsapp || !CONFIG.products.includes(product) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Dados inválidos");
    }
    const allowedSizes = product === "Boné" ? ["Único"] : ["PP", "P", "M", "G", "GG", "XGG"];
    if (!allowedSizes.includes(size)) throw new Error("Tamanho inválido");
    const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = spreadsheet.getSheetByName(CONFIG.requestsSheet);
    if (!sheet) throw new Error("Execute setup primeiro");
    sheet.appendRow([new Date(), name, whatsapp, product, size, quantity]);
    ok = true;
  } catch (error) {
    console.error(error);
  }
  const payload = JSON.stringify({ type: "diretoria-interest", ok });
  const html = `<script>parent.postMessage(${payload}, '*');</script><p>${ok ? "Interesse registrado." : "Não foi possível registrar."}</p>`;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getTotals_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const requests = spreadsheet.getSheetByName(CONFIG.requestsSheet);
  const targets = spreadsheet.getSheetByName(CONFIG.targetsSheet);
  const totals = {};
  CONFIG.products.forEach((product) => { totals[product] = { people: 0, units: 0, minimum: 0 }; });

  if (targets && targets.getLastRow() > 1) {
    targets.getRange(2, 1, targets.getLastRow() - 1, 2).getValues().forEach(([product, minimum]) => {
      if (totals[product]) totals[product].minimum = Math.max(0, Number(minimum) || 0);
    });
  }
  if (requests && requests.getLastRow() > 1) {
    const rows = requests.getRange(2, 1, requests.getLastRow() - 1, 6).getValues();
    const peopleByProduct = {};
    rows.forEach(([, , whatsapp, product, , quantity]) => {
      if (!totals[product]) return;
      totals[product].units += Math.max(0, Number(quantity) || 0);
      if (!peopleByProduct[product]) peopleByProduct[product] = new Set();
      peopleByProduct[product].add(normalizePhone_(whatsapp));
    });
    Object.keys(peopleByProduct).forEach((product) => {
      totals[product].people = peopleByProduct[product].size;
    });
  }
  return totals;
}

function clean_(value, maxLength) {
  return String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength);
}

function normalizePhone_(value) {
  return String(value || "").replace(/\D/g, "");
}
