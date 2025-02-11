//tup and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const squareMessages = [
    "OW!",
    "WHAT WAS THAT FOR?!",
    "STOP!",
    "WAAA!",
    "WHY?!",
    "PLEASE NO!",
    "OWWW!"
];

// Inventory panel and items list elements
const inventoryPanel = document.getElementById('inventoryPanel');
const inventoryItemsList = document.getElementById('inventoryItems');
const equipButtonSlipper = document.getElementById('equipButtonSlipper');
const equipButtonBottle = document.getElementById('equipButtonBottle');
const equipButtonBelt = document.getElementById('equipButtonBelt');
const equipButtonWhip = document.getElementById('equipButtonWhip');
const shopButton = document.getElementById('shopButton');
const respawnButton = document.getElementById('respawnButton');

// Debug mode variable
let debugMode = false;

// Image setups
const playerImage = new Image();
playerImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_162704710.png";

const slipperImage = new Image();
slipperImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/file.png";

const bottleImage = new Image();
bottleImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_210214474.png";

const beltImage = new Image();
beltImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/belt.png";

const whipImage = new Image();
whipImage.src = "https://assets.onecompiler.app/42wswghpg/42wymus2a/image_2024-11-02_214730449.png";

const houseImage = new Image();
houseImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_161736155.png";

const squareImage = new Image();
squareImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_163043863.png";

const weaponImage = new Image();
weaponImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/file.png";

// House background image setup with loading handler
const houseBackgroundImage = new Image();
houseBackgroundImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/house_interior.png";
let houseBackgroundLoaded = false;
houseBackgroundImage.addEventListener('load', () => {
    houseBackgroundLoaded = true;
    console.log('House background loaded successfully');
});

// After your other constants like challengeArea
// Player properties

const characters = {
    unknown: {
        name: "UNKNOWN NAME",
        coinMultiplier: 1,
        speedMultiplier: 1,
        image: playerImage
    },
    henry: {
        name: "Henry",
        coinMultiplier: 2,
        speedMultiplier: 1.2,
        image: new Image(),
        cost: 1000
    }
};

// Set Henry's image
characters.henry.image.src = "https://assets.onecompiler.app/42wswghpg/42wymus2a/image_2024-11-02_224452006.png";

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 5
};

// Key press tracking
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
};

// House properties
const house = {
    x: canvas.width - 100,
    y: 10,
    width: 80,
    height: 80
};

// Square position and properties
const square = {
    x: house.x + 10,
    y: house.y + 30,
    width: 60,
    height: 40,
    collided: false,
    velocity: {
        x: 0,
        y: 0
    },
    friction: 0.98
};

// Area states
let currentArea = "Outside";
const exitBox = {
    x: (canvas.width / 2) - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40
};

const weapon = {
    x: (3 * canvas.width) / 4,
    y: canvas.height / 2,
    width: 40,
    height: 40
};

// Game state variables
let inventory = [];
let equippedWeapon = null;
let coins = 0;
let canHitSquare = true;

// Slipper pickup properties
const slipperPickup = {
    x: house.x + 20,
    y: house.y + 10,
    width: 40,
    height: 40
};

// Shop setup
const shopPanel = document.createElement('div');
const shopItemsList = document.createElement('ul');
const buyBottleButton = document.createElement('button');
const buyBeltButton = document.createElement('button');
shopPanel.id = 'shopPanel';
buyBottleButton.textContent = "Buy Bottle (10 Coins)";
buyBeltButton.textContent = "Buy Belt (150 Coins)";

const whipLi = document.createElement('li');
whipLi.textContent = "Whip - 500 Coins";
shopItemsList.appendChild(whipLi);

const buyWhipButton = document.createElement('button');
buyWhipButton.textContent = "Buy Whip (500 Coins)";
shopPanel.appendChild(buyWhipButton);

buyWhipButton.addEventListener('click', () => {
    if (coins >= 500) {
        coins -= 500;
        addToInventory("Whip");
        updateInventoryDisplay();
        updateShopDisplay();
    } else {
        alert("Not enough coins to buy the Whip!");
    }
});

const maceLi = document.createElement('li');
maceLi.textContent = "Mace - 750 Coins";
shopItemsList.appendChild(maceLi);

const buyMaceButton = document.createElement('button');
buyMaceButton.textContent = "Buy Mace (750 Coins)";
shopPanel.appendChild(buyMaceButton);

buyMaceButton.addEventListener('click', () => {
    if (coins >= 750) {
        coins -= 750;
        addToInventory("Mace");
        updateInventoryDisplay();
        updateShopDisplay();
    } else {
        alert("Not enough coins to buy the Mace!");
    }
});

shopPanel.appendChild(shopItemsList);
shopPanel.appendChild(buyBottleButton);
shopPanel.appendChild(buyBeltButton);
document.body.appendChild(shopPanel);

const characterShopPanel = document.createElement('div');
characterShopPanel.id = 'characterShopPanel';
characterShopPanel.style.display = 'none';

const buyHenryButton = document.createElement('button');
buyHenryButton.textContent = "Buy Henry (1000 Coins)";
characterShopPanel.appendChild(buyHenryButton);

document.body.appendChild(characterShopPanel);

let currentCharacter = characters.unknown;
let unlockedCharacters = ['unknown'];

buyHenryButton.addEventListener('click', () => {
    if (coins >= 1000 && !unlockedCharacters.includes('henry')) {
        coins -= 1000;
        unlockedCharacters.push('henry');
        currentCharacter = characters.henry;
        player.speed *= currentCharacter.speedMultiplier;
        buyHenryButton.textContent = "Select Henry";
    } else if (unlockedCharacters.includes('henry')) {
        currentCharacter = characters.henry;
        player.speed = 5 * currentCharacter.speedMultiplier;
    }
});

document.getElementById('characterShopButton').addEventListener('click', () => {
    characterShopPanel.style.display = characterShopPanel.style.display === 'none' ? 'block' : 'none';
});

function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.top = '50%';
    debugPanel.style.left = '50%';
    debugPanel.style.transform = 'translate(-50%, -50%)';
    debugPanel.style.backgroundColor = '#333';
    debugPanel.style.padding = '20px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.display = 'none';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Enter debug password';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';

    const coinInput = document.createElement('input');
    coinInput.type = 'number';
    coinInput.placeholder = 'Enter coin amount';
    coinInput.style.display = 'none';

    const addCoinsButton = document.createElement('button');
    addCoinsButton.textContent = 'Add Coins';
    addCoinsButton.style.display = 'none';

    submitButton.addEventListener('click', () => {
        if (passwordInput.value === 'dadnameharold') {
            passwordInput.style.display = 'none';
            submitButton.style.display = 'none';
            coinInput.style.display = 'block';
            addCoinsButton.style.display = 'block';
        }
    });

    addCoinsButton.addEventListener('click', () => {
        coins += parseInt(coinInput.value) || 0;
        debugPanel.style.display = 'none';
        debugMode = false;
    });

    debugPanel.appendChild(passwordInput);
    debugPanel.appendChild(submitButton);
    debugPanel.appendChild(coinInput);
    debugPanel.appendChild(addCoinsButton);
    document.body.appendChild(debugPanel);

    return debugPanel;
}

// Respawn button functionality
respawnButton.addEventListener('click', () => {
    square.x = player.x;
    square.y = player.y;
    square.velocity.x = 0;
    square.velocity.y = 0;
});

function toggleEquipSlipper() {
    if (equippedWeapon === "Slipper") {
        equippedWeapon = null;
        equipButtonSlipper.textContent = "Equip Slipper";
    } else if (inventory.includes("Slipper")) {
        equippedWeapon = "Slipper";
        equipButtonSlipper.textContent = "Unequip Slipper";
    }
    updateInventoryDisplay();
}

function toggleEquipBottle() {
    if (equippedWeapon === "Bottle") {
        equippedWeapon = null;
        equipButtonBottle.textContent = "Equip Bottle";
    } else if (inventory.includes("Bottle")) {
        equippedWeapon = "Bottle";
        equipButtonBottle.textContent = "Unequip Bottle";
    }
    updateInventoryDisplay();
}

function toggleEquipBelt() {
    if (equippedWeapon === "Belt") {
        equippedWeapon = null;
        equipButtonBelt.textContent = "Equip Belt";
    } else if (inventory.includes("Belt")) {
        equippedWeapon = "Belt";
        equipButtonBelt.textContent = "Unequip Belt";
    }
    updateInventoryDisplay();
}

function toggleEquipWhip() {
    if (equippedWeapon === "Whip") {
        equippedWeapon = null;
        equipButtonWhip.textContent = "Equip Whip";
    } else if (inventory.includes("Whip")) {
        equippedWeapon = "Whip";
        equipButtonWhip.textContent = "Unequip Whip";
    }
    updateInventoryDisplay();
}

function toggleEquipMace() {
    if (equippedWeapon === "Mace") {
        equippedWeapon = null;
        equipButtonMace.textContent = "Equip Mace";
    } else if (inventory.includes("Mace")) {
        equippedWeapon = "Mace";
        equipButtonMace.textContent = "Unequip Mace";
    }
    updateInventoryDisplay();
}

function addToInventory(item) {
    if (!inventory.includes(item)) {
        inventory.push(item);
        updateInventoryDisplay();
    }
}

function updateInventoryDisplay() {
    inventoryItemsList.innerHTML = '';
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        inventoryItemsList.appendChild(li);
    });
    inventoryPanel.style.display = inventory.length > 0 ? 'block' : 'none';
}

shopButton.addEventListener('click', () => {
    shopPanel.style.display = shopPanel.style.display === 'none' ? 'block' : 'none';
    updateShopDisplay();
});

function updateShopDisplay() {
    shopItemsList.innerHTML = '';
    const bottleLi = document.createElement('li');
    const beltLi = document.createElement('li');
    bottleLi.textContent = "Bottle - 10 Coins";
    beltLi.textContent = "Belt - 150 Coins";
    shopItemsList.appendChild(bottleLi);
    shopItemsList.appendChild(beltLi);
}

buyBottleButton.addEventListener('click', () => {
    if (coins >= 10) {
        coins -= 10;
        addToInventory("Bottle");
        updateInventoryDisplay();
        updateShopDisplay();
        console.log(`Coins: ${coins}`);
    } else {
        alert("Not enough coins to buy the Bottle!");
    }
});

buyBeltButton.addEventListener('click', () => {
    if (coins >= 150) {
        coins -= 150;
        addToInventory("Belt");
        updateInventoryDisplay();
        updateShopDisplay();
        console.log(`Coins: ${coins}`);
    } else {
        alert("Not enough coins to buy the Belt!");
    }
});

function update() {
    // Movement
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;

    // Area transitions and collisions
    if (player.x < house.x + house.width && player.x + player.width > house.x &&
        player.y < house.y + house.height && player.y + player.height > house.y) {
        currentArea = "House";
    }
    
    // In the update function, add this for the Outside area

    if (currentArea === "House" && player.x < exitBox.x + exitBox.width &&
        player.x + player.width > exitBox.x && player.y < exitBox.y + exitBox.height &&
        player.y + player.height > exitBox.y) {
        currentArea = "Outside";
    }

    // Square collision and mechanics
    if (currentArea === "House" && player.x < square.x + square.width &&
        player.x + player.width > square.x && player.y < square.y + square.height &&
        player.y + player.height > square.y) {
        if (canHitSquare) {
            let coinReward = 5;
              if (equippedWeapon === "Slipper") {
                coinReward *= 1.5;
              } else if (equippedWeapon === "Bottle") {
                coinReward *= 2;
              } else if (equippedWeapon === "Belt") {
                coinReward *= 3;
              } else if (equippedWeapon === "Whip") {
                coinReward *= 5;  // Add the whip multiplier right here!
              } else if (equippedWeapon === "Mace") {
                coinReward *= 10;
              }
            coinReward *= currentCharacter.coinMultiplier;
            coins += Math.floor(coinReward);
            const randomMessage = squareMessages[Math.floor(Math.random() * squareMessages.length)];
            const messageX = square.x + square.width / 2;
            const messageY = square.y - 20;
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(randomMessage, messageX, messageY);
            console.log(`Coins: ${coins}`);

            const hitDirectionX = (player.x + player.width / 2) - (square.x + square.width / 2);
            const hitDirectionY = (player.y + player.height / 2) - (square.y + square.height / 2);
            const magnitude = Math.sqrt(hitDirectionX * hitDirectionX + hitDirectionY * hitDirectionY);

            if (magnitude !== 0) {
                square.velocity.x = (hitDirectionX / magnitude) * 5;
                square.velocity.y = (hitDirectionY / magnitude) * 5;
            }
            canHitSquare = false;
            setTimeout(() => {
                canHitSquare = true;
            }, 1000);
        }
    }

    // Slipper pickup collision
    if (currentArea === "House" && player.x < slipperPickup.x + slipperPickup.width &&
        player.x + player.width > slipperPickup.x && player.y < slipperPickup.y + slipperPickup.height &&
        player.y + player.height > slipperPickup.y) {
        addToInventory("Slipper");
        slipperPickup.x = -100;
    }

    // Update square physics
    square.x += square.velocity.x;
    square.y += square.velocity.y;
    square.velocity.x *= square.friction;
    square.velocity.y *= square.friction;

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentArea === "House") {
        // Draw house background only if loaded
        if (houseBackgroundLoaded) {
            ctx.drawImage(houseBackgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#8B0000"; // Dark red background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(houseImage, house.x, house.y, house.width, house.height);
        ctx.drawImage(squareImage, square.x, square.y, square.width, square.height);
        ctx.drawImage(slipperImage, slipperPickup.x, slipperPickup.y, slipperPickup.width, slipperPickup.height);
    } else {
        ctx.fillStyle = "lightgreen";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(currentCharacter.image, player.x, player.y, player.width, player.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Coins: ${coins}`, 10, 20);

    requestAnimationFrame(update);
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
    if (e.key === 'o' || e.key === 'O') {
        const debugPanel = document.getElementById('debugPanel') || createDebugPanel();
        debugPanel.style.display = 'block';
        debugMode = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

equipButtonSlipper.addEventListener('click', toggleEquipSlipper);
equipButtonBottle.addEventListener('click', toggleEquipBottle);
equipButtonBelt.addEventListener('click', toggleEquipBelt);
equipButtonWhip.addEventListener('click', toggleEquipWhip);
equipButtonMace.addEventListener('click', toggleEquipMace);

// Start game
update();