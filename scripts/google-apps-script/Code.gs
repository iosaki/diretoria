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
  if (requests.getLastColumn() < 7 || requests.getRange(1, 7).getValue() !== "Nome na camisa") {
    requests.getRange(1, 7).setValue("Nome na camisa");
    requests.autoResizeColumn(7);
  }
  if (requests.getLastColumn() < 8 || requests.getRange(1, 8).getValue() !== "ID do envio") {
    requests.getRange(1, 8).setValue("ID do envio");
    requests.hideColumns(8);
  }
  return "Abas prontas. Preencha os mínimos de fabricação na aba Metas da loja.";
}

function doGet(event) {
  const parameters = event.parameter || {};
  const callback = String(parameters.callback || "");
  if (parameters.action === "status" && /^interestStatusCallback\d+$/.test(callback)) {
    const requestId = String(parameters.requestId || "");
    const result = { received: isRequestSaved_(requestId) };
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(result)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  if (!/^interestCallback\d+$/.test(callback) || parameters.action !== "totals") {
    return ContentService.createTextOutput("Requisição inválida.");
  }
  const totals = getTotals_();
  return ContentService.createTextOutput(`${callback}(${JSON.stringify(totals)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(event) {
  let ok = false;
  const requestId = String(event.parameter.requestId || "");
  try {
    const name = clean_(event.parameter.name, 120);
    const whatsapp = clean_(event.parameter.whatsapp, 30);
    const product = clean_(event.parameter.product, 80);
    const size = clean_(event.parameter.size, 20);
    const jerseyName = clean_(event.parameter.jerseyName, 30);
    const quantity = Number(event.parameter.quantity);
    if (!/^[\da-f-]{36}$/i.test(requestId)) throw new Error("ID do envio inválido");
    if (!name || !whatsapp || !CONFIG.products.includes(product) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Dados inválidos");
    }
    const allowedSizes = product === "Boné" ? ["Único"] : ["PP", "P", "M", "G", "GG", "XGG"];
    if (!allowedSizes.includes(size)) throw new Error("Tamanho inválido");
    const isJersey = product.startsWith("Manto");
    if (isJersey && !jerseyName) throw new Error("Informe o nome para personalização");
    const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = spreadsheet.getSheetByName(CONFIG.requestsSheet);
    if (!sheet) throw new Error("Execute setup primeiro");
    sheet.appendRow([new Date(), name, whatsapp, product, size, quantity, isJersey ? jerseyName : "", requestId]);
    ok = true;
  } catch (error) {
    console.error(error);
  }
  const payload = JSON.stringify({ type: "diretoria-interest", ok, requestId });
  const html = `<script>window.top.postMessage(${payload}, '*');</script><p>${ok ? "Interesse registrado." : "Não foi possível registrar."}</p>`;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getTotals_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const requests = spreadsheet.getSheetByName(CONFIG.requestsSheet);
  const targets = spreadsheet.getSheetByName(CONFIG.targetsSheet);
  const totals = {};
  CONFIG.products.forEach((product) => { totals[product] = { people: 0, orders: 0, units: 0, minimum: 0 }; });

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
      totals[product].orders += 1;
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

function isRequestSaved_(requestId) {
  if (!/^[\da-f-]{36}$/i.test(requestId)) return false;
  const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.requestsSheet);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 8) return false;
  return Boolean(sheet.getRange(2, 8, sheet.getLastRow() - 1, 1)
    .createTextFinder(requestId)
    .matchEntireCell(true)
    .findNext());
}

function clean_(value, maxLength) {
  return String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength);
}

function normalizePhone_(value) {
  return String(value || "").replace(/\D/g, "");
}
