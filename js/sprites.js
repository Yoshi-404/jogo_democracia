/**
 * DEMOCRACIA FIGHTER - Motor de Renderização de Sprites em Pixel Art
 * Desenha os lutadores proceduralmente na estética 16-bit com alta fidelidade e animações.
 */

class SpriteRenderer {
  constructor() {
    this.sparkles = [];
    this.sprites = {};
    this.vfx = {};
    this.loadAllSprites();
  }

  loadAllSprites() {
    const characterIds = [
      'lula', 'dilma', 'marina', 'erika', 'cortez', 'krenak',
      'npc', 'campopiano', 'pavanato', 'moro', 'nikolas',
      'flavio', 'jair', 'vorcaro', 'carlos'
    ];
    const states = ['idle', 'walk', 'punch', 'kick', 'special', 'super', 'victory', 'lost', 'defense'];

    characterIds.forEach(id => {
      this.sprites[id] = {};
      states.forEach(st => {
        const img = new Image();
        img.src = `assets/optimized/${id}/${st}.png`;
        this.sprites[id][st] = img;
      });
    });

    // VFX
    const vfxImg = new Image();
    vfxImg.src = 'assets/vfx/onda_vermelha.jpg';
    this.vfx['onda_vermelha'] = vfxImg;

    const krenakSpecialProj = new Image();
    krenakSpecialProj.src = 'assets/optimized/krenak/projectile.png';
    this.vfx['krenak_special'] = krenakSpecialProj;

    const krenakSuperProj = new Image();
    krenakSuperProj.src = 'assets/optimized/krenak/projectile_super.png';
    this.vfx['krenak_super'] = krenakSuperProj;
  }

  // Adiciona faíscas de impacto de golpe
  addSparkle(x, y, color = '#fef08a') {
    for (let i = 0; i < 8; i++) {
      this.sparkles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7 - 2,
        size: Math.floor(Math.random() * 5) + 3,
        color: color,
        life: 16
      });
    }
  }

  updateSparkles() {
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life--;
      if (s.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  drawSparkles(ctx) {
    this.sparkles.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
  }

  // Renderiza um personagem completo
  drawFighter(ctx, fighter, time) {
    ctx.save();
    
    // Inverter horizontalmente de acordo com a orientação base do personagem:
    // Vilões foram desenhados voltados para a esquerda (-1), heróis para a direita (+1)
    const villains = ['npc', 'campopiano', 'pavanato', 'moro', 'nikolas', 'flavio', 'jair', 'vorcaro', 'carlos'];
    const charSprites = this.sprites[fighter.id];
    const hasRealSprite = charSprites && (charSprites.idle && charSprites.idle.complete && charSprites.idle.naturalWidth > 0);
    const baseFacing = hasRealSprite ? (fighter.baseFacing || (villains.includes(fighter.id) ? -1 : 1)) : 1;
    const flip = fighter.facing !== baseFacing;

    ctx.translate(Math.floor(fighter.x), Math.floor(fighter.y));
    if (flip) {
      ctx.scale(-1, 1);
    }
    let targetSprite = null;

    if (charSprites) {
      if (fighter.state === 'punch') targetSprite = charSprites.punch || charSprites.idle;
      else if (fighter.state === 'kick') targetSprite = charSprites.kick || charSprites.punch || charSprites.idle;
      else if (fighter.state === 'special') targetSprite = charSprites.special || charSprites.idle;
      else if (fighter.state === 'super') targetSprite = charSprites.super || charSprites.special || charSprites.idle;
      else if (fighter.state === 'walk') targetSprite = charSprites.walk || charSprites.idle;
      else if (fighter.state === 'victory') targetSprite = charSprites.victory || charSprites.idle;
      else if (fighter.state === 'knocked') targetSprite = charSprites.lost || charSprites.idle;
      else if (fighter.state === 'hit') targetSprite = charSprites.punch || charSprites.idle;
      else if (fighter.state === 'block') targetSprite = (charSprites.defense && charSprites.defense.naturalWidth > 0) ? charSprites.defense : charSprites.idle;
      else targetSprite = charSprites.idle;
    }

    // Se houver sprite real carregado para este lutador
    if (targetSprite && targetSprite.complete && targetSprite.naturalWidth > 0) {
      // Sombra projetada no piso
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 42, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Escala padronizada de luta (175px para chão y=440 no canvas 540px)
      const targetH = 175;
      const imgW = targetSprite.naturalWidth;
      const imgH = targetSprite.naturalHeight;
      const scale = targetH / 360;
      const drawW = Math.round(imgW * scale);
      const drawH = Math.round(imgH * scale);

      // Efeito de recuo/tremor e flash quando toma golpe
      if (fighter.state === 'hit') {
        ctx.translate((Math.random() - 0.5) * 8, 0);
        ctx.filter = 'brightness(1.6) saturate(1.8)';
      }

      // Se nocauteado no chão
      if (fighter.state === 'knocked') {
        ctx.save();
        ctx.translate(0, -6);
        ctx.drawImage(targetSprite, -drawW / 2, -drawH + 20, drawW, drawH);
        ctx.restore();

        // Passarinhos de nocaute girando
        const rotTime = Date.now() * 0.007;
        for (let i = 0; i < 3; i++) {
          const angle = rotTime + (i * (Math.PI * 2 / 3));
          const px = Math.cos(angle) * 26;
          const py = -80 + Math.sin(angle) * 10;
          ctx.fillStyle = '#facc15';
          ctx.fillRect(Math.floor(px), Math.floor(py), 6, 6);
        }
        ctx.restore();
        return;
      }

      // Estado Agachado (Crouch / Carregando especial)
      const isCrouch = fighter.state === 'crouch';
      if (isCrouch) {
        ctx.scale(1, 0.76);
        ctx.translate(0, 26);
      }

      // Desenha o sprite perfeitamente ancorado nos pés
      const bob = (fighter.state === 'idle') ? Math.sin(time * 0.008) * 1.5 : 0;
      ctx.drawImage(
        targetSprite,
        -drawW / 2, -drawH + bob, drawW, drawH
      );

      // Efeito de Bloqueio / Defesa Ativa (Escudo de Energia Arcada)
      if (fighter.state === 'block') {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(drawW * 0.2, -drawH * 0.48, 48, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }

      // Efeito de Carregamento Agachado (Partículas de Energia Concentrada)
      if (isCrouch) {
        ctx.save();
        const glowColor = (fighter.superMeter < 100) ? '#f59e0b' : '#38bdf8';
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(-drawW / 2 - 4, -drawH + bob, drawW + 8, drawH);
        ctx.restore();
      }

      // Efeito especial de aura: Super 100% (flamejante) ou Especial 100% (elétrico ciano)
      if (fighter.superMeter >= 100 && fighter.state !== 'hit') {
        ctx.strokeStyle = (Math.floor(time / 80) % 2 === 0) ? '#facc15' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-drawW / 2 - 4, -drawH + bob - 4, drawW + 8, drawH + 8);
      } else if (fighter.specialMeter >= 100 && fighter.state !== 'hit') {
        ctx.strokeStyle = (Math.floor(time / 100) % 2 === 0) ? '#38bdf8' : '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(-drawW / 2 - 2, -drawH + bob - 2, drawW + 4, drawH + 4);
      }

      ctx.restore();
      return;
    }

    // Offset de animação de respiração (idle bobbing)
    const bob = (fighter.state === 'idle') ? Math.sin(time * 0.008) * 2 : 0;
    const isPunching = fighter.state === 'punch';
    const isKicking = fighter.state === 'kick';
    const isSpecial = fighter.state === 'special';
    const isHit = fighter.state === 'hit';
    const isKnocked = fighter.state === 'knocked';
    const isVictory = fighter.state === 'victory';

    // Se estiver caído
    if (isKnocked) {
      this.drawKnockedFighter(ctx, fighter);
      ctx.restore();
      return;
    }

    // Se estiver tomando golpe (pisca e treme)
    if (isHit) {
      ctx.translate((Math.random() - 0.5) * 4, 0);
    }

    // 1. Sombra projetada no piso
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Pernas e Pés
    ctx.fillStyle = fighter.colorPants || '#1e293b';
    if (isKicking) {
      // Perna de apoio
      ctx.fillRect(-10, -30, 8, 38);
      // Perna chutando esticada para frente
      ctx.fillRect(0, -32, 38, 9);
      // Sapato no chute
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(36, -34, 10, 13);
      ctx.fillRect(-12, 6, 12, 5);
    } else {
      // Pernas normais com leve abertura
      const legStride = (fighter.state === 'walk') ? Math.sin(time * 0.015) * 8 : 0;
      ctx.fillRect(-14 - legStride, -32, 9, 38);
      ctx.fillRect(4 + legStride, -32, 9, 38);

      // Sapatos
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-17 - legStride, 4, 14, 7);
      ctx.fillRect(2 + legStride, 4, 14, 7);
    }

    // 3. Tronco e Camisa
    ctx.fillStyle = fighter.colorShirt || '#ffffff';
    const torsoY = -68 + bob;
    ctx.fillRect(-16, torsoY, 32, 38);

    // Detalhe de terno / gravata / faixa
    if (fighter.colorTie) {
      ctx.fillStyle = fighter.colorTie;
      ctx.fillRect(-2, torsoY + 4, 5, 24);
    }

    // Emblema ou estrela no peito para Lula
    if (fighter.id === 'lula') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-12, torsoY + 8, 6, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-10, torsoY + 10, 2, 2);
    }

    // Camisa da seleção / amarela para Bolsonaristas
    if (fighter.id === 'npc' || fighter.id === 'jair') {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-10, torsoY + 6, 6, 8); // número 10 ou detalhe verde
    }

    // 4. Braços e Punhos
    ctx.fillStyle = fighter.colorShirt || '#ffffff';
    if (isPunching) {
      // Braço recolhido
      ctx.fillRect(-18, torsoY + 8, 8, 16);
      // Braço esticado desferindo o soco
      ctx.fillRect(0, torsoY + 6, 36, 10);
      // Mão fechada / punho
      ctx.fillStyle = fighter.colorHead;
      ctx.fillRect(34, torsoY + 4, 11, 14);
    } else if (isSpecial) {
      // Dois braços para frente disparando energia
      ctx.fillRect(6, torsoY + 4, 28, 9);
      ctx.fillRect(6, torsoY + 16, 28, 9);
      ctx.fillStyle = fighter.colorHead;
      ctx.fillRect(32, torsoY + 2, 10, 25);
    } else if (isVictory) {
      // Braços erguidos para cima em festa!
      ctx.fillRect(-22, torsoY - 20, 8, 28);
      ctx.fillRect(14, torsoY - 20, 8, 28);
      ctx.fillStyle = fighter.colorHead;
      ctx.fillRect(-24, torsoY - 26, 11, 10);
      ctx.fillRect(13, torsoY - 26, 11, 10);
    } else {
      // Guarda de combate clássica
      ctx.fillRect(-20, torsoY + 6, 8, 22);
      ctx.fillRect(10, torsoY + 4, 9, 18);
      ctx.fillStyle = fighter.colorHead;
      ctx.fillRect(-22, torsoY + 24, 10, 10);
      ctx.fillRect(14, torsoY + 14, 10, 10);
    }

    // 5. Cabeça e Rosto
    const headY = torsoY - 28;
    ctx.fillStyle = fighter.colorHead;
    ctx.fillRect(-12, headY, 24, 26);

    // Cabelo
    ctx.fillStyle = fighter.colorHair || '#334155';
    ctx.fillRect(-14, headY - 6, 28, 10);
    ctx.fillRect(-14, headY, 6, 14); // lateral do cabelo

    // Cabelo longo ondulado caindo nos ombros (Érika Hilton)
    if (fighter.id === 'erika') {
      ctx.fillRect(-18, headY + 4, 8, 34);
      ctx.fillRect(10, headY + 4, 8, 30);
    }

    // Barba (Lula / Cortez / Flávio)
    if (fighter.hasBeard) {
      ctx.fillStyle = fighter.colorBeard || fighter.colorHair || '#fff';
      ctx.fillRect(-10, headY + 14, 22, 14);
    }

    // Olhos em pixel art (Olhando para frente)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(2, headY + 8, 4, 4);
    ctx.fillRect(8, headY + 8, 3, 4);

    // Óculos de armação preta marcante (Guilherme Cortez)
    if (fighter.hasGlasses) {
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, headY + 6, 6, 6);
      ctx.strokeRect(7, headY + 6, 6, 6);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(5, headY + 8, 3, 2); // ponte dos óculos
    }

    // Boca / Expressão
    if (isHit) {
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(4, headY + 17, 7, 5);
    } else {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(4, headY + 18, 6, 2);
    }

    // Efeito especial de aura se tiver com 100% de Super
    if (fighter.superMeter >= 100 && !isHit) {
      ctx.strokeStyle = (Math.floor(time / 80) % 2 === 0) ? '#facc15' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(-22, torsoY - 32, 44, 95);
    }

    ctx.restore();
  }

  // Desenho quando o personagem é nocauteado no chão
  drawKnockedFighter(ctx, fighter) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo deitado
    ctx.fillStyle = fighter.colorPants || '#1e293b';
    ctx.fillRect(-35, -4, 30, 12);
    ctx.fillStyle = fighter.colorShirt || '#fff';
    ctx.fillRect(-10, -8, 30, 16);
    ctx.fillStyle = fighter.colorHead;
    ctx.fillRect(16, -12, 16, 18);
    ctx.fillStyle = fighter.colorHair || '#333';
    ctx.fillRect(18, -16, 16, 8);

    // Passarinhos de Stun / Inelegível girando
    const rotTime = Date.now() * 0.006;
    for (let i = 0; i < 3; i++) {
      const angle = rotTime + (i * (Math.PI * 2 / 3));
      const px = 24 + Math.cos(angle) * 16;
      const py = -24 + Math.sin(angle) * 6;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(Math.floor(px), Math.floor(py), 5, 5);
    }
  }

  // Renderiza Projéteis de Magia (Onda Vermelha, Panfletos, Fake News, etc.)
  drawProjectile(ctx, proj) {
    ctx.save();
    ctx.translate(Math.floor(proj.x), Math.floor(proj.y));

    // Se tiver sprite customizado (ex: Ciclone de Folhas do Krenak)
    const customVfx = proj.customSpriteKey ? this.vfx[proj.customSpriteKey] : null;
    if (customVfx && customVfx.complete && customVfx.naturalWidth > 0) {
      proj.rot = (proj.rot || 0) + (proj.vx >= 0 ? 0.24 : -0.24);
      ctx.rotate(proj.rot);
      const size = proj.drawSize || 58;
      ctx.drawImage(customVfx, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }

    const glowColor = proj.color || '#ef4444';
    const dir = (proj.vx >= 0) ? -1 : 1;

    // Rastro com partículas estendidas
    ctx.fillStyle = glowColor;
    ctx.fillRect(dir * 12, -6, 14, 12);
    ctx.fillRect(dir * 24, -4, 10, 8);
    ctx.fillRect(dir * 32, -2, 6, 4);

    // Aura externa da esfera de energia
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Núcleo brilhante quente
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Renderiza o Assist (Invocação do Zé Gotinha ou Fandoms)
  drawAssistActor(ctx, assist, x, y, progress) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    if (assist.id === 'gotinha') {
      // Zé Gotinha em Pixel Art
      ctx.fillStyle = '#ffffff';
      // Gota pontiaguda na cabeça
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(18, -30);
      ctx.lineTo(-18, -30);
      ctx.closePath();
      ctx.fill();

      // Rosto redondo
      ctx.beginPath();
      ctx.arc(0, -25, 20, 0, Math.PI * 2);
      ctx.fill();

      // Olhos sorridentes
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-8, -28, 4, 6);
      ctx.fillRect(4, -28, 4, 6);
      // Sorriso
      ctx.fillRect(-6, -16, 12, 3);

      // Corpo e seringa da vacina
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -6, 24, 28);
      // Seringa mágica
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, -18, 30, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(38, -16, 12, 4);

    } else if (assist.id === 'fandoms') {
      // Corações e estrelas brilhantes dos Fandoms
      const colors = ['#ec4899', '#f43f5e', '#a855f7', '#60a5fa'];
      for (let i = 0; i < 5; i++) {
        const offset = (progress * 150 + i * 40) % 200;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(-50 + offset, -50 + Math.sin(offset * 0.05) * 25, 14, 14);
      }
    } else {
      // Notas musicais da MPB flutuando
      ctx.fillStyle = '#facc15';
      ctx.font = '24px monospace';
      ctx.fillText('🎵', -10, -40);
      ctx.fillText('🎸', 15, -20);
    }

    ctx.restore();
  }
}

const Sprites = new SpriteRenderer();
