let currentMin = 0;
let currentMax = 2;
let selectedFish = null;

function renderRodsSelector(selected = "0") {
  const container = document.getElementById('rodsSelector');
  container.innerHTML = '';
  rods.forEach(rod => {
    const btn = document.createElement('button');
    btn.textContent = rod.display;
    if (rod.display === selected) btn.classList.add('selected');
    btn.onclick = () => selectRod(rod.display, rod.min, rod.max);
    container.appendChild(btn);
  });
}

function selectRod(display, min, max) {
  currentMin = min;
  currentMax = max;
  document.cookie = `selectedRod=${display}; path=/; max-age=31536000`;
  renderRodsSelector(display);
  renderTables();
  resetHighlight();
}

function renderTables() {
  renderFishTable('arboreaTable', regions.arborea);
  renderFishTable('exodorTable', regions.exodor);
}

function renderFishTable(tableId, region) {
  const table = document.getElementById(tableId);
  table.innerHTML = '';

  table.style.setProperty('--location-count', region.locations.length);

  const locations = region.locations;
  const fishList = region.fish;

  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  hr.innerHTML = `<th>Ранг</th>`;
  locations.forEach(loc => {
    const th = document.createElement('th');
    th.textContent = loc;
    th.dataset.location = loc;
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  const byRank = {};
  fishList.forEach(fish => {
    const r = fish.rank === "Шедевр" ? "Шедевр" : fish.rank;
    if (!byRank[r]) byRank[r] = [];
    byRank[r].push(fish);
  });

  const sortedRanks = Object.keys(byRank).sort((a, b) => {
    if (a === "Шедевр") return 1;
    if (b === "Шедевр") return -1;
    return Number(a) - Number(b);
  });

  const tbody = document.createElement('tbody');

  sortedRanks.forEach(rank => {
    const numeric = rank === "Шедевр" ? 999 : Number(rank);
    const available = numeric >= currentMin && numeric <= currentMax;
    if (!available) return;

    const tr = document.createElement('tr');

    const tdRank = document.createElement('td');
    tdRank.textContent = rank;
    tr.appendChild(tdRank);

    locations.forEach(loc => {
      const td = document.createElement('td');
      td.classList.add('fish-cell');
      td.dataset.location = loc;

      const fishesHere = byRank[rank].filter(fish => fish.l.includes(loc));

      if (fishesHere.length > 0) {
        const container = document.createElement('div');
        container.className = 'fish-container';

        fishesHere.forEach(fish => {
          const fishItem = document.createElement('div');
          fishItem.className = 'fish-item';
          fishItem.dataset.fishId = fish.id;
          fishItem.innerHTML = `
            <img src="images/${fish.id}.webp" alt="${fish.name}"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMzMzIj48L3JlY3Q+PHRleHQgeD0iMjUiIHk9IjMwIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+PyA8L3RleHQ+PC9zdmc+';">
            <div class="name">${fish.name}</div>
          `;
          fishItem.onclick = (e) => {
            e.stopPropagation();
            selectFish(fish);
          };
          container.appendChild(fishItem);
        });

        td.appendChild(container);
      } else {
        td.innerHTML = '—';
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}

function selectFish(fish) {
  selectedFish = fish;
  resetHighlight();

  document.querySelectorAll('.fish-item').forEach(item => {
    if (parseInt(item.dataset.fishId) === fish.id) {
      item.classList.add('selected-fish');
    }
  });

  fish.l.forEach(loc => highlightColumn(loc));
  highlightLocations(fish.l);
}

function highlightColumn(locationName) {
  const activeTable = document.querySelector('.tab-content.active table');
  if (!activeTable) return;

  activeTable.querySelectorAll('thead th').forEach(th => {
    if (th.dataset.location === locationName) th.classList.add('column-highlight');
  });

  activeTable.querySelectorAll('tbody td.fish-cell').forEach(td => {
    if (td.dataset.location === locationName) td.classList.add('column-highlight');
  });
}

function highlightLocations(selectedLocations) {
  const activeTable = document.querySelector('.tab-content.active table');
  if (!activeTable) return;

  activeTable.querySelectorAll('thead th').forEach(th => {
    if (th.dataset.location && selectedLocations.includes(th.dataset.location)) {
      th.classList.add('location-highlight');
    }
  });
}

function resetHighlight() {
  selectedFish = null;
  document.querySelectorAll('.selected-fish').forEach(el => el.classList.remove('selected-fish'));
  document.querySelectorAll('.column-highlight').forEach(el => el.classList.remove('column-highlight'));
  document.querySelectorAll('.location-highlight').forEach(el => el.classList.remove('location-highlight'));
}

function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add('active');
  resetHighlight();
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const saved = getCookie('selectedRod');
const initial = rods.find(r => r.display === saved) || rods[0];

selectRod(initial.display, initial.min, initial.max);
renderTables();