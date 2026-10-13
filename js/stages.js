/**
 * DEMOCRACIA FIGHTER - Renderizador de Cenários (Stages) em Pixel Art
 * Cada fase possui atmosfera, cores, arquitetura e chão temático.
 */

class StageRenderer {
  constructor() {
    this.images = {};
    this.loadStageImages();
  }

  loadStageImages() {
    const stagePaths = {
      df_congresso: 'assets/cenas/DF_CONGRESSO.jpg',
      sp_masp: 'assets/cenas/SP_MASP.jpg',
      caravana: 'assets/stages/caravana.jpg',
      debate: 'assets/stages/debate.jpg',
      paulista: 'assets/cenas/SP_MASP.jpg',
      curitiba: 'assets/stages/curitiba.jpg',
      comicio: 'assets/stages/comicio.jpg',
      mansao: 'assets/stages/mansao.jpg',
      orlando: 'assets/stages/orlando.jpg',
      farialima: 'assets/stages/farialima.jpg',
      bunker_bots: 'assets/stages/bunker_bots.jpg',
      masp: 'assets/cenas/SP_MASP.jpg',
      brasilia: 'assets/cenas/DF_CONGRESSO.jpg'
    };

    Object.entries(stagePaths).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[key] = img;
        this.images[src] = img;
      };
    });
  }

  drawStage(ctx, stageName, time, stageImage = null) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const groundY = 460;

    let targetImg = null;
    if (stageImage) {
      if (this.images[stageImage] && this.images[stageImage].complete) {
        targetImg = this.images[stageImage];
      } else {
        const cleanName = stageImage.toLowerCase();
        const key = Object.keys(this.images).find(k => cleanName.includes(k.toLowerCase()));
        if (key && this.images[key] && this.images[key].complete) {
          targetImg = this.images[key];
        }
      }

      if (!targetImg && !this.images[stageImage]) {
        const dynImg = new Image();
        dynImg.src = stageImage;
        this.images[stageImage] = dynImg;
        if (dynImg.complete && dynImg.naturalWidth > 0) {
          targetImg = dynImg;
        }
      }
    }

    if (!targetImg) {
      if (stageName.includes('Congresso') || stageName.includes('Brasília')) targetImg = this.images.df_congresso || this.images.brasilia;
      else if (stageName.includes('MASP') || stageName.includes('Paulista')) targetImg = this.images.sp_masp || this.images.masp;
      else if (stageName.includes('Anistia') || stageName.includes('Caravana')) targetImg = this.images.caravana;
      else if (stageName.includes('Debate')) targetImg = this.images.debate;
      else if (stageName.includes('Curitiba') || stageName.includes('Senado')) targetImg = this.images.curitiba;
      else if (stageName.includes('Comício')) targetImg = this.images.comicio;
      else if (stageName.includes('Palácio') || stageName.includes('Mansão')) targetImg = this.images.mansao;
      else if (stageName.includes('Orlando') || stageName.includes('Inelegível')) targetImg = this.images.orlando;
      else if (stageName.includes('Faria Lima')) targetImg = this.images.farialima;
      else if (stageName.includes('Bots') || stageName.includes('Fazenda')) targetImg = this.images.bunker_bots;
    }

    if (targetImg) {
      ctx.drawImage(targetImg, 0, 0, width, height);
      // Sombra sutil de ambientação no piso
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, groundY - 14, width, height - groundY + 14);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, groundY - 14, width, 2);
      return;
    }

    // Fallback para cenários procedurais clássicos
    switch (stageName) {
      case 'Bloqueio na Estrada':
      case 'Caravana da Anistia 2026':
        this.drawHighwayStage(ctx, width, height, groundY, time);
        break;
      case 'Debate na Câmara':
      case 'Debate Eleitoral 2026':
        this.drawChamberStage(ctx, width, height, groundY, time);
        break;
      case 'Calçadão Público':
      case 'Calçadão da Paulista 2026':
        this.drawBoardwalkStage(ctx, width, height, groundY, time);
        break;
      case 'Tribunal de Curitiba':
      case 'Senado Federal (3ª Via 2026)':
        this.drawCourtStage(ctx, width, height, groundY, time);
        break;
      case 'Plenário da Câmara':
      case 'Comício Viral 2026':
        this.drawCongressStage(ctx, width, height, groundY, time);
        break;
      case 'Mansão do Lago Sul':
      case 'Palácio da Oposição 2026':
        this.drawMansionStage(ctx, width, height, groundY, time);
        break;
      case 'Condomínio em Orlando':
      case 'Bunker do Inelegível (Orlando/Flórida)':
        this.drawFloridaStage(ctx, width, height, groundY, time);
        break;
      case 'Faria Lima Finance':
      case 'Faria Lima Finance 2026':
        this.drawFariaLimaStage(ctx, width, height, groundY, time);
        break;
      case 'Porão dos Bots':
      case 'Fazenda de Bots & IA 2026':
        this.drawBunkerStage(ctx, width, height, groundY, time);
        break;
      default:
        this.drawHighwayStage(ctx, width, height, groundY, time);
        break;
    }

    // Desenha o piso comum de combate
    this.drawGround(ctx, width, groundY, stageName);
  }

  // FASE 1: Bloqueio na Estrada
  drawHighwayStage(ctx, w, h, groundY, time) {
    // Céu entardecer alaranjado
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, '#7c2d12');
    grad.addColorStop(0.5, '#c2410c');
    grad.addColorStop(1, '#f97316');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, groundY);

    // Sol poente no horizonte
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w / 2, groundY - 80, 50, 0, Math.PI * 2);
    ctx.fill();

    // Silhueta de caminhões parados
    ctx.fillStyle = '#334155';
    ctx.fillRect(80, groundY - 140, 160, 90);
    ctx.fillRect(20, groundY - 110, 70, 60);
    ctx.fillRect(w - 240, groundY - 150, 180, 100);

    // Pneus com fumaça subindo
    ctx.fillStyle = '#18181b';
    ctx.fillRect(360, groundY - 40, 50, 40);
    ctx.fillRect(520, groundY - 40, 50, 40);

    // Partículas de fumaça pixelada
    for (let i = 0; i < 6; i++) {
      const smokeOffset = (time * 0.04 + i * 20) % 80;
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.fillRect(380 + Math.sin(smokeOffset * 0.1) * 15, groundY - 40 - smokeOffset, 16, 16);
      ctx.fillRect(540 + Math.sin(smokeOffset * 0.1) * 15, groundY - 40 - smokeOffset, 16, 16);
    }
  }

  // FASE 2: Debate na Câmara
  drawChamberStage(ctx, w, h, groundY, time) {
    // Paredes de madeira nobre
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, w, groundY);

    // Painéis de madeira recortados
    for (let x = 40; x < w; x += 120) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, 40, 80, groundY - 120);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 10, 60, 60, groundY - 160);
    }

    // Brasão da República no centro
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(w / 2, 140, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(w / 2, 140, 24, 0, Math.PI * 2);
    ctx.fill();

    // Tribuna ao fundo
    ctx.fillStyle = '#92400e';
    ctx.fillRect(w / 2 - 100, groundY - 110, 200, 60);
  }

  // FASE 3: Calçadão Público
  drawBoardwalkStage(ctx, w, h, groundY, time) {
    // Céu azul de praia / cidade
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, groundY);

    // Mar ao fundo
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, groundY - 160, w, 60);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, groundY - 105, w, 10);

    // Postes clássicos de iluminação pública
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(120, groundY - 220, 10, 160);
    ctx.fillRect(w - 140, groundY - 220, 10, 160);
  }

  // FASE 4: Tribunal de Curitiba
  drawCourtStage(ctx, w, h, groundY, time) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, groundY);

    // Estantes repletas de processos jurídicos
    for (let x = 30; x < w; x += 100) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, 60, 80, groundY - 140);
      // Livros nas prateleiras
      for (let y = 80; y < groundY - 140; y += 30) {
        ctx.fillStyle = (x % 3 === 0) ? '#dc2626' : '#2563eb';
        ctx.fillRect(x + 5, y, 70, 20);
      }
    }

    // Tela do PowerPoint com flechas projetada ao fundo
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w / 2 - 140, 70, 280, 130);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('LULA -> TRIFLEX', w / 2 - 70, 110);
    ctx.fillText('CONVICÇÃO: 100%', w / 2 - 70, 140);
  }

  // FASE 5: Plenário do Congresso Nacional
  drawCongressStage(ctx, w, h, groundY, time) {
    // Fundo azul e arquitetura de Brasília
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, groundY);

    // Cúpula do Congresso
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(w / 2, groundY - 160, 160, Math.PI, 0);
    ctx.fill();

    // Painel eletrônico de votação piscando
    ctx.fillStyle = '#000000';
    ctx.fillRect(w / 2 - 150, 40, 300, 70);
    ctx.fillStyle = '#22c55e';
    ctx.font = '14px monospace';
    ctx.fillText('SIM: 345 | NÃO: 120', w / 2 - 100, 70);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('VOTAÇÃO EM ANDAMENTO', w / 2 - 110, 95);
  }

  // FASE 6: Mansão do Lago Sul
  drawMansionStage(ctx, w, h, groundY, time) {
    // Céu noturno com estrelas
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, groundY);

    // Fachada da mansão de luxo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(100, groundY - 260, w - 200, 200);

    // Colunas gregas suntuosas
    for (let x = 160; x < w - 160; x += 110) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, groundY - 260, 24, 200);
    }

    // Letreiro Kopenhagen em neon
    ctx.fillStyle = '#b45309';
    ctx.fillRect(w / 2 - 90, groundY - 240, 180, 35);
    ctx.fillStyle = '#fef08a';
    ctx.font = '12px monospace';
    ctx.fillText('CHOCOLATES & CIA', w / 2 - 75, groundY - 218);
  }

  // CHEFE SECRETO 1: Condomínio na Flórida
  drawFloridaStage(ctx, w, h, groundY, time) {
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(0, 0, w, groundY);

    // Palmeiras americanas
    ctx.fillStyle = '#78350f';
    ctx.fillRect(80, groundY - 250, 12, 200);
    ctx.fillRect(w - 90, groundY - 250, 12, 200);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(86, groundY - 250, 45, 0, Math.PI * 2);
    ctx.arc(w - 84, groundY - 250, 45, 0, Math.PI * 2);
    ctx.fill();

    // Placa "Welcome to Orlando / Florida"
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(w / 2 - 110, 60, 220, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('ORLANDO - VACATION', w / 2 - 80, 90);
  }

  // CHEFE SECRETO 2: Faria Lima
  drawFariaLimaStage(ctx, w, h, groundY, time) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, groundY);

    // Prédios espelhados modernos
    for (let x = 50; x < w; x += 140) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, 40, 110, groundY - 90);
      // Janelas espelhadas
      for (let y = 60; y < groundY - 90; y += 25) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 10, y, 90, 12);
      }
    }

    // Monumento da Baleia prateada da Faria Lima
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(w / 2, groundY - 50, 90, 35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // CHEFE SECRETO 3: Porão dos Bots
  drawBunkerStage(ctx, w, h, groundY, time) {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, groundY);

    // Servidores com leds verdes e azuis
    for (let x = 60; x < w; x += 90) {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x, 70, 70, groundY - 120);

      // Leds piscando
      for (let y = 90; y < groundY - 120; y += 18) {
        ctx.fillStyle = (Math.random() > 0.5) ? '#22c55e' : '#3b82f6';
        ctx.fillRect(x + 10, y, 6, 6);
        ctx.fillRect(x + 25, y, 6, 6);
      }
    }
  }

  // Piso de Luta (Asfalto, Tapete Verde, Madeira, Calçadão)
  drawGround(ctx, w, groundY, stageName) {
    let groundColor = '#1f2937';
    let detailColor = '#374151';

    if (stageName === 'Bloqueio na Estrada') {
      groundColor = '#18181b'; // Asfalto
      detailColor = '#eab308'; // Faixa amarela
    } else if (stageName === 'Plenário da Câmara') {
      groundColor = '#15803d'; // O clássico carpete verde da Câmara
      detailColor = '#166534';
    } else if (stageName === 'Calçadão Público') {
      groundColor = '#e2e8f0'; // Calçadão
      detailColor = '#0f172a'; // Ondas de pedras portuguesas
    }

    // Bloco do chão
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, groundY - 10, w, ctx.canvas.height - groundY + 10);

    // Linha de detalhe
    ctx.fillStyle = detailColor;
    ctx.fillRect(0, groundY - 10, w, 6);

    // Se for estrada, desenha faixas pontilhadas
    if (stageName === 'Bloqueio na Estrada') {
      ctx.fillStyle = '#eab308';
      for (let x = 20; x < w; x += 80) {
        ctx.fillRect(x, groundY + 25, 45, 8);
      }
    }
  }
}

const Stages = new StageRenderer();
