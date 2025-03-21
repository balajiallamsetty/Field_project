const cargoForm = document.getElementById('cargo-form');
const itemsList = document.getElementById('items-list');
const optimizeButton = document.getElementById('optimize-button');
const optimalItems = document.getElementById('optimal-items');
const totalProfitDisplay = document.getElementById('total-profit');

let items = [];
let editingIndex = -1;

cargoForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const itemName = document.getElementById('item').value;
    const itemValue = parseInt(document.getElementById('value').value);
    const itemWeight = parseInt(document.getElementById('weight').value);
    
    if (editingIndex === -1) {
        items.push({ name: itemName, value: itemValue, weight: itemWeight });
    } else {
        items[editingIndex] = { name: itemName, value: itemValue, weight: itemWeight };
        editingIndex = -1;
        document.getElementById('paral').textContent = 'Add Item';
    }
    updateItemsList();
    cargoForm.reset();
});

function updateItemsList() {
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td>${item.weight}</td>
            <td>
                <button class="edit-btn">Edit</button>
            </td>
        `;
        row.querySelector('.edit-btn').addEventListener('click', () => editItem(index));
        itemsList.appendChild(row);
    });
}

function editItem(index) {
    const item = items[index];
    document.getElementById('item').value = item.name;
    document.getElementById('value').value = item.value;
    document.getElementById('weight').value = item.weight;
    editingIndex = index;
    document.getElementById('paral').textContent = 'Update Item';
}

optimizeButton.addEventListener('click', function() {
    const maxWeight = parseInt(document.getElementById('max-weight').value);
    const { optimal, totalProfit } = optimizeCargoLoading(items, maxWeight);
    displayOptimalItems(optimal);
    totalProfitDisplay.textContent = `$${totalProfit}`;
});

function optimizeCargoLoading(items, maxWeight) {
    const n = items.length;
    const dp = Array(n + 1).fill(0).map(() => Array(maxWeight + 1).fill(0));

    // Build the dp array
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= maxWeight; w++) {
            if (items[i - 1].weight <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - items[i - 1].weight] + items[i - 1].value);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Find the optimal items
    let totalProfit = dp[n][maxWeight];
    let optimalItems = [];
    let w = maxWeight;

    for (let i = n; i > 0 && totalProfit > 0; i--) {
        if (totalProfit !== dp[i - 1][w]) {
            optimalItems.push(items[i - 1]);
            totalProfit -= items[i - 1].value;
            w -= items[i - 1].weight;
        }
    }

    return { optimal: optimalItems.reverse(), totalProfit: dp[n][maxWeight] };
}

function displayOptimalItems(optimal) {
    optimalItems.innerHTML = '';
    optimal.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td>${item.weight}</td>
        `;
        optimalItems.appendChild(row);
    });
}
