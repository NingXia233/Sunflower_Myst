// Game state
const gameState = {
    sunflowers: [],
    corners: [],
    tears: [],
    sunflowerCount: 1,
    coveredCorners: 0,
    isWon: false,
    rotation: { x: 0, y: 0 },
    sunAngle: 0
};

// Canvas and context
let canvas, ctx;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Initialize the game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create initial sunflower
    createSunflower(canvas.width / 2, canvas.height / 2);

    // Create random corners
    generateCorners();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    // Update UI
    updateUI();

    // Start animation loop
    animate();
}

// Draw the 3D wall with perspective
function drawWall() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Apply rotation effect
    const scale = 1 - Math.abs(Math.sin(gameState.rotation.y)) * 0.3;
    const width = 600 * scale;
    const height = 450 * scale;
    
    const left = centerX - width / 2;
    const top = centerY - height / 2;
    
    // Draw wall shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(left + 10, top + 10, width, height);
    
    // Draw wall with brick pattern
    const brickWidth = 60;
    const brickHeight = 30;
    
    for (let y = 0; y < height; y += brickHeight) {
        for (let x = 0; x < width; x += brickWidth) {
            const offset = Math.floor(y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            const brickX = left + x + offset;
            const brickY = top + y;
            
            // Brick color variation
            const colorVariation = Math.floor((brickX + brickY) % 3);
            ctx.fillStyle = colorVariation === 0 ? '#A0522D' : 
                           colorVariation === 1 ? '#8B4513' : '#9B5523';
            
            ctx.fillRect(brickX, brickY, brickWidth - 2, brickHeight - 2);
            
            // Add cracks
            if ((brickX + brickY) % 5 === 0) {
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(brickX, brickY + brickHeight / 2);
                ctx.lineTo(brickX + brickWidth - 2, brickY + brickHeight / 2);
                ctx.stroke();
            }
        }
    }
    
    // Draw wall outline
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;
    ctx.strokeRect(left, top, width, height);
    
    return { left, top, width, height, centerX, centerY };
}

// Draw the sun
function drawSun() {
    const sunX = canvas.width - 100;
    const sunY = 100;
    const sunRadius = 40;
    
    // Sun glow
    const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 1.5);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + gameState.sunAngle;
        const x1 = sunX + Math.cos(angle) * (sunRadius + 5);
        const y1 = sunY + Math.sin(angle) * (sunRadius + 5);
        const x2 = sunX + Math.cos(angle) * (sunRadius + 15);
        const y2 = sunY + Math.sin(angle) * (sunRadius + 15);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// Create a sunflower at the given position
function createSunflower(x, y) {
    const sunflower = {
        x: x,
        y: y,
        hasCried: false,
        angle: Math.random() * Math.PI * 2,
        scale: 1
    };
    
    gameState.sunflowers.push(sunflower);
    return sunflower;
}

// Draw a sunflower
function drawSunflower(sunflower) {
    const x = sunflower.x;
    const y = sunflower.y;
    const scale = sunflower.scale;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sunflower.angle * 0.1);
    
    // Draw stem
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 40 * scale);
    ctx.stroke();
    
    // Draw petals
    ctx.fillStyle = '#FFD700';
    const numPetals = 12;
    const petalRadius = 12 * scale;
    const petalDistance = 25 * scale;
    
    for (let i = 0; i < numPetals; i++) {
        const angle = (i / numPetals) * Math.PI * 2;
        const px = Math.cos(angle) * petalDistance;
        const py = Math.sin(angle) * petalDistance;
        
        ctx.beginPath();
        ctx.arc(px, py, petalRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw center
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(0, 0, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Add center detail
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 12 * scale;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;
        ctx.fillRect(px - 1, py - 1, 2, 2);
    }
    
    ctx.restore();
}

// Generate random corners on the wall
function generateCorners() {
    const numCorners = 5;
    const wallBounds = {
        left: canvas.width / 2 - 300,
        right: canvas.width / 2 + 300,
        top: canvas.height / 2 - 225,
        bottom: canvas.height / 2 + 225
    };
    
    for (let i = 0; i < numCorners; i++) {
        const x = wallBounds.left + Math.random() * (wallBounds.right - wallBounds.left);
        const y = wallBounds.top + Math.random() * (wallBounds.bottom - wallBounds.top);
        
        const corner = {
            x: x,
            y: y,
            covered: false
        };
        
        gameState.corners.push(corner);
    }
    
    updateUI();
}

// Draw corners
function drawCorners() {
    gameState.corners.forEach(corner => {
        ctx.strokeStyle = corner.covered ? '#00FF00' : '#FF6347';
        ctx.fillStyle = corner.covered ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 99, 71, 0.2)';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 15, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Create tear drop animation
function createTearDrop(sunflower) {
    const wallBounds = {
        left: canvas.width / 2 - 300,
        right: canvas.width / 2 + 300,
        top: canvas.height / 2 - 225,
        bottom: canvas.height / 2 + 225
    };
    
    const endX = wallBounds.left + Math.random() * (wallBounds.right - wallBounds.left);
    const endY = wallBounds.top + Math.random() * (wallBounds.bottom - wallBounds.top);
    
    const tear = {
        x: sunflower.x,
        y: sunflower.y + 30,
        endX: endX,
        endY: endY,
        progress: 0,
        speed: 0.02
    };
    
    gameState.tears.push(tear);
}

// Draw and update tears
function updateTears() {
    for (let i = gameState.tears.length - 1; i >= 0; i--) {
        const tear = gameState.tears[i];
        tear.progress += tear.speed;
        
        if (tear.progress >= 1) {
            // Tear has reached destination
            createSunflower(tear.endX, tear.endY);
            gameState.sunflowerCount++;
            checkCornerCoverage();
            updateUI();
            gameState.tears.splice(i, 1);
        } else {
            // Draw tear
            const x = tear.x + (tear.endX - tear.x) * tear.progress;
            const y = tear.y + (tear.endY - tear.y) * tear.progress;
            
            ctx.fillStyle = `rgba(135, 206, 235, ${1 - tear.progress * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, 8 * (1 - tear.progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
            
            // Tear trail
            ctx.strokeStyle = `rgba(135, 206, 235, ${0.5 - tear.progress * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tear.x, tear.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
}

// Check if corners are covered by sunflowers
function checkCornerCoverage() {
    gameState.coveredCorners = 0;
    
    gameState.corners.forEach(corner => {
        let covered = false;
        
        gameState.sunflowers.forEach(sunflower => {
            const dx = corner.x - sunflower.x;
            const dy = corner.y - sunflower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 60) {
                covered = true;
            }
        });
        
        corner.covered = covered;
        
        if (covered) {
            gameState.coveredCorners++;
        }
    });
    
    // Check win condition
    if (gameState.coveredCorners === gameState.corners.length && 
        gameState.corners.length > 0 && 
        !gameState.isWon) {
        gameState.isWon = true;
        showWinMessage();
    }
}

// Mouse event handlers
function onMouseDown(event) {
    isDragging = false;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (event.buttons === 1) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        if (Math.abs(deltaMove.x) > 5 || Math.abs(deltaMove.y) > 5) {
            isDragging = true;
            
            // Update rotation
            gameState.rotation.y += deltaMove.x * 0.01;
            gameState.rotation.x += deltaMove.y * 0.01;
            
            // Limit rotation
            gameState.rotation.x = Math.max(-0.5, Math.min(0.5, gameState.rotation.x));
        }
        
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

function onMouseUp(event) {
    isDragging = false;
}

function onClick(event) {
    if (isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicked on a sunflower
    for (let sunflower of gameState.sunflowers) {
        const dx = x - sunflower.x;
        const dy = y - sunflower.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 40 && !sunflower.hasCried) {
            sunflower.hasCried = true;
            createTearDrop(sunflower);
            break;
        }
    }
}

function onWindowResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Update UI elements
function updateUI() {
    document.getElementById('sunflower-count').textContent = gameState.sunflowerCount;
    document.getElementById('corner-count').textContent = gameState.coveredCorners;
    document.getElementById('total-corners').textContent = gameState.corners.length;
}

// Show win message
function showWinMessage() {
    document.getElementById('win-message').classList.remove('hidden');
}

// Restart game
function restartGame() {
    // Reset state
    gameState.sunflowers = [];
    gameState.corners = [];
    gameState.tears = [];
    gameState.sunflowerCount = 1;
    gameState.coveredCorners = 0;
    gameState.isWon = false;
    gameState.rotation = { x: 0, y: 0 };
    
    // Hide win message
    document.getElementById('win-message').classList.add('hidden');
    
    // Recreate initial sunflower and corners
    createSunflower(canvas.width / 2, canvas.height / 2);
    generateCorners();
    
    updateUI();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update sun angle
    gameState.sunAngle += 0.02;
    
    // Draw sun
    drawSun();
    
    // Draw wall
    drawWall();
    
    // Draw corners
    drawCorners();
    
    // Draw sunflowers
    gameState.sunflowers.forEach((sunflower, index) => {
        sunflower.angle += 0.01;
        drawSunflower(sunflower);
    });
    
    // Update and draw tears
    updateTears();
}

// Start the game when page loads
window.addEventListener('load', init);
