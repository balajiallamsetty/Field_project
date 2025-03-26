document.addEventListener('DOMContentLoaded', () => {
    const cargoForm = document.getElementById('cargo-form');
    const itemsList = document.getElementById('items-list').getElementsByTagName('tbody')[0];
    const optimizeButton = document.getElementById('optimize-button');
    const optimalItems = document.getElementById('optimal-items').getElementsByTagName('tbody')[0];
    const totalProfit = document.getElementById('total-profit');
    const maxWeightInput = document.getElementById('max-weight');
    const itemNameInput = document.getElementById('item');

    let items = [];

    function renderItems() {
        itemsList.innerHTML = '';
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.value}</td>
                <td>${item.weight}</td>
                <td>
                    <div class="actions-container">
                        <button class="edit-btn" data-index="${index}">Edit</button>
                        <button class="remove-btn" data-index="${index}">Remove</button>
                    </div>
                </td>
            `;
            itemsList.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                editItem(index);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                removeItem(index);
            });
        });
    }

    function editItem(index) {
        const item = items[index];
        document.getElementById('item').value = item.name;
        document.getElementById('value').value = item.value;
        document.getElementById('weight').value = item.weight;

        cargoForm.innerHTML = `
            <div class="form-group">
                <input type="text" id="item" placeholder="Item Name" required value="${item.name}">
            </div>
            <div class="form-group">
                <input type="number" id="value" placeholder="Item Value" required value="${item.value}">
            </div>
            <div class="form-group">
                <input type="number" id="weight" placeholder="Item Weight" required value="${item.weight}">
            </div>
            <div class="actions-container">
                <button id="update-item" data-index="${index}">Update Item</button>
                <button id="cancel-edit">Cancel</button>
            </div>
        `;

        document.getElementById('update-item').addEventListener('click', () => {
            updateItem(index);
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            resetForm();
        });
    }

    function updateItem(index) {
        items[index].name = document.getElementById('item').value;
        items[index].value = parseFloat(document.getElementById('value').value);
        items[index].weight = parseFloat(document.getElementById('weight').value);
        resetForm();
        renderItems();
    }

    function removeItem(index) {
        items.splice(index, 1);
        renderItems();
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const name = document.getElementById('item').value;
        const value = parseFloat(document.getElementById('value').value);
        const weight = parseFloat(document.getElementById('weight').value);

        if (name && !isNaN(value) && !isNaN(weight)) {
            items.push({ name, value, weight });
            renderItems();
            cargoForm.reset();
            itemNameInput.focus();
        }
    }

    function resetForm() {
        cargoForm.innerHTML = `
            <div class="form-group">
                <input type="text" id="item" placeholder="Item Name" required>
            </div>
            <div class="form-group">
                <input type="number" id="value" placeholder="Item Value" required>
            </div>
            <div class="form-group">
                <input type="number" id="weight" placeholder="Item Weight" required>
            </div>
            <div style="text-align: center;">
                <button type="submit" id="paral">Add Item</button>
            </div>
        `;
        cargoForm.addEventListener('submit', handleFormSubmit);
        itemNameInput.focus();
    }

    function knapsack(maxWeight, items) {
        const n = items.length;
        const dp = Array(n + 1).fill(null).map(() => Array(maxWeight + 1).fill(0));

        for (let i = 1; i <= n; i++) {
            for (let w = 1; w <= maxWeight; w++) {
                if (items[i - 1].weight <= w) {
                    dp[i][w] = Math.max(
                        items[i - 1].value + dp[i - 1][w - items[i - 1].weight],
                        dp[i - 1][w]
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        let w = maxWeight;
        const selectedItems = [];
        for (let i = n; i > 0 && dp[i][w] !== 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                selectedItems.push(items[i - 1]);
                w -= items[i - 1].weight;
            }
        }

        return { selectedItems, totalValue: dp[n][maxWeight] };
    }

    function renderOptimalItems(selectedItems, totalValue) {
        optimalItems.innerHTML = '';
        selectedItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.value}</td>
                <td>${item.weight}</td>
            `;
            optimalItems.appendChild(row);
        });
        totalProfit.textContent = `$${totalValue}`;
    }

    cargoForm.addEventListener('submit', handleFormSubmit);

    optimizeButton.addEventListener('click', () => {
        const maxWeight = parseFloat(maxWeightInput.value);
        if (!isNaN(maxWeight)) {
            const optimal = knapsack(maxWeight, items);
            renderOptimalItems(optimal.selectedItems, optimal.totalValue);
        }
    });

    renderItems();
    itemNameInput.focus();

    // Canvas Trail Effect
    const canvas = document.getElementById('trail-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const baseColors = [
        "rgba(0, 51, 102, 0.8)",  // Dark Blue
        "rgba(255, 99, 71, 0.8)", // Tomato
    ];
    const pixieDustColors = [
        "rgba(0, 51, 102, 0.8)",  // Dark Blue
        "rgba(255, 99, 71, 0.8)", // Tomato
    ];

    function getRandomColor(isPixieDust) {
        if (isPixieDust) {
            return pixieDustColors[Math.floor(Math.random() * pixieDustColors.length)];
        }
        return baseColors[Math.floor(Math.random() * baseColors.length)];
    }

    let cursorColor = "rgba(0, 80, 150, 0.8)"; // Default cursor color
    document.addEventListener('mousemove', (e) => {
        const baseColor = getRandomColor(false);
        const pixieColor = getRandomColor(true);
        cursorColor = baseColor; // Update cursor color
        for (let i = 0; i < 5; i++) { // More particles for pixie dust
            particles.push({
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 2 + 1, // Smaller particles
                color: i % 2 === 0 ? baseColor : pixieColor, // Alternate colors
                opacity: 1,
                decay: 0.02, // Increased decay for faster fade
                speedX: (Math.random() - 0.5) * 2, // Slightly increased speed
                speedY: (Math.random() - 0.5) * 2,
                isPixie: true, // Custom flag for pixie dust
                animationFrame: 0, //track the animation frame
            });
        }
    });

    function drawPixieDust(context, x, y, color, frame) {
        context.fillStyle = color;
        context.globalAlpha = 0.8; //make it a bit transparent
        const dustSize = 2;
        const variation = Math.sin(frame * 0.1) * 2; //slow down sin
        context.beginPath();
        context.arc(x, y, dustSize + variation, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity -= particle.decay;
            particle.animationFrame++;

            if (particle.opacity <= 0) {
                particles.splice(index, 1);
            } else {
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;

                if (particle.isPixie) {
                    drawPixieDust(ctx, particle.x, particle.y, particle.color, particle.animationFrame);
                } else {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            }
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
