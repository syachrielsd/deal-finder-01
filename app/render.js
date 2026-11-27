// TAGDROP rendering: turns deal records into cards and the detail view.
// One job only — building DOM from data. Filtering lives in finder.js.

function discountPct(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

function money(amount) {
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var VERDICT_LABEL = {
  newlow: "REAL NEW LOW",
  strong: "STRONG PRICE",
  routine: "ROUTINE / INFLATED"
};

function verdictBadge(deal) {
  return '<span class="badge badge-' + deal.verdict + '">' + VERDICT_LABEL[deal.verdict] + "</span>";
}

function dealCard(deal) {
  var pct = discountPct(deal);
  var saved = money(deal.usual - deal.sale);
  var card = document.createElement("article");
  card.className = "deal-card";
  card.innerHTML =
    '<div class="card-top"><span class="store-chip">' + deal.store + "</span>" +
    '<span class="pct">-' + pct + "%</span></div>" +
    "<h3>" + deal.name + "</h3>" +
    '<p class="blurb">' + deal.blurb + "</p>" +
    '<p class="prices"><span class="sale">' + money(deal.sale) + '</span> ' +
    '<span class="usual">' + money(deal.usual) + '</span> ' +
    '<span class="saved">save ' + saved + "</span></p>" +
    verdictBadge(deal) +
    '<p class="verdict-note">' + deal.verdictNote + "</p>" +
    (deal.compare ? '<p class="compare">Compare: ' + deal.compare + "</p>" : "") +
    '<p class="meta">Checked ' + deal.checked + "<br>Source: " + deal.source + "</p>" +
    '<p class="card-actions"><a class="store-link" href="' + deal.url + '" target="_blank" rel="noopener">See it at ' + deal.store + " →</a> " +
    '<a class="detail-link" href="#/deal/' + deal.id + '">Full verdict</a></p>';
  return card;
}

function renderGrid(deals, gridEl) {
  gridEl.textContent = "";
  deals.forEach(function (deal) { gridEl.appendChild(dealCard(deal)); });
}

function renderDetail(deal, el) {
  var pct = discountPct(deal);
  el.innerHTML =
    '<p><a href="#/" class="back-link">← Back to all deals</a></p>' +
    '<div class="card-top"><span class="store-chip">' + deal.store + "</span>" +
    '<span class="pct">-' + pct + "%</span></div>" +
    "<h2>" + deal.name + "</h2>" +
    '<p class="prices big"><span class="sale">' + money(deal.sale) + '</span> ' +
    '<span class="usual">' + money(deal.usual) + '</span> ' +
    '<span class="saved">you save ' + money(deal.usual - deal.sale) + "</span></p>" +
    verdictBadge(deal) +
    '<p class="verdict-note">' + deal.verdictNote + "</p>" +
    '<p class="blurb">' + deal.blurb + "</p>" +
    (deal.compare ? '<p class="compare">Compare: ' + deal.compare + "</p>" : "") +
    '<dl class="fact-list">' +
    "<div><dt>Category</dt><dd>" + deal.category + "</dd></div>" +
    "<div><dt>Store</dt><dd>" + deal.store + "</dd></div>" +
    "<div><dt>Price checked</dt><dd>" + deal.checked + "</dd></div>" +
    "<div><dt>Where the price was read</dt><dd>" + deal.source + "</dd></div>" +
    "</dl>" +
    '<p><a class="store-link big-link" href="' + deal.url + '" target="_blank" rel="noopener">See it at ' + deal.store + " →</a></p>";
}
