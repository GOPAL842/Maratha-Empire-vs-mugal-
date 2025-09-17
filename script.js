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
    elephant: 1,
    cannon: 0
};

let soldierStats = {
    infantry: { attack: 10, health: 100, speed: 0.1 },
    cavalry: { attack: 15, health: 120, speed: 0.15 },
    archer: { attack: 8, health: 80, speed: 0.08, range: 15 },
    elephant: { attack: 25, health: 200, speed: 0.07 },
    cannon: { attack: 40, health: 150, speed: 0.04, range: 20 }
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

let missions = [
    { id: 1, title: "प्रारंभिक सेना", desc: "5 सैनिकों को प्रशिक्षित करें", target: 5, reward: { gold: 100, xp: 50 } },
    { id: 2, title: "पहली जीत", desc: "10 दुश्मन सैनिकों को हराएं", target: 10, reward: { gold: 200, xp: 100 } },
    { id: 3, title: "क्षेत्र विस्तार", desc: "3 क्षेत्रों पर कब्जा करें", target: 3, reward: { gold: 300, xp: 150 } },
    { id: 4, title: "सेना मजबूत करें", desc: "किसी भी सैनिक को लेवल 5 तक अपग्रेड करें", target: 5, reward: { gold: 400, xp: 200 } },
    { id: 5, title: "संसाधन जुटाएं", desc: "1000 सोना इकट्ठा करें", target: 1000, reward: { gold: 500, xp: 250 } }
];

// गेम ऑब्जेक्ट्स
let playerFort = null;
let enemyFort = null;
let soldierModels = [];
let terrain = null;
let humanModels = [];

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
    document.getElementById('cannon-btn').addEventListener('click', () => buySoldier('cannon'));
    
    document.getElementById('upgrade-infantry').addEventListener('click', () => upgradeSoldier('infantry'));
    document.getElementById('upgrade-cavalry').addEventListener('click', () => upgradeSoldier('cavalry'));
    document.getElementById('upgrade-archer').addEventListener('click', () => upgradeSoldier('archer'));
    document.getElementById('upgrade-elephant').addEventListener('click', () => upgradeSoldier('elephant'));
    document.getElementById('upgrade-cannon').addEventListener('click', () => upgradeSoldier('cannon'));
    
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

// मानव जैसी सेना बनाना
function createHumanSoldier(type, team, isPlayer) {
    const group = new THREE.Group();
    
    // शरीर
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: team === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    group.add(body);
    
    // सिर
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    group.add(head);
    
    // हथियार जोड़ें (सैनिक प्रकार के अनुसार)
    if (type === 'infantry') {
        // तलवार
        const swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.3);
        const swordMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
        const sword = new THREE.Mesh(swordGeometry, swordMaterial);
        sword.position.set(0.8, 1.5, 0);
        sword.rotation.z = Math.PI / 4;
        group.add(sword);
    } else if (type === 'archer') {
        // धनुष
        const bowGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 20, Math.PI);
        const bowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const bow = new THREE.Mesh(bowGeometry, bowMaterial);
        bow.position.set(0.8, 1.8, 0);
        bow.rotation.y = Math.PI / 2;
        group.add(bow);
    } else if (type === 'cavalry') {
        // घोड़ा
        const horseBodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1, 8);
        const horseBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const horseBody = new THREE.Mesh(horseBodyGeometry, horseBodyMaterial);
        horseBody.position.y = 0.5;
        group.add(horseBody);
        
        const horseHeadGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 8);
        const horseHead = new THREE.Mesh(horseHeadGeometry, horseBodyMaterial);
        horseHead.position.set(0, 0.8, 0.6);
        horseHead.rotation.x = Math.PI / 2;
        group.add(horseHead);
        
        // सवार को ऊपर उठाएं
        body.position.y = 2;
        head.position.y = 3;
    } else if (type === 'elephant') {
        // हाथी
        const elephantBodyGeometry = new THREE.CylinderGeometry(1, 1.2, 2, 8);
        const elephantBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const elephantBody = new THREE.Mesh(elephantBodyGeometry, elephantBodyMaterial);
        elephantBody.position.y = 1;
        group.add(elephantBody);
        
        const elephantHeadGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const elephantHead = new THREE.Mesh(elephantHeadGeometry, elephantBodyMaterial);
        elephantHead.position.set(0, 1.5, 1);
        group.add(elephantHead);
        
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunk = new THREE.Mesh(trunkGeometry, elephantBodyMaterial);
        trunk.position.set(0, 0.8, 1.8);
        trunk.rotation.x = Math.PI / 4;
        group.add(trunk);
        
        // सवार को ऊपर उठाएं
        body.position.y = 2.5;
        head.position.y = 3.5;
    } else if (type === 'cannon') {
        // तोप
        const cannonBaseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
        const cannonBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const cannonBase = new THREE.Mesh(cannonBaseGeometry, cannonBaseMaterial);
        cannonBase.position.y = 0.5;
        group.add(cannonBase);
        
        const cannonBarrelGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 16);
        const cannonBarrel = new THREE.Mesh(cannonBarrelGeometry, cannonBaseMaterial);
        cannonBarrel.position.set(0, 1, 0.8);
        cannonBarrel.rotation.x = Math.PI / 6;
        group.add(cannonBarrel);
        
        // तोपची
        body.position.y = 1.5;
        head.position.y = 2.5;
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
    humanModels.push(group);
    soldiers++;
    
    // मिशन प्रगति अपडेट करें
    if (isPlayer) {
        currentMission.current++;
        updateMissionProgress();
    }
    
    updateUI();
    return group;
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
        createHumanSoldier('infantry', playerTeam, true);
    }
    
    for (let i = 0; i < 2; i++) {
        createHumanSoldier('cavalry', playerTeam, true);
    }
    
    for (let i = 0; i < 5; i++) {
        const types = ['infantry', 'cavalry', 'archer'];
        const type = types[Math.floor(Math.random() * types.length)];
        createHumanSoldier(type, playerTeam === 'maratha' ? 'mughal' : 'maratha', false);
    }
}

// सैनिक खरीदना
function buySoldier(type) {
    const cost = {
        'infantry': 20,
        'cavalry': 30,
        'archer': 25,
        'elephant': 40,
        'cannon': 60
    };
    
    if (gold >= cost[type] && (type !== 'cannon' || soldierLevels.cannon > 0)) {
        gold -= cost[type];
        createHumanSoldier(type, playerTeam, true);
        updateUI();
    }
}

// सैनिक अपग्रेड करना
function upgradeSoldier(type) {
    const cost = {
        'infantry': 50,
        'cavalry': 75,
        'archer': 60,
        'elephant': 100,
        'cannon': 150
    };
    
    const maxLevel = 10;
    
    if (gold >= cost[type] && soldierLevels[type] < maxLevel) {
        gold -= cost[type];
        soldierLevels[type]++;
        
        // मौजूदा सैनिकों को अपग्रेड करें
        humanModels.forEach(soldier => {
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
        
        // मिशन प्रगति अपडेट करें (यदि लेवल 5 तक पहुँचा है)
        if (soldierLevels[type] >= 5) {
            missionsCompleted++;
            updateAchievements();
        }
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
        
        if (currentLevel >= 5 && soldierLevels.cannon === 0) {
            soldierLevels.cannon = 1;
            document.getElementById('cannon-btn').style.display = 'block';
            document.getElementById('upgrade-cannon').style.display = 'block';
            document.getElementById('cannon-stats').style.display = 'block';
        }
        
        // लेवल अप नोटिफिकेशन दिखाएं
        showLevelUpNotification(oldLevel, currentLevel);
        
        // उपलब्धियाँ अपडेट करें
        updateAchievements();
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
        
        // अगला मिशन सेट करें
        const nextMission = missions.find(m => m.id === currentMission.id + 1);
        if (nextMission) {
            currentMission = {
                id: nextMission.id,
                title: nextMission.title,
                description: nextMission.desc,
                target: nextMission.target,
                current: 0,
                reward: nextMission.reward,
                completed: false
            };
        }
        
        missionsCompleted++;
        updateAchievements();
        updateMissionUI();
    }
}

// उपलब्धियाँ अपडेट करना
function updateAchievements() {
    if (soldiers >= 1) {
        document.getElementById('ach1').textContent = 'पहला सैनिक - ✅';
    }
    
    if (enemiesDefeated >= 10) {
        document.getElementById('ach2').textContent = '10 दुश्मन हराए - ✅';
    }
    
    if (currentLevel >= 10) {
        document.getElementById('ach3').textContent = 'लेवल 10 पूरा - ✅';
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
    document.getElementById('cannon-level').textContent = soldierLevels.cannon;
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
    document.getElementById('cannon-stats').textContent = `लेवल ${soldierLevels.cannon} (${soldierStats.cannon.attack * (1 + (soldierLevels.cannon - 1) * 0.15)} हमला)`;
    
    // शुरुआत में हाथी सवार और तोपची छुपाएं
    if (currentLevel < 3) {
        document.getElementById('elephant-btn').style.display = 'none';
        document.getElementById('upgrade-elephant').style.display = 'none';
        document.getElementById('elephant-stats').style.display = 'none';
    } else {
        document.getElementById('elephant-btn').style.display = 'block';
        document.getElementById('upgrade-elephant').style.display = 'block';
        document.getElementById('elephant-stats').style.display = 'block';
    }
    
    if (currentLevel < 5) {
        document.getElementById('cannon-btn').style.display = 'none';
        document.getElementById('upgrade-cannon').style.display = 'none';
        document.getElementById('cannon-stats').style.display = 'none';
    } else {
        document.getElementById('cannon-btn').style.display = 'block';
        document.getElementById('upgrade-cannon').style.display = 'block';
        document.getElementById('cannon-stats').style.display = 'block';
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
            
            // मिशन प्रगति अपडेट करें (यदि संसाधन मिशन चल रहा है)
            if (currentMission.id === 5) {
                currentMission.current = gold;
                updateMissionProgress();
            }
        }
    }
    
    renderer.render(scene, camera);
}

// सैनिकों को अपडेट करना
function updateSoldiers() {
    humanModels.forEach(soldier => {
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
                        
                        // मिशन प्रगति अपडेट करें
                        if (currentMission.id === 2) {
                            currentMission.current = enemiesDefeated;
                            updateMissionProgress();
                        }
                    }
                    
                    scene.remove(soldier.userData.target);
                    humanModels = humanModels.filter(s => s !== soldier.userData.target);
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
    
    humanModels.forEach(otherSoldier => {
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
