// मुख्य गेम वेरिएबल्स
let scene, camera, renderer;
let gold = 100;
let soldiers = 5;
let territory = 1;
let playerTeam = null;
let gameStarted = false;
let currentLevel = 1;
let currentXP = 0;
let nextLevelXP = 100;

// सैनिक लेवल और स्टैट्स
let soldierLevels = {
    infantry: 1,
    cavalry: 1,
    archer: 1,
    elephant: 1
};

let soldierStats = {
    infantry: { attack: 10, health: 100, speed: 0.1 },
    cavalry: { attack: 15, health: 120, speed: 0.15 },
    archer: { attack: 8, health: 80, speed: 0.08, range: 15 },
    elephant: { attack: 25, health: 200, speed: 0.07 }
};

// गेम ऑब्जेक्ट्स
let playerFort = null;
let enemyFort = null;
let soldierModels = [];
let terrain = null;

// गेम इनिशियलाइजेशन
function init() {
    // Scene सेटअप
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Camera सेटअप
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
    
    // Renderer सेटअप
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    // लाइटिंग
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // ग्राउंड तैयार करें
    createGround();
    
    // UI इवेंट लिस्नर्स
    document.getElementById('maratha-btn').addEventListener('click', () => selectTeam('maratha'));
    document.getElementById('mughal-btn').addEventListener('click', () => selectTeam('mughal'));
    document.getElementById('infantry-btn').addEventListener('click', () => buySoldier('infantry'));
    document.getElementById('cavalry-btn').addEventListener('click', () => buySoldier('cavalry'));
    document.getElementById('archer-btn').addEventListener('click', () => buySoldier('archer'));
    document.getElementById('elephant-btn').addEventListener('click', () => buySoldier('elephant'));
    
    document.getElementById('upgrade-infantry').addEventListener('click', () => upgradeSoldier('infantry'));
    document.getElementById('upgrade-cavalry').addEventListener('click', () => upgradeSoldier('cavalry'));
    document.getElementById('upgrade-archer').addEventListener('click', () => upgradeSoldier('archer'));
    document.getElementById('upgrade-elephant').addEventListener('click', () => upgradeSoldier('elephant'));
    
    // रिसाइज इवेंट
    window.addEventListener('resize', onWindowResize);
    
    // गेम लूप शुरू करें
    animate();
}

// ग्राउंड बनाना
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x3a8c3a,
        side: THREE.DoubleSide
    });
    
    terrain = new THREE.Mesh(groundGeometry, groundMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
    
    // कुछ झीलें और पहाड़ जोड़ें
    addWaterBodies();
    addMountains();
    addTrees();
}

// पानी की सतह जोड़ें
function addWaterBodies() {
    const waterGeometry = new THREE.PlaneGeometry(15, 10);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1e90ff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const water1 = new THREE.Mesh(waterGeometry, waterMaterial);
    water1.rotation.x = -Math.PI / 2;
    water1.position.set(-30, 0.1, -30);
    scene.add(water1);
    
    const water2 = new THREE.Mesh(waterGeometry, waterMaterial);
    water2.rotation.x = -Math.PI / 2;
    water2.position.set(25, 0.1, 20);
    scene.add(water2);
}

// पहाड़ जोड़ें
function addMountains() {
    const mountainGeometry = new THREE.ConeGeometry(5, 8, 8);
    const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    
    for (let i = 0; i < 5; i++) {
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(
            Math.random() * 80 - 40,
            4,
            Math.random() * 80 - 40
        );
        mountain.castShadow = true;
        scene.add(mountain);
    }
}

// पेड़ जोड़ें
function addTrees() {
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    
    for (let i = 0; i < 10; i++) {
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        
        trunk.position.set(
            Math.random() * 80 - 40,
            2.5,
            Math.random() * 80 - 40
        );
        
        leaves.position.set(
            trunk.position.x,
            trunk.position.y + 3,
            trunk.position.z
        );
        
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        leaves.castShadow = true;
        
        scene.add(trunk);
        scene.add(leaves);
    }
}

// टीम चयन
function selectTeam(team) {
    playerTeam = team;
    document.getElementById('team-selection').style.display = 'none';
    gameStarted = true;
    
    // किले बनाएं
    createForts();
    
    // प्रारंभिक सैनिक जोड़ें
    addInitialSoldiers();
    
    // UI अपडेट करें
    updateUI();
    updateLevelUI();
    updateSoldierStatsUI();
}

// किले बनाना
function createForts() {
    const fortGeometry = new THREE.BoxGeometry(8, 6, 8);
    
    // प्लेयर का किला
    const playerFortMaterial = new THREE.MeshLambertMaterial({ 
        color: playerTeam === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    playerFort = new THREE.Mesh(fortGeometry, playerFortMaterial);
    playerFort.position.set(0, 3, -40);
    playerFort.castShadow = true;
    playerFort.receiveShadow = true;
    scene.add(playerFort);
    
    // दुश्मन का किला
    const enemyTeam = playerTeam === 'maratha' ? 'mughal' : 'maratha';
    const enemyFortMaterial = new THREE.MeshLambertMaterial({ 
        color: enemyTeam === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    enemyFort = new THREE.Mesh(fortGeometry, enemyFortMaterial);
    enemyFort.position.set(0, 3, 40);
    enemyFort.castShadow = true;
    enemyFort.receiveShadow = true;
    scene.add(enemyFort);
}

// प्रारंभिक सैनिक जोड़ें
function addInitialSoldiers() {
    for (let i = 0; i < 3; i++) {
        addSoldier('infantry', playerTeam, true);
    }
    
    for (let i = 0; i < 2; i++) {
        addSoldier('cavalry', playerTeam, true);
    }
    
    for (let i = 0; i < 5; i++) {
        const types = ['infantry', 'cavalry', 'archer'];
        const type = types[Math.floor(Math.random() * types.length)];
        addSoldier(type, playerTeam === 'maratha' ? 'mughal' : 'maratha', false);
    }
}

// सैनिक जोड़ना
function addSoldier(type, team, isPlayer) {
    let geometry, material;
    const level = soldierLevels[type];
    const stats = soldierStats[type];
    
    if (type === 'infantry') {
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    } else if (type === 'cavalry') {
        geometry = new THREE.ConeGeometry(0.7, 2, 8);
    } else if (type === 'archer') {
        geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
    } else if (type === 'elephant') {
        geometry = new THREE.CylinderGeometry(1, 1.2, 3, 8);
    }
    
    material = new THREE.MeshLambertMaterial({ 
        color: team === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    
    const soldier = new THREE.Mesh(geometry, material);
    
    // स्थिति निर्धारित करें
    if (isPlayer) {
        soldier.position.set(
            Math.random() * 20 - 10,
            type === 'elephant' ? 1.5 : 1,
            -35 + Math.random() * 10
        );
    } else {
        soldier.position.set(
            Math.random() * 20 - 10,
            type === 'elephant' ? 1.5 : 1,
            35 - Math.random() * 10
        );
    }
    
    soldier.castShadow = true;
    soldier.receiveShadow = true;
    
    // सैनिक डेटा संग्रहीत करें
    soldier.userData = {
        type: type,
        team: team,
        level: level,
        health: stats.health * (1 + (level - 1) * 0.2),
        maxHealth: stats.health * (1 + (level - 1) * 0.2),
        attack: stats.attack * (1 + (level - 1) * 0.15),
        speed: stats.speed * (1 + (level - 1) * 0.1),
        range: stats.range || 0,
        target: null
    };
    
    scene.add(soldier);
    soldierModels.push(soldier);
    soldiers++;
    updateUI();
}

// सैनिक खरीदना
function buySoldier(type) {
    const cost = {
        'infantry': 20,
        'cavalry': 30,
        'archer': 25,
        'elephant': 40
    };
    
    if (gold >= cost[type]) {
        gold -= cost[type];
        addSoldier(type, playerTeam, true);
        updateUI();
    }
}

// सैनिक अपग्रेड करना
function upgradeSoldier(type) {
    const cost = {
        'infantry': 50,
        'cavalry': 75,
        'archer': 60,
        'elephant': 100
    };
    
    if (gold >= cost[type] && soldierLevels[type] < 5) {
        gold -= cost[type];
        soldierLevels[type]++;
        
        // मौजूदा सैनिकों को अपग्रेड करें
        soldierModels.forEach(soldier => {
            if (soldier.userData.type === type && soldier.userData.team === playerTeam) {
                soldier.userData.level = soldierLevels[type];
                soldier.userData.attack = soldierStats[type].attack * (1 + (soldierLevels[type] - 1) * 0.15);
                soldier.userData.maxHealth = soldierStats[type].health * (1 + (soldierLevels[type] - 1) * 0.2);
                soldier.userData.health = soldier.userData.maxHealth;
                soldier.userData.speed = soldierStats[type].speed * (1 + (soldierLevels[type] - 1) * 0.1);
                
                // सैनिक का आकार बढ़ाएं (लेवल के अनुसार)
                soldier.scale.set(1 + (soldierLevels[type] - 1) * 0.1, 1 + (soldierLevels[type] - 1) * 0.1, 1 + (soldierLevels[type] - 1) * 0.1);
            }
        });
        
        updateUI();
        updateSoldierStatsUI();
    }
}

// XP जोड़ना
function addXP(amount) {
    currentXP += amount;
    
    // लेवल अप चेक करें
    if (currentXP >= nextLevelXP) {
        currentLevel++;
        currentXP -= nextLevelXP;
        nextLevelXP = Math.floor(nextLevelXP * 1.5);
        
        // लेवल अप बोनस
        gold += currentLevel * 50;
        territory++;
        
        // नए सैनिक अनलॉक करें
        if (currentLevel >= 3 && soldierLevels.elephant === 1) {
            soldierLevels.elephant = 1;
            document.getElementById('elephant-btn').style.display = 'block';
            document.getElementById('upgrade-elephant').style.display = 'block';
            document.getElementById('elephant-stats').style.display = 'block';
        }
    }
    
    updateLevelUI();
    updateUI();
}

// UI अपडेट करना
function updateUI() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('soldiers').textContent = soldiers;
    document.getElementById('territory').textContent = territory;
    document.getElementById('level').textContent = currentLevel;
    
    // सैनिक लेवल अपडेट करें
    document.getElementById('infantry-level').textContent = soldierLevels.infantry;
    document.getElementById('cavalry-level').textContent = soldierLevels.cavalry;
    document.getElementById('archer-level').textContent = soldierLevels.archer;
    document.getElementById('elephant-level').textContent = soldierLevels.elephant;
}

// लेवल UI अपडेट करना
function updateLevelUI() {
    document.getElementById('next-level').textContent = nextLevelXP;
    document.getElementById('current-xp').textContent = currentXP;
}

// सैनिक स्टैट्स UI अपडेट करना
function updateSoldierStatsUI() {
    document.getElementById('infantry-stats').textContent = `लेवल ${soldierLevels.infantry} (${soldierStats.infantry.attack * (1 + (soldierLevels.infantry - 1) * 0.15)} हमला)`;
    document.getElementById('cavalry-stats').textContent = `लेवल ${soldierLevels.cavalry} (${soldierStats.cavalry.attack * (1 + (soldierLevels.cavalry - 1) * 0.15)} हमला)`;
    document.getElementById('archer-stats').textContent = `लेवल ${soldierLevels.archer} (${soldierStats.archer.attack * (1 + (soldierLevels.archer - 1) * 0.15)} हमला)`;
    document.getElementById('elephant-stats').textContent = `लेवल ${soldierLevels.elephant} (${soldierStats.elephant.attack * (1 + (soldierLevels.elephant - 1) * 0.15)} हमला)`;
    
    // शुरुआत में हाथी सवार छुपाएं
    if (currentLevel < 3) {
        document.getElementById('elephant-btn').style.display = 'none';
        document.getElementById('upgrade-elephant').style.display = 'none';
        document.getElementById('elephant-stats').style.display = 'none';
    }
}

// विंडो रिसाइज हैंडलर
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// गेम लूप
function animate() {
    requestAnimationFrame(animate);
    
    if (gameStarted) {
        // सैनिकों को अपडेट करें
        updateSoldiers();
        
        // सोना बढ़ाएं
        if (Math.random() < 0.01) {
            gold += 5;
            updateUI();
        }
    }
    
    renderer.render(scene, camera);
}

// सैनिकों को अपडेट करना
function updateSoldiers() {
    soldierModels.forEach(soldier => {
        // लक्ष्य खोजें
        if (!soldier.userData.target || soldier.userData.target.userData.health <= 0) {
            soldier.userData.target = findNearestEnemy(soldier);
        }
        
        // लक्ष्य की ओर बढ़ें
        if (soldier.userData.target) {
            const targetPos = soldier.userData.target.position;
            const direction = new THREE.Vector3()
                .subVectors(targetPos, soldier.position)
                .normalize();
            
            soldier.position.add(direction.multiplyScalar(soldier.userData.speed));
            
            // लक्ष्य की ओर देखें
            soldier.lookAt(targetPos);
            
            // यदि लक्ष्य के करीब हैं तो हमला करें
            const attackRange = soldier.userData.type === 'archer' ? soldier.userData.range : 3;
            if (soldier.position.distanceTo(targetPos) < attackRange) {
                soldier.userData.target.userData.health -= soldier.userData.attack;
                
                // यदि लक्ष्य मर गया है
                if (soldier.userData.target.userData.health <= 0) {
                    // XP जोड़ें
                    addXP(10 + soldier.userData.target.userData.level * 5);
                    
                    scene.remove(soldier.userData.target);
                    soldierModels = soldierModels.filter(s => s !== soldier.userData.target);
                    soldiers--;
                    soldier.userData.target = null;
                    updateUI();
                }
            }
        }
    });
}

// निकटतम दुश्मन ढूंढना
function findNearestEnemy(soldier) {
    let nearestEnemy = null;
    let minDistance = Infinity;
    
    soldierModels.forEach(otherSoldier => {
        if (otherSoldier.userData.team !== soldier.userData.team) {
            const distance = soldier.position.distanceTo(otherSoldier.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = otherSoldier;
            }
        }
    });
    
    // अगर कोई सैनिक नहीं मिला, तो किले को लक्ष्य बनाएं
    if (!nearestEnemy) {
        nearestEnemy = soldier.userData.team === playerTeam ? enemyFort : playerFort;
    }
    
    return nearestEnemy;
}

// गेम शुरू करें
init();
