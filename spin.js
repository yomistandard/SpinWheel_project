
const canvas = document.getElementById('wheel');
const finalWheelRotation = document.getElementById('pointer');
const ctx = canvas.getContext('2d');
const segments = 30;
const segmentColors = [];
const players = [];
let currentPlayer = null;
let hasSpun = {};
let usedNumbers = new Set();
let currentAngle = 0; // in degrees, wheel's rotation
let isSpinning = false;

// Initialize colors
for(let i=0; i<segments; i++){
  segmentColors.push(i%2===0 ? '#4CAF50':'#FFC107');
}

// Draw the wheel with optional rotation
function drawWheel(rotation=0){
  ctx.clearRect(0, 0, 500, 500);
  const centerX = 250;
  const centerY = 250;
  const radius = 220;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  for(let i=0; i<segments; i++){
    const startAngle = (i * 360 / segments) * Math.PI / 180;
    const endAngle = ((i+1) * 360 / segments) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segmentColors[i];
    ctx.fill();

    // Add labels
    ctx.save();
    ctx.rotate(startAngle + (Math.PI / segments));
    ctx.translate(radius - 20, 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(i+1, 0, 4);
    ctx.restore();
  }
  ctx.restore();
}

// Draw the wheel initially
drawWheel();

// Function to get the angle of a segment's center
function getSegmentCenterAngle(index) {
  const segmentSize = 360 / segments;
  // Center of segment in degrees:
  return index * segmentSize + segmentSize / 2;
}

// Function to spin and land exactly on the selected segment
function spinToSegment(targetSegmentIndex) {
  if(isSpinning) return;
  isSpinning = true;
  document.getElementById('spinButton').disabled = true;

  const spins = Math.floor(Math.random() * 4) + 3; // 3-6 full spins
  const totalRotation = 360 * spins;

  // Calculate the angle needed so that target segment center is at pointer (top, 0 degrees)
  // Because wheel rotation is clockwise in drawing, and 0 degrees is at top
  // The wheel's rotation angle in animation is in degrees, where 0 means wheel's first segment's start at pointer
  // To align center of the target segment at top, we need to rotate wheel so that its center aligns with 0 degrees pointer
  // The wheel's current rotation is currentAngle, but for animation, we animate to the final rotation

  const segmentCenterAngle = getSegmentCenterAngle(targetSegmentIndex);
  // The wheel must rotate so that segmentCenterAngle aligns with 0 degrees pointer:
  // Since the wheel rotates clockwise, final rotation = totalRotation + (360 - segmentCenterAngle)
  const finalWheelRotation = totalRotation + (360 - segmentCenterAngle);

  const duration = 6000; // 6 seconds
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    if(elapsed > duration){
      // Set wheel to final position
      currentAngle = finalWheelRotation % 360;
      drawWheel(currentAngle);
      // Save result
      players.push({name: currentPlayer, result: targetSegmentIndex + 1});
      hasSpun[currentPlayer] = true;
      displayResults();

      // Reset for next user
      currentPlayer = null;
      document.getElementById('playerName').value = '';
      document.getElementById('playerForm').style.display = 'block';
      document.getElementById('spinButton').disabled = true;
      isSpinning = false;
      return;
    }
    const progress = elapsed / duration;
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    currentAngle = easedProgress * finalWheelRotation;
    drawWheel(currentAngle);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Handle start button
document.getElementById('submitName').addEventListener('click', () => {
  const nameInput = document.getElementById('playerName');
  const name = nameInput.value.trim();
  if(!name){
    alert('Please enter your name.');
    return;
  }
  if(hasSpun[name]){
    alert('You have already spun.');
    return;
  }
  currentPlayer = name;
  document.getElementById('playerForm').style.display = 'none';
  document.getElementById('spinButton').disabled = false;
});

// Handle spin button
document.getElementById('spinButton').addEventListener('click', () => {
  if(!currentPlayer || hasSpun[currentPlayer]) return;

  let targetSegmentIndex;
  // Find a unique segment not used yet
  do {
    targetSegmentIndex = Math.floor(Math.random() * segments);
  } while(usedNumbers.has(targetSegmentIndex+1));
  usedNumbers.add(targetSegmentIndex+1);

  spinToSegment(targetSegmentIndex);
});

// Display results
function displayResults() {
  const resultsDiv = document.getElementById('playerResults');
  resultsDiv.innerHTML = '';
  players.forEach(p => {
    resultsDiv.innerHTML += `<div class="player-result"><strong>${p.name}:</strong> ${p.result}</div>`;
  });
}

// Initialize
drawWheel();
