// मुख्य गेम वेरिएबल्स
let scene, camera, renderer;
let gold = 100;
let soldiers = 5;
let territory = 1;
let playerTeam = null;
let gameStarted = false;

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

// टीम चयन
function selectTeam(team) {
    playerTeam = team;
    document.getElementById('team-selection').style.display = 'none';
    gameStarted = true;
    
    // किले बनाएं
    createForts();
    
    // प्रारंभिक सैनिक जोड़ें
    addInitialSoldiers();
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
    for (let i = 0; i < 5; i++) {
        addSoldier('infantry', playerTeam, true);
    }
    
    for (let i = 0; i < 5; i++) {
        addSoldier('infantry', playerTeam === 'maratha' ? 'mughal' : 'maratha', false);
    }
    
    updateUI();
}

// सैनिक जोड़ना
function addSoldier(type, team, isPlayer) {
    let geometry, material;
    
    if (type === 'infantry') {
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    } else if (type === 'cavalry') {
        geometry = new THREE.ConeGeometry(0.7, 2, 8);
    } else {
        geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
    }
    
    material = new THREE.MeshLambertMaterial({ 
        color: team === 'maratha' ? 0xd72828 : 0x1e90ff 
    });
    
    const soldier = new THREE.Mesh(geometry, material);
    
    // स्थिति निर्धारित करें
    if (isPlayer) {
        soldier.position.set(
            Math.random() * 20 - 10,
            1,
            -35 + Math.random() * 10
        );
    } else {
        soldier.position.set(
            Math.random() * 20 - 10,
            1,
            35 - Math.random() * 10
        );
    }
    
    soldier.castShadow = true;
    soldier.receiveShadow = true;
    
    // सैनिक डेटा संग्रहीत करें
    soldier.userData = {
        type: type,
        team: team,
        health: 100,
        attack: type === 'infantry' ? 10 : type === 'cavalry' ? 15 : 8,
        speed: type === 'cavalry' ? 0.15 : 0.1,
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
        'archer': 25
    };
    
    if (gold >= cost[type]) {
        gold -= cost[type];
        addSoldier(type, playerTeam, true);
        updateUI();
    }
}

// UI अपडेट करना
function updateUI() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('soldiers').textContent = soldiers;
    document.getElementById('territory').textContent = territory;
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
        if (!soldier.userData.target) {
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
            if (soldier.position.distanceTo(targetPos) < 3) {
                soldier.userData.target.userData.health -= soldier.userData.attack;
                
                // यदि लक्ष्य मर गया है
                if (soldier.userData.target.userData.health <= 0) {
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
    
    return nearestEnemy;
}

// गेम शुरू करें
init();
