/**
 * Generates a looping animated GIF of a robot working from home.
 * Run with: bun scripts/generate-robot-gif.ts
 */
import sharp from 'sharp';
// @ts-ignore
import GIFEncoder from 'gif-encoder-2';
import { writeFileSync } from 'fs';

const W = 480;
const H = 320;
const FRAMES = 24;
const DELAY = 80; // ms per frame

// ─── SVG frame generator ────────────────────────────────────────────────────

function frame(i: number): string {
  const t = i / FRAMES;

  // Blink: eyes closed on frames 6-7
  const eyeOpen = !(i === 6 || i === 7);

  // Typing: arms alternate up/down
  const typingPhase = Math.sin(t * Math.PI * 4); // 2 full typing cycles
  const leftArmDy  =  typingPhase * 6;
  const rightArmDy = -typingPhase * 6;

  // Screen glow pulses gently
  const glowR = Math.round(30 + 20 * Math.sin(t * Math.PI * 2));
  const glowG = Math.round(180 + 30 * Math.sin(t * Math.PI * 2 + 1));
  const glowB = Math.round(255);
  const screenColor = `rgb(${glowR},${glowG},${glowB})`;

  // Coffee steam rises in 3 puffs cycling with frame
  const steamY1 = 148 - ((i * 3) % 24);
  const steamY2 = 142 - ((i * 3 + 8) % 24);
  const steamY3 = 136 - ((i * 3 + 16) % 24);
  const steamOp = (y: number) => Math.max(0, 1 - (y - 110) / 40).toFixed(2);

  const eyeFill   = eyeOpen ? '#00ff99' : '#003322';
  const pupilShow = eyeOpen ? 1 : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="roomGrad" cx="50%" cy="0%" r="100%">
      <stop offset="0%" stop-color="#1e1e3f"/>
      <stop offset="100%" stop-color="#0d0d1a"/>
    </radialGradient>
    <radialGradient id="screenGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${screenColor}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${screenColor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Room background -->
  <rect width="${W}" height="${H}" fill="url(#roomGrad)"/>

  <!-- Wall -->
  <rect x="0" y="0" width="${W}" height="205" fill="#1a1a35"/>

  <!-- Window -->
  <rect x="22" y="22" width="110" height="80" rx="4" fill="#87ceeb"/>
  <!-- Sky gradient in window -->
  <rect x="22" y="22" width="110" height="50" rx="4" fill="#5ba3cc"/>
  <!-- Clouds -->
  <ellipse cx="55" cy="45" rx="18" ry="10" fill="white" opacity="0.9"/>
  <ellipse cx="70" cy="40" rx="14" ry="8" fill="white" opacity="0.85"/>
  <ellipse cx="110" cy="55" rx="16" ry="9" fill="white" opacity="0.8"/>
  <!-- Buildings outside -->
  <rect x="25" y="75" width="20" height="28" fill="#3a5a8a"/>
  <rect x="50" y="68" width="16" height="35" fill="#2a4a7a"/>
  <rect x="70" y="78" width="22" height="25" fill="#3a5a8a"/>
  <rect x="98" y="65" width="18" height="38" fill="#2a4a7a"/>
  <!-- Window frame -->
  <rect x="22" y="22" width="110" height="80" rx="4" fill="none" stroke="#c8a870" stroke-width="4"/>
  <line x1="77" y1="22" x2="77" y2="102" stroke="#c8a870" stroke-width="2"/>
  <line x1="22" y1="62" x2="132" y2="62" stroke="#c8a870" stroke-width="2"/>

  <!-- Bookshelf -->
  <rect x="370" y="30" width="95" height="120" fill="#5c3d1e"/>
  <rect x="370" y="30" width="95" height="6" fill="#7a5230"/>
  <rect x="370" y="80" width="95" height="6" fill="#7a5230"/>
  <rect x="370" y="130" width="95" height="6" fill="#7a5230"/>
  <!-- Books -->
  <rect x="375" y="36" width="12" height="44" fill="#e74c3c"/>
  <rect x="388" y="36" width="10" height="44" fill="#3498db"/>
  <rect x="399" y="36" width="14" height="44" fill="#f39c12"/>
  <rect x="414" y="36" width="10" height="44" fill="#2ecc71"/>
  <rect x="425" y="36" width="13" height="44" fill="#9b59b6"/>
  <rect x="439" y="36" width="10" height="44" fill="#1abc9c"/>
  <rect x="450" y="36" width="12" height="44" fill="#e67e22"/>
  <rect x="375" y="86" width="18" height="44" fill="#8e44ad"/>
  <rect x="394" y="86" width="11" height="44" fill="#c0392b"/>
  <rect x="406" y="86" width="14" height="44" fill="#16a085"/>
  <rect x="421" y="86" width="10" height="44" fill="#d35400"/>
  <rect x="432" y="86" width="16" height="44" fill="#2980b9"/>
  <rect x="449" y="86" width="13" height="44" fill="#27ae60"/>

  <!-- Desk -->
  <rect x="0" y="200" width="${W}" height="120" fill="#4a2f0e"/>
  <rect x="0" y="198" width="${W}" height="12" fill="#6b4118"/>
  <!-- Desk highlight -->
  <rect x="0" y="198" width="${W}" height="3" fill="#8a5520" opacity="0.5"/>

  <!-- Desk legs -->
  <rect x="30" y="210" width="20" height="110" fill="#3a2008"/>
  <rect x="${W - 50}" y="210" width="20" height="110" fill="#3a2008"/>

  <!-- Laptop screen glow on desk -->
  <ellipse cx="290" cy="202" rx="90" ry="15" fill="url(#screenGlow)"/>

  <!-- Laptop base -->
  <rect x="215" y="196" width="155" height="10" rx="3" fill="#2a2a3a"/>
  <!-- Laptop screen (open, tilted) -->
  <polygon points="225,196 360,196 350,130 235,130" fill="#1a1a2a"/>
  <polygon points="228,193 357,193 347,133 238,133" fill="#0a0a1a"/>
  <!-- Screen content - code lines -->
  <rect x="242" y="140" width="60" height="4" rx="2" fill="${screenColor}" opacity="0.8"/>
  <rect x="242" y="150" width="80" height="4" rx="2" fill="${screenColor}" opacity="0.6"/>
  <rect x="250" y="160" width="50" height="4" rx="2" fill="#ff6b6b" opacity="0.7"/>
  <rect x="250" y="170" width="70" height="4" rx="2" fill="#ffd93d" opacity="0.7"/>
  <rect x="242" y="180" width="90" height="4" rx="2" fill="${screenColor}" opacity="0.5"/>
  <!-- Cursor blink -->
  ${i % 6 < 3 ? `<rect x="335" y="180" width="3" height="10" rx="1" fill="${screenColor}" opacity="0.9"/>` : ''}
  <!-- Laptop hinge -->
  <rect x="215" y="194" width="155" height="4" rx="2" fill="#222233"/>

  <!-- Keyboard -->
  <rect x="218" y="196" width="150" height="8" rx="2" fill="#1e1e2e"/>
  ${[0,1,2,3,4].map(row =>
    [0,1,2,3,4,5,6,7,8,9].map(col =>
      `<rect x="${221 + col * 14}" y="${197 + row * 1.2}" width="11" height="0.9" rx="0.3" fill="#333355" opacity="0.8"/>`
    ).join('')
  ).join('')}

  <!-- Coffee mug -->
  <rect x="155" y="168" width="28" height="32" rx="4" fill="#e8d5b7"/>
  <rect x="157" y="170" width="24" height="28" rx="3" fill="#5c3d1e"/>
  <!-- Mug handle -->
  <path d="M183,176 Q196,176 196,184 Q196,192 183,192" fill="none" stroke="#e8d5b7" stroke-width="4"/>
  <!-- Coffee surface -->
  <ellipse cx="169" cy="171" rx="12" ry="3" fill="#3a1f00"/>
  <!-- Steam puffs -->
  <path d="M163,${steamY1} Q165,${steamY1 - 6} 163,${steamY1 - 12}" stroke="#ccc" stroke-width="2" fill="none" opacity="${steamOp(steamY1)}" stroke-linecap="round"/>
  <path d="M169,${steamY2} Q172,${steamY2 - 8} 168,${steamY2 - 14}" stroke="#ccc" stroke-width="2" fill="none" opacity="${steamOp(steamY2)}" stroke-linecap="round"/>
  <path d="M175,${steamY3} Q177,${steamY3 - 6} 175,${steamY3 - 12}" stroke="#ccc" stroke-width="2" fill="none" opacity="${steamOp(steamY3)}" stroke-linecap="round"/>

  <!-- Potted plant -->
  <rect x="390" y="180" width="35" height="25" rx="3" fill="#c0392b"/>
  <rect x="393" y="178" width="29" height="5" rx="2" fill="#a93226"/>
  <rect x="404" y="155" width="5" height="30" fill="#27ae60"/>
  <ellipse cx="393" cy="158" rx="15" ry="18" fill="#2ecc71" opacity="0.9"/>
  <ellipse cx="415" cy="160" rx="13" ry="16" fill="#27ae60" opacity="0.85"/>
  <ellipse cx="406" cy="152" rx="12" ry="15" fill="#2ecc71"/>

  <!-- ─── ROBOT ─────────────────────────── -->

  <!-- Robot shadow -->
  <ellipse cx="300" cy="202" rx="45" ry="6" fill="#000" opacity="0.3"/>

  <!-- Left arm (typing) -->
  <rect x="242" y="${175 + leftArmDy}" width="28" height="16" rx="5"
        fill="#5a6a8a" transform="rotate(-15, 256, 183)"/>
  <rect x="228" y="${185 + leftArmDy}" width="20" height="12" rx="4"
        fill="#4a5a7a" transform="rotate(-10, 238, 191)"/>

  <!-- Right arm (typing) -->
  <rect x="320" y="${175 + rightArmDy}" width="28" height="16" rx="5"
        fill="#5a6a8a" transform="rotate(15, 334, 183)"/>
  <rect x="340" y="${185 + rightArmDy}" width="20" height="12" rx="4"
        fill="#4a5a7a" transform="rotate(10, 350, 191)"/>

  <!-- Robot torso -->
  <rect x="255" y="148" width="80" height="60" rx="8" fill="#3a4a6a"/>
  <!-- Torso panel details -->
  <rect x="263" y="156" width="24" height="16" rx="3" fill="#2a3a5a"/>
  <circle cx="275" cy="164" r="5" fill="#00ccff" opacity="0.8" filter="url(#glow)"/>
  <rect x="293" y="156" width="34" height="16" rx="3" fill="#2a3a5a"/>
  <!-- LED indicators on torso -->
  <circle cx="300" cy="164" r="3" fill="#ff4444" opacity="0.9"/>
  <circle cx="310" cy="164" r="3" fill="#44ff44" opacity="0.9"/>
  <circle cx="320" cy="164" r="3" fill="#4444ff" opacity="0.9"/>
  <!-- Chest vent -->
  <rect x="263" y="178" width="64" height="4" rx="2" fill="#2a3a5a"/>
  <rect x="263" y="185" width="64" height="4" rx="2" fill="#2a3a5a"/>
  <rect x="263" y="192" width="64" height="4" rx="2" fill="#2a3a5a"/>

  <!-- Neck -->
  <rect x="278" y="138" width="34" height="14" rx="4" fill="#4a5a7a"/>

  <!-- Robot head -->
  <rect x="252" y="80" width="86" height="64" rx="10" fill="#4a5a7a"/>
  <!-- Head highlight -->
  <rect x="254" y="82" width="82" height="20" rx="8" fill="#5a6a8a" opacity="0.5"/>

  <!-- Antenna -->
  <rect x="291" y="60" width="8" height="24" rx="4" fill="#6a7a9a"/>
  <circle cx="295" cy="55" r="9" fill="#00ff99" filter="url(#glow)" opacity="0.9"/>
  <circle cx="295" cy="55" r="5" fill="#ffffff" opacity="0.6"/>

  <!-- Eyes -->
  <rect x="264" y="98" width="24" height="18" rx="4" fill="#1a2a3a"/>
  <ellipse cx="276" cy="107" rx="9" ry="${eyeOpen ? 7 : 2}" fill="${eyeFill}" filter="url(#glow)"/>
  ${eyeOpen ? `<circle cx="279" cy="104" r="2.5" fill="white" opacity="${pupilShow * 0.7}"/>` : ''}

  <rect x="302" y="98" width="24" height="18" rx="4" fill="#1a2a3a"/>
  <ellipse cx="314" cy="107" rx="9" ry="${eyeOpen ? 7 : 2}" fill="${eyeFill}" filter="url(#glow)"/>
  ${eyeOpen ? `<circle cx="317" cy="104" r="2.5" fill="white" opacity="${pupilShow * 0.7}"/>` : ''}

  <!-- Mouth / expression -->
  <rect x="270" y="128" width="50" height="8" rx="4" fill="#1a2a3a"/>
  <!-- Mouth LED bar (happy) -->
  <rect x="272" y="130" width="46" height="4" rx="2" fill="#00ccff" opacity="0.6"/>

  <!-- Ear details -->
  <rect x="242" y="92" width="12" height="28" rx="4" fill="#3a4a6a"/>
  <circle cx="248" cy="106" r="4" fill="#00ccff" opacity="0.5" filter="url(#glow)"/>
  <rect x="336" y="92" width="12" height="28" rx="4" fill="#3a4a6a"/>
  <circle cx="342" cy="106" r="4" fill="#00ccff" opacity="0.5" filter="url(#glow)"/>

  <!-- Headphones (work from home staple) -->
  <path d="M252,100 Q295,60 338,100" fill="none" stroke="#222233" stroke-width="8" stroke-linecap="round"/>
  <rect x="240" y="96" width="16" height="22" rx="6" fill="#222233"/>
  <rect x="334" y="96" width="16" height="22" rx="6" fill="#222233"/>
  <rect x="242" y="98" width="12" height="18" rx="4" fill="#333344"/>
  <rect x="336" y="98" width="12" height="18" rx="4" fill="#333344"/>

  <!-- "WFH" badge on desk -->
  <rect x="60" y="186" width="68" height="22" rx="4" fill="#2a3a5a"/>
  <text x="94" y="202" font-family="monospace" font-size="11" fill="#00ccff"
        text-anchor="middle" opacity="0.9">WFH MODE</text>

  <!-- Floor -->
  <rect x="0" y="205" width="${W}" height="3" fill="#8a5520" opacity="0.4"/>
</svg>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Generating robot GIF…');

  const encoder = new GIFEncoder(W, H, 'neuquant', true, FRAMES);
  encoder.setDelay(DELAY);
  encoder.setRepeat(0);
  encoder.start();

  for (let i = 0; i < FRAMES; i++) {
    const svg = frame(i);
    const pixels = await sharp(Buffer.from(svg))
      .resize(W, H)
      .ensureAlpha()
      .raw()
      .toBuffer();
    encoder.addFrame(pixels);
    process.stdout.write(`  frame ${i + 1}/${FRAMES}\r`);
  }

  encoder.finish();
  const gif: Buffer = encoder.out.getData();
  writeFileSync('robot-wfh.gif', gif);
  console.log(`\nSaved → robot-wfh.gif  (${(gif.length / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
