// TAGDROP finder logic: search, filters, sorting and hash routing.
// Reads the form controls, filters window.DEALS, hands results to render.js.
// Filter state also lives in the hash (e.g. #/find?cat=Audio&min=40) so a
// filtered view can be linked, screenshotted and shared.

function uniqueValues(deals, key) {
  var seen = {};
  deals.forEach(function (d) { seen[d[key]] = true; });
  return Object.keys(seen).sort();
}

function fillSelect(selectEl, values, allLabel) {
  selectEl.innerHTML = "";
  var all = document.createElement("option");
  all.value = "all";
  all.textContent = allLabel;
  selectEl.appendChild(all);
  values.forEach(function (v) {
    var opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
}

function currentFilters() {
  return {
    q: document.getElementById("searchInput").value.trim().toLowerCase(),
    cat: document.getElementById("categoryFilter").value,
    store: document.getElementById("storeFilter").value,
    min: Number(document.getElementById("discountFilter").value),
    verdict: document.getElementById("verdictFilter").value,
    sort: document.getElementById("sortSelect").value
  };
}

function applyFilters(deals, f) {
  var out = deals.filter(function (d) {
    if (f.cat !== "all" && d.category !== f.cat) return false;
    if (f.store !== "all" && d.store !== f.store) return false;
    if (discountPct(d) < f.min) return false;
    if (f.verdict !== "all" && d.verdict !== f.verdict) return false;
    if (f.q) {
      var hay = (d.name + " " + d.store + " " + d.category + " " + d.blurb).toLowerCase();
      if (hay.indexOf(f.q) === -1) return false;
    }
    return true;
  });
  var by = {
    discount: function (a, b) { return discountPct(b) - discountPct(a); },
    savings: function (a, b) { return (b.usual - b.sale) - (a.usual - a.sale); },
    priceAsc: function (a, b) { return a.sale - b.sale; },
    priceDesc: function (a, b) { return b.sale - a.sale; }
  };
  return out.sort(by[f.sort] || by.discount);
}

function syncHashFromFilters(f) {
  var params = [];
  if (f.cat !== "all") params.push("cat=" + encodeURIComponent(f.cat));
  if (f.store !== "all") params.push("store=" + encodeURIComponent(f.store));
  if (f.min > 0) params.push("min=" + f.min);
  if (f.verdict !== "all") params.push("verdict=" + f.verdict);
  if (f.q) params.push("q=" + encodeURIComponent(f.q));
  var target = "#/find" + (params.length ? "?" + params.join("&") : "");
  if (location.hash !== target && location.hash.indexOf("#/deal/") !== 0) {
    history.replaceState(null, "", target);
  }
}

function applyHashToFilters() {
  var hash = location.hash;
  if (hash.indexOf("#/find?") !== 0) return;
  var query = new URLSearchParams(hash.slice("#/find?".length));
  if (query.get("cat")) document.getElementById("categoryFilter").value = query.get("cat");
  if (query.get("store")) document.getElementById("storeFilter").value = query.get("store");
  if (query.get("min")) document.getElementById("discountFilter").value = query.get("min");
  if (query.get("verdict")) document.getElementById("verdictFilter").value = query.get("verdict");
  if (query.get("q")) document.getElementById("searchInput").value = query.get("q");
}

function refresh() {
  var f = currentFilters();
  var results = applyFilters(window.DEALS.slice(), f);
  renderGrid(results, document.getElementById("dealGrid"));
  document.getElementById("emptyNote").hidden = results.length > 0;
  document.getElementById("resultCount").textContent =
    "Showing " + results.length + " of " + window.DEALS.length + " checked deals";
  syncHashFromFilters(f);
}

function showRoute() {
  var hash = location.hash || "#/";
  var main = document.getElementById("app");
  var detail = document.getElementById("detailView");
  var chrome = [document.getElementById("verdictKey"), document.getElementById("toolbar")];
  if (hash.indexOf("#/deal/") === 0) {
    var id = hash.slice("#/deal/".length);
    var deal = window.DEALS.find(function (d) { return d.id === id; });
    if (deal) {
      renderDetail(deal, detail);
      detail.hidden = false;
      main.style.display = "none";
      chrome.forEach(function (el) { el.style.display = "none"; });
      window.scrollTo(0, 0);
      return;
    }
  }
  detail.hidden = true;
  main.style.display = "";
  chrome.forEach(function (el) { el.style.display = ""; });
  refresh();
}

document.addEventListener("DOMContentLoaded", function () {
  fillSelect(document.getElementById("categoryFilter"), uniqueValues(window.DEALS, "category"), "All categories");
  fillSelect(document.getElementById("storeFilter"), uniqueValues(window.DEALS, "store"), "All stores");
  var stores = uniqueValues(window.DEALS, "store").length;
  var cats = uniqueValues(window.DEALS, "category").length;
  document.getElementById("headStats").innerHTML =
    "<span><strong>" + window.DEALS.length + "</strong> deals</span>" +
    "<span><strong>" + stores + "</strong> stores</span>" +
    "<span><strong>" + cats + "</strong> categories</span>" +
    "<span>Checked <strong>Fri 27 Nov 2026</strong> (WIB)</span>" +
    "<span>Up to <strong>67% off</strong></span>";
  ["searchInput", "categoryFilter", "storeFilter", "discountFilter", "verdictFilter", "sortSelect"]
    .forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("input", refresh);
      el.addEventListener("change", refresh);
    });
  applyHashToFilters();
  showRoute();
  window.addEventListener("hashchange", showRoute);
});
