// script.js - मराठा vs मुगल 3D युद्ध गेम

// मुख्य गेम वेरिएबल्स
let scene, camera, renderer;
let gold = 100;
let soldiers = 5;
let enemySoldiers = 5;
let territory = 1;
let playerTeam = null;
let gameStarted = false;
let currentLevel = 1;
let maxLevel = 50;
let currentXP = 0;
let nextLevelXP = 100;
let enemiesDefeated = 0;
let missionsCompleted = 0;

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

// मिशन सिस्टम
let currentMission = {
    id: 1,
    title: "प्रारंभिक सेना बनाएं",
    description: "5 सैनिकों को प्रशिक्षित करें",
    target: 5,
    current: 0,
    reward: { gold: 100, xp: 50 },
    completed: false
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
    
    // मिशन सेट करें
    updateMissionUI();
    
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
    addRocks();
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

// चट्टानें जोड़ें
function addRocks() {
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x7a7a7a });
    
    for (let i = 0; i < 15; i++) {
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            Math.random() * 80 - 40,
            1,
            Math.random() * 80 - 40
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        scene.add(rock);
    }
}

// मराठा और मुगल सैनिक बनाना
function createHistoricalSoldier(type, team, isPlayer) {
    const group = new THREE.Group();
    
    // सैनिक का आधार
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 16);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
        color: team === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    group.add(base);
    
    // सैनिक का शरीर
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
    let bodyMaterial;
    
    if (team === 'maratha') {
        // मराठा सैनिक - केसरिया वस्त्र
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF8C00 });
    } else {
        // मुगल सैनिक - हरे वस्त्र
        bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    }
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.95;
    group.add(body);
    
    // सिर
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    group.add(head);
    
    // पगड़ी/हेलमेट
    const helmetGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 16);
    let helmetMaterial;
    
    if (team === 'maratha') {
        // मराठा पगड़ी - केसरिया
        helmetMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
    } else {
        // मुगल हेलमेट - स्टील
        helmetMaterial = new THREE.MeshLambertMaterial({ color: 0xA0A0A0 });
    }
    
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 2.0;
    group.add(helmet);
    
    // हथियार जोड़ें
    if (type === 'infantry') {
        // तलवार
        const swordGeometry = new THREE.BoxGeometry(0.05, 1.0, 0.1);
        const swordMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
        const sword = new THREE.Mesh(swordGeometry, swordMaterial);
        sword.position.set(0.4, 1.2, 0);
        sword.rotation.z = Math.PI / 4;
        group.add(sword);
        
        // ढाल (मराठा सैनिकों के लिए)
        if (team === 'maratha') {
            const shieldGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
            const shieldMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.position.set(-0.4, 1.2, 0);
            shield.rotation.x = Math.PI / 2;
            group.add(shield);
        }
    } else if (type === 'cavalry') {
        // घोड़ा
        const horseBodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 16);
        const horseBodyMaterial = new THREE.MeshLambertMaterial({ 
            color: team === 'maratha' ? 0x8B4513 : 0x4B0082 
        });
        const horseBody = new THREE.Mesh(horseBodyGeometry, horseBodyMaterial);
        horseBody.position.y = 0.8;
        group.add(horseBody);
        
        const horseHeadGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 16);
        const horseHead = new THREE.Mesh(horseHeadGeometry, horseBodyMaterial);
        horseHead.position.set(0, 1.0, 0.5);
        horseHead.rotation.x = Math.PI / 2;
        group.add(horseHead);
        
        // सवार को ऊपर उठाएं
        body.position.y = 1.8;
        head.position.y = 2.6;
        helmet.position.y = 2.8;
        
        // भाला
        const spearGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.0, 8);
        const spearMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const spear = new THREE.Mesh(spearGeometry, spearMaterial);
        spear.position.set(0.5, 2.0, 0);
        spear.rotation.z = Math.PI / 4;
        group.add(spear);
    } else if (type === 'archer') {
        // धनुष
        const bowGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 20, Math.PI);
        const bowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const bow = new THREE.Mesh(bowGeometry, bowMaterial);
        bow.position.set(0.4, 1.6, 0);
        bow.rotation.y = Math.PI / 2;
        group.add(bow);
        
        // तरकश
        const quiverGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
        const quiverMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const quiver = new THREE.Mesh(quiverGeometry, quiverMaterial);
        quiver.position.set(-0.4, 1.5, 0);
        quiver.rotation.x = Math.PI / 2;
        group.add(quiver);
    } else if (type === 'elephant') {
        // हाथी
        const elephantBodyGeometry = new THREE.CylinderGeometry(1.0, 1.2, 2.0, 16);
        const elephantBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const elephantBody = new THREE.Mesh(elephantBodyGeometry, elephantBodyMaterial);
        elephantBody.position.y = 1.2;
        group.add(elephantBody);
        
        const elephantHeadGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const elephantHead = new THREE.Mesh(elephantHeadGeometry, elephantBodyMaterial);
        elephantHead.position.set(0, 1.8, 1.2);
        group.add(elephantHead);
        
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 16);
        const trunk = new THREE.Mesh(trunkGeometry, elephantBodyMaterial);
        trunk.position.set(0, 1.2, 2.0);
        trunk.rotation.x = Math.PI / 4;
        group.add(trunk);
        
        // सवार को ऊपर उठाएं
        body.position.y = 2.8;
        head.position.y = 3.6;
        helmet.position.y = 3.8;
        
        // हौदा
        const howdahGeometry = new THREE.BoxGeometry(1.0, 0.5, 1.0);
        const howdahMaterial = new THREE.MeshLambertMaterial({ 
            color: team === 'maratha' ? 0x8B0000 : 0x006400 
        });
        const howdah = new THREE.Mesh(howdahGeometry, howdahMaterial);
        howdah.position.set(0, 2.2, 0);
        group.add(howdah);
    }
    
    // स्थिति निर्धारित करें
    if (isPlayer) {
        group.position.set(
            Math.random() * 20 - 10,
            0,
            -35 + Math.random() * 10
        );
    } else {
        group.position.set(
            Math.random() * 20 - 10,
            0,
            35 - Math.random() * 10
        );
    }
    
    group.castShadow = true;
    group.receiveShadow = true;
    
    // सैनिक डेटा संग्रहीत करें
    group.userData = {
        type: type,
        team: team,
        level: soldierLevels[type],
        health: soldierStats[type].health * (1 + (soldierLevels[type] - 1) * 0.2),
        maxHealth: soldierStats[type].health * (1 + (soldierLevels[type] - 1) * 0.2),
        attack: soldierStats[type].attack * (1 + (soldierLevels[type] - 1) * 0.15),
        speed: soldierStats[type].speed * (1 + (soldierLevels[type] - 1) * 0.1),
        range: soldierStats[type].range || 0,
        target: null
    };
    
    scene.add(group);
    soldierModels.push(group);
    soldiers++;
    
    // मिशन प्रगति अपडेट करें
    if (isPlayer) {
        currentMission.current++;
        updateMissionProgress();
    }
    
    updateUI();
    return group;
}

// किले बनाना (ताबर की तरह)
function createHistoricalFort(team, isPlayer) {
    const group = new THREE.Group();
    
    // किले का मुख्य भाग
    const fortBaseGeometry = new THREE.CylinderGeometry(8, 10, 6, 16);
    const fortBaseMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xA0522D 
    });
    const fortBase = new THREE.Mesh(fortBaseGeometry, fortBaseMaterial);
    fortBase.position.y = 3;
    group.add(fortBase);
    
    // किले की दीवारें
    const wallGeometry = new THREE.CylinderGeometry(9, 9, 2, 16);
    const wallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513 
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.y = 5;
    group.add(wall);
    
    // किले के ऊपर का भाग
    const topGeometry = new THREE.CylinderGeometry(7, 8, 2, 16);
    const topMaterial = new THREE.MeshLambertMaterial({ 
        color: team === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 6;
    group.add(top);
    
    // किले के झंडे
    const flagPoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const flagPoleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
    flagPole.position.set(0, 7.5, 0);
    group.add(flagPole);
    
    const flagGeometry = new THREE.PlaneGeometry(1.5, 1);
    const flagMaterial = new THREE.MeshLambertMaterial({ 
        color: team === 'maratha' ? 0xd72828 : 0x1e90ff,
        side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(0.75, 7.5, 0);
    group.add(flag);
    
    // किले की स्थिति निर्धारित करें
    if (isPlayer) {
        group.position.set(0, 0, -40);
    } else {
        group.position.set(0, 0, 40);
    }
    
    group.castShadow = true;
    group.receiveShadow = true;
    
    // किले का डेटा संग्रहीत करें
    group.userData = {
        team: team,
        health: 1000,
        maxHealth: 1000
    };
    
    scene.add(group);
    return group;
}

// टीम चयन
function selectTeam(team) {
    playerTeam = team;
    document.getElementById('team-selection').style.display = 'none';
    gameStarted = true;
    
    // किले बनाएं
    playerFort = createHistoricalFort(playerTeam, true);
    enemyFort = createHistoricalFort(playerTeam === 'maratha' ? 'mughal' : 'maratha', false);
    
    // प्रारंभिक सैनिक जोड़ें
    addInitialSoldiers();
    
    // UI अपडेट करें
    updateUI();
    updateLevelUI();
    updateSoldierStatsUI();
}

// प्रारंभिक सैनिक जोड़ें
function addInitialSoldiers() {
    for (let i = 0; i < 3; i++) {
        createHistoricalSoldier('infantry', playerTeam, true);
    }
    
    for (let i = 0; i < 2; i++) {
        createHistoricalSoldier('cavalry', playerTeam, true);
    }
    
    for (let i = 0; i < 5; i++) {
        const types = ['infantry', 'cavalry', 'archer'];
        const type = types[Math.floor(Math.random() * types.length)];
        createHistoricalSoldier(type, playerTeam === 'maratha' ? 'mughal' : 'maratha', false);
    }
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
        createHistoricalSoldier(type, playerTeam, true);
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
    
    const maxLevel = 10;
    
    if (gold >= cost[type] && soldierLevels[type] < maxLevel) {
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
                soldier.scale.set(1 + (soldierLevels[type] - 1) * 0.05, 1 + (soldierLevels[type] - 1) * 0.05, 1 + (soldierLevels[type] - 1) * 0.05);
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
    if (currentXP >= nextLevelXP && currentLevel < maxLevel) {
        const oldLevel = currentLevel;
        currentLevel++;
        currentXP -= nextLevelXP;
        nextLevelXP = Math.floor(nextLevelXP * 1.2);
        
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
        
        // लेवल अप नोटिफिकेशन दिखाएं
        showLevelUpNotification(oldLevel, currentLevel);
    }
    
    updateLevelUI();
    updateUI();
}

// लेवल अप नोटिफिकेशन दिखाएं
function showLevelUpNotification(oldLevel, newLevel) {
    const notification = document.getElementById('level-up-notification');
    document.getElementById('new-level').textContent = newLevel;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// मिशन UI अपडेट करना
function updateMissionUI() {
    document.getElementById('mission-text').textContent = currentMission.description;
    document.getElementById('mission-reward').textContent = `इनाम: ${currentMission.reward.gold} सोना + ${currentMission.reward.xp} XP`;
}

// मिशन प्रगति अपडेट करना
function updateMissionProgress() {
    if (currentMission.current >= currentMission.target && !currentMission.completed) {
        currentMission.completed = true;
        
        // इनाम दें
        gold += currentMission.reward.gold;
        addXP(currentMission.reward.xp);
        
        missionsCompleted++;
    }
}

// UI अपडेट करना
function updateUI() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('soldiers').textContent = soldiers;
    document.getElementById('territory').textContent = territory;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('current-level').textContent = currentLevel;
    
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
    
    // प्रगति बार अपडेट करें
    const progressPercent = (currentXP / nextLevelXP) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;
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
    } else {
        document.getElementById('elephant-btn').style.display = 'block';
        document.getElementById('upgrade-elephant').style.display = 'block';
        document.getElementById('elephant-stats').style.display = 'block';
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
            const attackRange = soldier.userData.range > 0 ? soldier.userData.range : 3;
            if (soldier.position.distanceTo(targetPos) < attackRange) {
                soldier.userData.target.userData.health -= soldier.userData.attack;
                
                // यदि लक्ष्य मर गया है
                if (soldier.userData.target.userData.health <= 0) {
                    // XP जोड़ें
                    addXP(10 + soldier.userData.target.userData.level * 5);
                    
                    // दुश्मन सैनिक गिनती अपडेट करें
                    if (soldier.userData.target.userData.team !== playerTeam) {
                        enemiesDefeated++;
                    }
                    
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
