/**
 * DEMOCRACIA FIGHTER - Núcleo do Jogo (Game Engine, Física, IA e Regras de Luta)
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('fight-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Estado Geral
    this.currentScreen = 'title';
    this.selectedHero = HEROES[0];
    this.currentStageIndex = 0;
    this.currentOpponent = OPPONENTS_LADDER[0];
    this.isSecretStage = false;

    // Estatísticas da Partida
    this.stats = {
      roundsWon: 0,
      civicUnlocked: 0,
      assistsUsed: 0
    };

    // Entidades do Combate
    this.player = null;
    this.opponent = null;
    this.projectiles = [];
    this.activeAssist = null;
    this.assistTimer = 100; // Começa pronto
    this.fightTimer = 99;
    this.roundNumber = 1;
    this.isRoundOver = false;
    this.isPaused = false;
    this.screenShake = { duration: 0, intensity: 0 };
    this.superFreeze = null;
    this.combo = { count: 0, timer: 0, totalDamage: 0, lastBonus: 0 };

    // Controles & Mobile Quality of Life
    this.keys = {};
    this.lastTime = 0;
    this.hapticsEnabled = localStorage.getItem('democracia_haptics') !== 'false';
    this.inputBuffer = null;

    this.initDOM();
    this.initEvents();
  }

  // Vibração Tátil Otimizada para Celular (Haptic Feedback)
  triggerHaptic(pattern = 15) {
    if (this.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {}
    }
  }

  initDOM() {
    // Renderiza o carrossel de personagens
    const container = document.getElementById('characters-container');
    container.innerHTML = '';

    HEROES.forEach((hero, index) => {
      const card = document.createElement('div');
      card.className = `char-card-select ${index === 0 ? 'selected' : ''}`;
      card.dataset.id = hero.id;
      const portraitHtml = hero.portrait ? 
        `<img src="${hero.portrait}" class="char-portrait-img" alt="${hero.name}">` : 
        `<span class="char-avatar-box">${hero.avatar}</span>`;
      card.innerHTML = `
        <div class="char-avatar-box">${portraitHtml}</div>
        <div class="char-card-name">${hero.name}</div>
        <div class="char-card-style">${hero.role.split('/')[0]}</div>
      `;
      card.addEventListener('click', () => {
        AudioPlayer.playSelect();
        document.querySelectorAll('.char-card-select').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedHero = hero;
        this.updateCharPreview(hero);
      });
      container.appendChild(card);
    });

    this.updateCharPreview(this.selectedHero);
  }

  updateCharPreview(hero) {
    const preview = document.getElementById('char-preview');
    const portraitHtml = hero.portrait ? `<img src="${hero.portrait}" class="preview-hero-img" alt="${hero.name}">` : '';
    preview.innerHTML = `
      <div class="preview-portrait-col">
        ${portraitHtml}
      </div>
      <div class="preview-col-left">
        <div><strong>LUTADOR:</strong> ${hero.name} (${hero.role})</div>
        <div class="preview-special">⚡ ESPECIAL: ${hero.special.name} (${hero.special.damage} Dano)</div>
        <div class="preview-super">🔥 SUPER: ${hero.superMove.name} (${hero.superMove.damage} Dano)</div>
      </div>
      <div class="preview-col-right">
        "${hero.quote}"
      </div>
    `;
  }

  initEvents() {
    // Botões do Menu Principal
    document.getElementById('btn-start').addEventListener('click', () => {
      AudioPlayer.playSelect();
      this.showScreen('character-select');
    });

    document.getElementById('btn-sound-toggle').addEventListener('click', (e) => {
      const enabled = AudioPlayer.toggleSound();
      e.target.innerText = enabled ? '🔊 SOM: LIGADO' : '🔇 SOM: MUDO';
    });

    document.getElementById('btn-instructions').addEventListener('click', () => {
      AudioPlayer.playSelect();
      document.getElementById('instructions-modal').classList.remove('hidden');
    });

    document.getElementById('btn-close-instructions').addEventListener('click', () => {
      AudioPlayer.playSelect();
      document.getElementById('instructions-modal').classList.add('hidden');
    });

    // Código Secreto
    document.getElementById('btn-secret-code').addEventListener('click', () => {
      AudioPlayer.playSelect();
      document.getElementById('secret-modal').classList.remove('hidden');
      document.getElementById('secret-input').value = '';
      document.getElementById('secret-feedback').innerText = '';
    });

    document.getElementById('btn-close-secret').addEventListener('click', () => {
      AudioPlayer.playSelect();
      document.getElementById('secret-modal').classList.add('hidden');
    });

    document.getElementById('btn-submit-code').addEventListener('click', () => {
      this.handleSecretCode();
    });

    // Tela Cheia e Ajustes
    this.initAudioSliders();

    const fullBtns = ['btn-title-fullscreen', 'btn-hud-fullscreen', 'btn-settings-fullscreen', 'btn-pause-fullscreen'];
    fullBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => this.toggleFullscreen());
    });

    document.addEventListener('fullscreenchange', () => this.updateFullscreenButtons());
    document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButtons());

    // Modal de Ajustes (Menu Principal)
    const btnAudioSettings = document.getElementById('btn-audio-settings');
    if (btnAudioSettings) {
      btnAudioSettings.addEventListener('click', () => {
        AudioPlayer.playSelect();
        document.getElementById('settings-modal').classList.remove('hidden');
      });
    }

    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => {
        AudioPlayer.playSelect();
        document.getElementById('settings-modal').classList.add('hidden');
      });
    }

    // Modal e Controles de Pausa (Em Combate)
    const btnPauseGame = document.getElementById('btn-pause-game');
    if (btnPauseGame) btnPauseGame.addEventListener('click', () => this.togglePause());

    // Botão de Alternar Botões Touch na Tela (HUD)
    const btnHudTouch = document.getElementById('btn-hud-touch');
    if (btnHudTouch) {
      btnHudTouch.addEventListener('click', () => {
        const touchContainer = document.getElementById('touch-controls');
        if (touchContainer) {
          touchContainer.classList.toggle('touch-enabled');
          const isEnabled = touchContainer.classList.contains('touch-enabled');
          btnHudTouch.classList.toggle('active', isEnabled);
          btnHudTouch.innerText = isEnabled ? '🎮 TOUCH: ON' : '🎮 TOUCH';
          AudioPlayer.playSelect();
        }
      });
    }

    const btnResumeGame = document.getElementById('btn-resume-game');
    if (btnResumeGame) btnResumeGame.addEventListener('click', () => this.togglePause());

    const btnRestartStage = document.getElementById('btn-restart-stage');
    if (btnRestartStage) {
      btnRestartStage.addEventListener('click', () => {
        AudioPlayer.playSelect();
        this.isPaused = false;
        document.getElementById('pause-modal').classList.add('hidden');
        this.loadStage();
      });
    }

    const btnPauseMenu = document.getElementById('btn-pause-menu');
    if (btnPauseMenu) {
      btnPauseMenu.addEventListener('click', () => {
        AudioPlayer.playSelect();
        this.isPaused = false;
        document.getElementById('pause-modal').classList.add('hidden');
        this.showScreen('title');
      });
    }

    // Seleção de Personagem
    document.getElementById('btn-confirm-char').addEventListener('click', () => {
      AudioPlayer.playSelect();
      this.startCampaign();
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
      AudioPlayer.playSelect();
      this.showScreen('title');
    });

    // Pílula de Cidadania / Avançar de Fase
    document.getElementById('btn-next-stage').addEventListener('click', () => {
      AudioPlayer.playSelect();
      document.getElementById('civic-card-modal').classList.add('hidden');
      this.advanceToNextStage();
    });

    // Game Over / Vitória
    document.getElementById('btn-play-again').addEventListener('click', () => {
      AudioPlayer.playSelect();
      this.startCampaign();
    });

    document.getElementById('btn-menu-exit').addEventListener('click', () => {
      AudioPlayer.playSelect();
      this.showScreen('title');
    });

    // Eventos da Cena Final (Posse no Planalto)
    const btnWatchEnding = document.getElementById('btn-watch-ending');
    if (btnWatchEnding) {
      btnWatchEnding.addEventListener('click', () => {
        AudioPlayer.playSelect();
        this.showEndingCutscene();
      });
    }

    const btnEndingStats = document.getElementById('btn-ending-stats');
    if (btnEndingStats) {
      btnEndingStats.addEventListener('click', () => {
        AudioPlayer.playSelect();
        this.showGameOver(true);
      });
    }

    const btnEndingReplay = document.getElementById('btn-ending-replay');
    if (btnEndingReplay) {
      btnEndingReplay.addEventListener('click', () => {
        AudioPlayer.playSelect();
        this.startCampaign();
      });
    }

    const btnEndingMenu = document.getElementById('btn-ending-menu');
    if (btnEndingMenu) {
      btnEndingMenu.addEventListener('click', () => {
        AudioPlayer.playSelect();
        this.showScreen('title');
      });
    }

    // Teclado (Controles completos para Computador / Desktop)
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Realçar visualmente o botão na tela correspondente
      const directBtn = document.querySelector(`.touch-btn[data-key="${e.code}"]`);
      if (directBtn) directBtn.classList.add('active-key');

      // Navegação por teclado nas telas e modais
      if (e.code === 'Space' || e.code === 'Enter') {
        const modalCivic = document.getElementById('civic-card-modal');
        if (modalCivic && !modalCivic.classList.contains('hidden')) {
          AudioPlayer.playSelect();
          modalCivic.classList.add('hidden');
          this.advanceToNextStage();
          return;
        }

        const modalInst = document.getElementById('instructions-modal');
        if (modalInst && !modalInst.classList.contains('hidden')) {
          AudioPlayer.playSelect();
          modalInst.classList.add('hidden');
          return;
        }

        if (this.currentScreen === 'title') {
          AudioPlayer.playSelect();
          this.showScreen('character-select');
          return;
        }

        if (this.currentScreen === 'character-select') {
          AudioPlayer.playSelect();
          this.startCampaign();
          return;
        }

        if (this.currentScreen === 'game-over') {
          AudioPlayer.playSelect();
          this.startCampaign();
          return;
        }
      }

      if (e.code === 'KeyP') {
        if (this.currentScreen === 'fight') {
          this.togglePause();
          return;
        }
      }

      if (e.code === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
        return;
      }

      if (e.code === 'Escape') {
        if (this.isPaused) {
          this.togglePause();
          return;
        }
        if (this.currentScreen === 'fight') {
          this.togglePause();
          return;
        }
        const modalSettings = document.getElementById('settings-modal');
        if (modalSettings && !modalSettings.classList.contains('hidden')) {
          modalSettings.classList.add('hidden');
          return;
        }
        const modalInst = document.getElementById('instructions-modal');
        if (modalInst && !modalInst.classList.contains('hidden')) {
          modalInst.classList.add('hidden');
          return;
        }
        const modalSecret = document.getElementById('secret-modal');
        if (modalSecret && !modalSecret.classList.contains('hidden')) {
          modalSecret.classList.add('hidden');
          return;
        }
      }

      // Combate ativo por teclado (apenas quando não pausado)
      if (this.currentScreen === 'fight' && !this.isPaused) {
        // Soco: J, Z, Numpad1
        if (e.code === 'KeyJ' || e.code === 'KeyZ' || e.code === 'Numpad1') {
          this.playerAction('punch');
          const btn = document.querySelector('.action-punch');
          if (btn) btn.classList.add('active-key');
        }
        // Chute: K, X, Numpad2
        if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'Numpad2') {
          this.playerAction('kick');
          const btn = document.querySelector('.action-kick');
          if (btn) btn.classList.add('active-key');
        }
        // Especial (Carregamento rápido): L, C, Numpad3
        if (e.code === 'KeyL' || e.code === 'KeyC' || e.code === 'Numpad3') {
          this.playerAction('special');
          const btn = document.querySelector('.action-special');
          if (btn) btn.classList.add('active-key');
        }
        // Super (Carregamento lento): U, E, V, Numpad4
        if (e.code === 'KeyU' || e.code === 'KeyE' || e.code === 'KeyV' || e.code === 'Numpad4') {
          this.playerAction('super');
          const btn = document.querySelector('.action-super');
          if (btn) btn.classList.add('active-key');
        }
        // Apoio Democrático: I, Q, F, Numpad5
        if (e.code === 'KeyI' || e.code === 'KeyQ' || e.code === 'KeyF' || e.code === 'Numpad5') {
          this.callAssist();
          const btn = document.querySelector('.action-assist');
          if (btn) btn.classList.add('active-key');
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;

      const directBtn = document.querySelector(`.touch-btn[data-key="${e.code}"]`);
      if (directBtn) directBtn.classList.remove('active-key');

      if (e.code === 'KeyJ' || e.code === 'KeyZ' || e.code === 'Numpad1') {
        const btn = document.querySelector('.action-punch');
        if (btn) btn.classList.remove('active-key');
      }
      if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'Numpad2') {
        const btn = document.querySelector('.action-kick');
        if (btn) btn.classList.remove('active-key');
      }
      if (e.code === 'KeyL' || e.code === 'KeyC' || e.code === 'Numpad3') {
        const btn = document.querySelector('.action-special');
        if (btn) btn.classList.remove('active-key');
      }
      if (e.code === 'KeyU' || e.code === 'KeyE' || e.code === 'KeyV' || e.code === 'Numpad4') {
        const btn = document.querySelector('.action-super');
        if (btn) btn.classList.remove('active-key');
      }
      if (e.code === 'KeyI' || e.code === 'KeyQ' || e.code === 'KeyF' || e.code === 'Numpad5') {
        const btn = document.querySelector('.action-assist');
        if (btn) btn.classList.remove('active-key');
      }
    });

    // Inicializa Sistema Touch de Alta Precisão (D-Pad Virtual & Multi-Touch Arcade)
    this.setupTouchControls();

    // Alternador de Vibração Tátil (Configurações e Pausa)
    const btnToggleHaptics = document.getElementById('btn-toggle-haptics');
    const btnPauseHaptics = document.getElementById('btn-pause-haptics');

    const updateHapticsLabels = () => {
      const stateStr = this.hapticsEnabled ? 'ATIVADA' : 'DESATIVADA';
      if (btnToggleHaptics) {
        btnToggleHaptics.innerText = `📳 VIBRAÇÃO TÁTIL (CELULAR): ${stateStr}`;
        btnToggleHaptics.classList.toggle('active', this.hapticsEnabled);
      }
      if (btnPauseHaptics) {
        btnPauseHaptics.innerText = `📳 VIBRAÇÃO: ${stateStr}`;
        btnPauseHaptics.classList.toggle('active', this.hapticsEnabled);
      }
    };
    updateHapticsLabels();

    const handleHapticToggle = () => {
      this.hapticsEnabled = !this.hapticsEnabled;
      localStorage.setItem('democracia_haptics', this.hapticsEnabled ? 'true' : 'false');
      AudioPlayer.playSelect();
      if (this.hapticsEnabled) this.triggerHaptic([20, 35, 20]);
      updateHapticsLabels();
    };

    if (btnToggleHaptics) btnToggleHaptics.addEventListener('click', handleHapticToggle);
    if (btnPauseHaptics) btnPauseHaptics.addEventListener('click', handleHapticToggle);

    // Botão para dispensar o aviso de rotação de celular
    const btnDismissRotate = document.getElementById('btn-dismiss-rotate');
    if (btnDismissRotate) {
      btnDismissRotate.addEventListener('click', () => {
        const overlay = document.getElementById('rotate-device-overlay');
        if (overlay) overlay.classList.add('dismissed');
        AudioPlayer.playSelect();
      });
    }

    // Detecção Inteligente de Dispositivo Touch / Mobile
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouchDevice) {
      const touchContainer = document.getElementById('touch-controls');
      if (touchContainer) touchContainer.classList.add('touch-enabled');
      const btnHudTouch = document.getElementById('btn-hud-touch');
      if (btnHudTouch) {
        btnHudTouch.classList.add('active');
        btnHudTouch.innerText = '🎮 TOUCH: ON';
      }
    }

    // Prevenção de Zoom por Gestos no iOS e Android
    document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });
  }

  // Configuração Completa do Sistema Touch Ergonômico para Celular
  setupTouchControls() {
    const dpadDisc = document.getElementById('touch-dpad-disc');
    const dpadCluster = document.getElementById('touch-dpad-cluster');
    const dpadNub = document.getElementById('dpad-center-nub');
    const actionsCluster = document.getElementById('touch-actions-cluster');

    let dpadTouchId = null;
    const activeActionTouches = new Map(); // touchId -> elemento de botão

    // Atualiza estado do D-Pad analógico/digital baseado nas coordenadas do toque
    const updateDpadFromCoords = (clientX, clientY) => {
      if (!dpadDisc) return;
      const rect = dpadDisc.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxRadius = rect.width / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      // Movimento visual suave do nub central acompanhando o polegar
      const clampDist = Math.min(dist, maxRadius * 0.52);
      const angle = Math.atan2(dy, dx);
      if (dpadNub) {
        const nx = Math.cos(angle) * clampDist;
        const ny = Math.sin(angle) * clampDist;
        dpadNub.style.transform = `translate(${nx}px, ${ny}px)`;
        dpadNub.classList.add('active');
      }

      // Zona morta no centro do D-Pad
      if (dist < 12) {
        this.setDpadKeys(false, false, false, false);
        return;
      }

      // Converte ângulo radiano para graus (-180 a 180)
      const deg = (angle * 180) / Math.PI;

      // Suporte completo a 8 direções (incluindo diagonais para pular para a frente ou trás!)
      let up = false, down = false, left = false, right = false;

      if (deg >= -67.5 && deg <= 67.5) right = true;
      if (deg >= 112.5 || deg <= -112.5) left = true;
      if (deg >= -157.5 && deg <= -22.5) up = true;
      if (deg >= 22.5 && deg <= 157.5) down = true;

      this.setDpadKeys(up, down, left, right);
    };

    const resetDpad = () => {
      dpadTouchId = null;
      if (dpadNub) {
        dpadNub.style.transform = 'translate(0, 0)';
        dpadNub.classList.remove('active');
      }
      this.setDpadKeys(false, false, false, false);
    };

    if (dpadCluster) {
      dpadCluster.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (dpadTouchId === null) {
            dpadTouchId = t.identifier;
            updateDpadFromCoords(t.clientX, t.clientY);
            this.triggerHaptic(10);
            break;
          }
        }
      }, { passive: false });

      dpadCluster.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === dpadTouchId) {
            updateDpadFromCoords(t.clientX, t.clientY);
            break;
          }
        }
      }, { passive: false });

      const onDpadEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === dpadTouchId) {
            resetDpad();
            break;
          }
        }
      };
      dpadCluster.addEventListener('touchend', onDpadEnd, { passive: false });
      dpadCluster.addEventListener('touchcancel', onDpadEnd, { passive: false });
    }

    // Gerenciador de Toque do Cluster de Ações com Suporte a Deslize (Slide) e Multi-Touch
    const handleActionButtonTouch = (clientX, clientY, touchId) => {
      const el = document.elementFromPoint(clientX, clientY);
      const btn = el ? el.closest('.touch-actions-cluster .touch-btn') : null;
      const lastBtn = activeActionTouches.get(touchId);

      if (btn) {
        const code = btn.dataset.key;
        if (lastBtn !== btn) {
          if (lastBtn) {
            lastBtn.classList.remove('active-key');
            if (lastBtn.dataset.key !== code) {
              this.keys[lastBtn.dataset.key] = false;
            }
          }
          activeActionTouches.set(touchId, btn);
          btn.classList.add('active-key');
          this.keys[code] = true;
          this.handleTouchAction(code);
          this.triggerHaptic(12);
        }
      } else {
        if (lastBtn) {
          lastBtn.classList.remove('active-key');
          this.keys[lastBtn.dataset.key] = false;
          activeActionTouches.delete(touchId);
        }
      }
    };

    if (actionsCluster) {
      actionsCluster.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          handleActionButtonTouch(t.clientX, t.clientY, t.identifier);
        }
      }, { passive: false });

      actionsCluster.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          handleActionButtonTouch(t.clientX, t.clientY, t.identifier);
        }
      }, { passive: false });

      const onActionEnd = (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touchId = e.changedTouches[i].identifier;
          const btn = activeActionTouches.get(touchId);
          if (btn) {
            btn.classList.remove('active-key');
            this.keys[btn.dataset.key] = false;
            activeActionTouches.delete(touchId);
          }
        }
      };
      actionsCluster.addEventListener('touchend', onActionEnd, { passive: false });
      actionsCluster.addEventListener('touchcancel', onActionEnd, { passive: false });
    }

    // Suporte a Mouse (Fallback caso o jogador teste com o cursor no computador)
    document.querySelectorAll('.touch-btn').forEach(btn => {
      const code = btn.dataset.key;
      btn.addEventListener('mousedown', () => {
        this.keys[code] = true;
        this.handleTouchAction(code);
        btn.classList.add('active-key');
      });
      btn.addEventListener('mouseup', () => {
        this.keys[code] = false;
        btn.classList.remove('active-key');
      });
      btn.addEventListener('mouseleave', () => {
        this.keys[code] = false;
        btn.classList.remove('active-key');
      });
    });
  }

  setDpadKeys(up, down, left, right) {
    this.keys['KeyW'] = up;
    this.keys['KeyS'] = down;
    this.keys['KeyA'] = left;
    this.keys['KeyD'] = right;

    const btnUp = document.querySelector('.dpad-up');
    const btnDown = document.querySelector('.dpad-down');
    const btnLeft = document.querySelector('.dpad-left');
    const btnRight = document.querySelector('.dpad-right');

    if (btnUp) btnUp.classList.toggle('active-key', up);
    if (btnDown) btnDown.classList.toggle('active-key', down);
    if (btnLeft) btnLeft.classList.toggle('active-key', left);
    if (btnRight) btnRight.classList.toggle('active-key', right);
  }

  handleTouchAction(code) {
    if (this.currentScreen !== 'fight') return;
    if (code === 'KeyJ') this.playerAction('punch');
    if (code === 'KeyK') this.playerAction('kick');
    if (code === 'KeyL') this.playerAction('special');
    if (code === 'KeyU') this.playerAction('super');
    if (code === 'KeyI') this.callAssist();
    if (code === 'KeyW') {
      if (this.player && this.player.isGrounded) {
        this.player.vy = -14;
        this.player.isGrounded = false;
        AudioPlayer.playJump();
        this.triggerHaptic(12);
      }
    }
  }

  handleSecretCode() {
    const input = document.getElementById('secret-input').value.trim().toUpperCase();
    const feedback = document.getElementById('secret-feedback');

    const secretBoss = SECRET_BOSSES.find(b => b.code === input);
    if (secretBoss) {
      AudioPlayer.playVictory();
      feedback.style.color = '#4ade80';
      feedback.innerText = `🔓 CHEFE SECRETO LIBERADO: ${secretBoss.name}!`;
      setTimeout(() => {
        document.getElementById('secret-modal').classList.add('hidden');
        this.startSecretFight(secretBoss);
      }, 1200);
      return;
    }

    if (input === '13' || input === 'FANDOM') {
      AudioPlayer.playAssist();
      feedback.style.color = '#38bdf8';
      feedback.innerText = '⭐ BÔNUS ATIVADO: SUPORTE DOS FANDOMS INFINITO!';
      this.assistTimer = 999;
      setTimeout(() => {
        document.getElementById('secret-modal').classList.add('hidden');
      }, 1200);
      return;
    }

    AudioPlayer.playKO();
    feedback.style.color = '#ef4444';
    feedback.innerText = '❌ CÓDIGO INVÁLIDO OU NÃO RECONHECIDO!';
  }

  showScreen(screenId) {
    this.currentScreen = screenId;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`${screenId}-screen`);
    if (target) target.classList.add('active');

    if (screenId !== 'fight') {
      AudioPlayer.stopBGM();
    }
  }

  startCampaign() {
    this.currentStageIndex = 0;
    this.isSecretStage = false;
    this.stats = { roundsWon: 0, civicUnlocked: 0, assistsUsed: 0 };
    this.currentOpponent = OPPONENTS_LADDER[0];
    this.loadStage();
  }

  startSecretFight(secretBoss) {
    this.isSecretStage = true;
    this.currentOpponent = secretBoss;
    this.loadStage();
  }

  loadStage() {
    this.showScreen('fight');
    this.isRoundOver = false;
    this.roundNumber = 1;
    this.fightTimer = 99;
    this.projectiles = [];
    this.activeAssist = null;
    this.assistTimer = 100;
    this.screenShake = { duration: 0, intensity: 0 };
    this.superFreeze = null;
    this.koDramatic = null;
    this.combo = { count: 0, timer: 0, totalDamage: 0, lastBonus: 0 };

    // Configura o Jogador
    this.player = {
      ...this.selectedHero,
      x: 180,
      y: 440,
      vx: 0,
      vy: 0,
      isGrounded: true,
      facing: 1,
      hp: 100,
      maxHp: 100,
      specialMeter: 0,
      superMeter: 0,
      state: 'idle',
      stateTimer: 0
    };

    // Configura o Adversário (CPU)
    this.opponent = {
      ...this.currentOpponent,
      x: 780,
      y: 440,
      vx: 0,
      vy: 0,
      isGrounded: true,
      facing: -1,
      hp: this.currentOpponent.maxHp,
      specialMeter: 0,
      superMeter: 0,
      state: 'idle',
      stateTimer: 0,
      aiCooldown: 45
    };

    this.lastTime = performance.now();
    this.updateHUD();
    AudioPlayer.startBGM();

    // Exibe temporariamente os atalhos de comando antes do 1º round e desvanece suavemente
    const pcBar = document.getElementById('pc-controls-bar');
    if (pcBar) {
      pcBar.classList.add('visible');
      if (this.controlsBarTimer) clearTimeout(this.controlsBarTimer);
      this.controlsBarTimer = setTimeout(() => {
        pcBar.classList.remove('visible');
      }, 3800);
    }

    // Banner de Início de Round
    this.showAnnouncement('1º TURNO! LUTEM!');

    // Inicia Timer do Round
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.currentScreen === 'fight' && !this.isRoundOver && !this.isPaused) {
        this.fightTimer--;
        document.getElementById('fight-timer').innerText = this.fightTimer;
        if (this.fightTimer <= 0) {
          this.endRound('timeout');
        }
      }
    }, 1000);
  }

  showAnnouncement(text) {
    const banner = document.getElementById('fight-announcement');
    const content = document.getElementById('announcement-text');
    content.innerText = text;
    banner.classList.remove('hidden');
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 1400);
  }

  // Ações do Jogador
  playerAction(action) {
    if (this.isPaused || this.isRoundOver) return;

    // Buffer de Input Inteligente: Se estiver saindo de hit stun ou terminando golpe anterior, guarda na fila
    if (this.player.state === 'hit' || this.player.state === 'knocked') {
      if (this.player.state === 'hit' && this.player.stateTimer <= 8) {
        this.inputBuffer = { action, timer: 10 };
      }
      return;
    }

    if (this.player.state === 'punch' || this.player.state === 'kick' || this.player.state === 'special') {
      if (this.player.stateTimer > 4) {
        this.inputBuffer = { action, timer: 8 };
        return;
      }
    }

    // Auto-alinhamento inteligente de direção: ao atacar próximo ao adversário, vira de frente automaticamente
    if (Math.abs(this.player.x - this.opponent.x) < 280) {
      this.player.facing = (this.player.x < this.opponent.x) ? 1 : -1;
    }

    this.triggerHaptic(12);

    if (action === 'punch') {
      this.player.state = 'punch';
      this.player.stateTimer = 16;
      AudioPlayer.playPunch();
      this.checkMeleeHit(this.player, this.opponent, this.player.punchDmg, 85);
    } else if (action === 'kick') {
      this.player.state = 'kick';
      this.player.stateTimer = 22;
      AudioPlayer.playKick();
      this.checkMeleeHit(this.player, this.opponent, this.player.kickDmg, 110);
    } else if (action === 'special') {
      // Requer 100% de carga para disparar o Especial
      if ((this.player.specialMeter || 0) < 100) {
        this.showAnnouncement(`⚡ CARREGANDO ESPECIAL (${Math.floor(this.player.specialMeter || 0)}%)!`);
        return;
      }
      this.player.specialMeter = 0;
      this.player.state = 'special';
      this.player.stateTimer = 25;
      AudioPlayer.playSpecial();
      this.triggerHaptic(25);

      // Dispara projétil
      this.projectiles.push({
        x: this.player.x + 35 * this.player.facing,
        y: this.player.y - 45,
        vx: this.player.special.speed * this.player.facing,
        color: this.player.special.projectileColor,
        damage: this.player.special.damage,
        owner: 'player'
      });
      this.updateHUD();
    } else if (action === 'super') {
      // Requer 100% de carga para desferir o Super
      if ((this.player.superMeter || 0) < 100) {
        this.showAnnouncement(`🔥 CARREGANDO SUPER (${Math.floor(this.player.superMeter || 0)}%)!`);
        return;
      }
      this.player.superMeter = 0;
      this.player.state = 'special';
      this.player.stateTimer = 45;
      AudioPlayer.playSuperFreeze();
      AudioPlayer.playSuper();
      this.triggerHaptic([40, 60, 80]);
      this.showAnnouncement(this.player.superMove.name.toUpperCase() + '!');

      // Ativa Super Freeze Dramático (0.5s de freeze, flash, tela escurecida e banner estilizado)
      this.superFreeze = {
        attacker: this.player,
        target: this.opponent,
        name: this.player.superMove.name,
        damage: this.player.superMove.damage,
        color: this.player.superMove.color || '#ea580c',
        timer: 32,
        maxTimer: 32,
        isPlayer: true
      };
      this.updateHUD();
    }
  }

  // Chamar Apoio Democrático / Assist (Fandoms / Zé Gotinha)
  callAssist() {
    if (this.isRoundOver || this.assistTimer < 100) return;

    this.assistTimer = 0;
    this.stats.assistsUsed++;
    AudioPlayer.playAssist();
    this.triggerHaptic(25);

    // Escolhe o assist
    const assist = ASSISTS_LIST[this.stats.assistsUsed % ASSISTS_LIST.length];
    this.activeAssist = {
      data: assist,
      progress: 0,
      x: this.player.x - 60,
      y: this.player.y
    };

    const banner = document.getElementById('assist-banner');
    const content = document.getElementById('assist-content');
    content.innerText = `${assist.tag}: ${assist.desc}`;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 2200);

    // Aplica o efeito
    if (assist.effect === 'heal') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + assist.value);
    } else if (assist.effect === 'super_charge') {
      this.player.superMeter = Math.min(100, this.player.superMeter + assist.value);
      this.opponent.state = 'hit';
      this.opponent.stateTimer = 30;
    } else if (assist.effect === 'speed_boost') {
      this.player.speed *= 1.4;
      setTimeout(() => this.player.speed /= 1.4, 5000);
      // Limpa projéteis inimigos
      this.projectiles = this.projectiles.filter(p => p.owner === 'player');
    }

    this.updateHUD();
  }

  checkMeleeHit(attacker, target, damage, reach) {
    const dist = Math.abs(attacker.x - target.x);
    if (dist < reach && target.state !== 'knocked') {
      // Chance do oponente avançado defender
      if (attacker === this.player && target.difficulty >= 3 && target.state !== 'hit' && target.state !== 'block') {
        const blockChance = 0.22 + (target.difficulty * 0.07);
        if (Math.random() < blockChance) {
          target.state = 'block';
          target.stateTimer = 22;
        }
      }

      // Sistema de Defesa Ativa do Jogador (Segurar S / Botão Defesa ou andar para trás afastando do golpe)
      if (target === this.player && target.state !== 'hit' && target.state !== 'block') {
        const isHoldingBack = (target.facing === 1 && (this.keys['KeyA'] || this.keys['ArrowLeft'])) ||
                              (target.facing === -1 && (this.keys['KeyD'] || this.keys['ArrowRight']));
        const isGuarding = this.keys['KeyS'] || this.keys['ArrowDown'] || isHoldingBack;
        if (isGuarding && target.isGrounded) {
          target.state = 'block';
          target.stateTimer = 20;
          this.triggerHaptic(20);
        }
      }

      // Se o alvo estiver defendendo, sofre apenas dano de raspão (chip damage)
      if (target.state === 'block') {
        AudioPlayer.playBlock();
        this.triggerScreenShake(8, 4);
        const chipDmg = Math.max(1, Math.floor(damage * 0.22));
        target.hp = Math.max(0, target.hp - chipDmg);
        target.vx = (target.x >= attacker.x ? 1 : -1) * 3.5;
        Sprites.addSparkle(target.x, target.y - 40, '#38bdf8');
        this.showAnnouncement(target === this.player ? '🛡️ DEFESA ATIVA! (-78% DANO)' : '🛡️ GOLPE DEFENDIDO!');
        this.updateHUD();
        return;
      }

      // Sistema de Contador de Combos (quando o jogador acerta o oponente)
      if (attacker === this.player) {
        if (this.combo.timer > 0) {
          this.combo.count++;
          const comboBonus = Math.min(18, Math.floor(damage * 0.25 * (this.combo.count - 1)));
          damage += comboBonus;
          this.combo.lastBonus = comboBonus;
          this.combo.totalDamage += damage;
          this.combo.timer = 85; // Janela de link (~1.4s)
        } else {
          this.combo.count = 1;
          this.combo.timer = 85;
          this.combo.totalDamage = damage;
          this.combo.lastBonus = 0;
        }
      }

      this.applyDamage(target, damage);
      Sprites.addSparkle(target.x, target.y - 40, '#fef08a');
      attacker.specialMeter = Math.min(100, (attacker.specialMeter || 0) + 16);
      attacker.superMeter = Math.min(100, (attacker.superMeter || 0) + 8);
    }
  }

  applyDamage(target, dmg, isSuper = false) {
    target.hp = Math.max(0, target.hp - dmg);
    target.state = 'hit';
    target.stateTimer = 16;
    const attacker = (target === this.opponent) ? this.player : this.opponent;
    const pushDir = (target.x >= (attacker ? attacker.x : 480)) ? 1 : -1;
    target.vx = pushDir * (isSuper ? 16 : 4);

    // Feedback tátil no celular
    if (target === this.player) {
      this.triggerHaptic(isSuper ? [35, 45, 60] : 25);
    } else {
      this.triggerHaptic(18);
    }

    // Tremor de tela de impacto proporcional
    this.triggerScreenShake(isSuper ? 28 : 10, isSuper ? 14 : 5);

    // Receber dano gera um pouco de carga
    target.specialMeter = Math.min(100, (target.specialMeter || 0) + 8);
    target.superMeter = Math.min(100, (target.superMeter || 0) + 5);

    AudioPlayer.playPunch();
    this.updateHUD();

    if (target.hp <= 0) {
      target.state = 'knocked';
      const winner = (target === this.opponent ? 'player_won' : 'opponent_won');
      const attacker = (target === this.opponent ? this.player : this.opponent);
      this.triggerKODramatic(target, attacker, winner, isSuper);
    }
  }

  triggerKODramatic(victim, attacker, winner, isSuper) {
    if (this.koDramatic || this.isRoundOver) return;

    this.triggerHaptic([60, 50, 100]);
    AudioPlayer.playKO();
    this.triggerScreenShake(38, 20);

    // Efeito de arremesso dramático e wall bounce no nocauteado
    const pushDir = (victim.x >= attacker.x ? 1 : -1);
    victim.vx = pushDir * 14;
    victim.vy = -11;
    victim.isGrounded = false;
    victim.isWallBouncing = true;

    // Chuva de faíscas brilhantes no ponto do impacto decisivo
    for (let i = 0; i < 20; i++) {
      Sprites.addSparkle(
        victim.x + (Math.random() - 0.5) * 45,
        victim.y - 40 + (Math.random() - 0.5) * 45,
        isSuper ? '#ef4444' : '#facc15'
      );
    }

    this.koDramatic = {
      timer: 85,          // ~1.4 segundos de slow motion cinematográfico a 60fps
      maxTimer: 85,
      flash: 1.0,         // Flash intenso de impacto
      victim,
      attacker,
      winner,
      isSuper,
      shockwave: 0
    };
  }

  triggerScreenShake(duration, intensity) {
    this.screenShake = { duration, intensity };
  }

  endRound(winner) {
    if (this.isRoundOver) return;
    this.isRoundOver = true;

    if (winner === 'player_won') {
      this.showAnnouncement('INELEGÍVEL! NOCAUTE!');
      this.player.state = 'victory';
      this.stats.roundsWon++;

      setTimeout(() => {
        AudioPlayer.playVictory();
        this.openCivicModal();
      }, 1600);
    } else {
      this.showAnnouncement('DERROTA NAS URNAS!');
      this.opponent.state = 'victory';
      setTimeout(() => {
        this.showGameOver(false);
      }, 1800);
    }
  }

  openCivicModal() {
    const modal = document.getElementById('civic-card-modal');
    const civicIndex = this.currentStageIndex % CIVIC_CARDS.length;
    const card = CIVIC_CARDS[civicIndex];
    this.stats.civicUnlocked++;

    document.getElementById('civic-title').innerText = card.title;
    document.getElementById('civic-icon').innerText = card.icon;
    document.getElementById('civic-text').innerText = card.text;
    document.getElementById('civic-stat').innerText = card.stat;

    modal.classList.remove('hidden');
  }

  advanceToNextStage() {
    this.currentStageIndex++;
    if (this.currentStageIndex >= OPPONENTS_LADDER.length || this.isSecretStage) {
      // Venceu a campanha inteira! Ativa a Cena Final Cinemática da Posse de Lula
      this.showEndingCutscene();
    } else {
      this.currentOpponent = OPPONENTS_LADDER[this.currentStageIndex];
      this.loadStage();
    }
  }

  showEndingCutscene() {
    this.showScreen('ending');
    if (this.timerInterval) clearInterval(this.timerInterval);
    AudioPlayer.stopBGM();
    AudioPlayer.playVictory();

    const speakerName = document.getElementById('ending-speaker-name');
    const speakerRole = document.getElementById('ending-speaker-role');
    const speechText = document.getElementById('ending-speech-text');

    if (this.selectedHero && this.selectedHero.id === 'lula') {
      if (speakerName) speakerName.innerText = 'LUIZ INÁCIO LULA DA SILVA';
      if (speakerRole) speakerRole.innerText = 'Presidente da República Federativa do Brasil';
      if (speechText) speechText.innerText = '"A democracia venceu o medo e a soberania popular subiu a rampa! Esta faixa pertence a cada trabalhador, a cada jovem e a todas as famílias brasileiras. O Brasil voltou a sorrir!"';
    } else if (this.selectedHero) {
      if (speakerName) speakerName.innerText = `LULA & ${this.selectedHero.name.toUpperCase()}`;
      if (speakerRole) speakerRole.innerText = 'Comitiva da Vitória Popular • Palácio do Planalto';
      if (speechText) speechText.innerText = `"Juntos defendemos as urnas e a Constituição! Com a união de ${this.selectedHero.name} e de milhões de brasileiros, a posse no Planalto sela a vitória histórica da democracia sobre o autoritarismo!"`;
    }
  }

  showGameOver(isVictory) {
    this.showScreen('game-over');
    if (this.timerInterval) clearInterval(this.timerInterval);

    const title = document.getElementById('game-over-title');
    const sub = document.getElementById('game-over-sub');
    const portrait = document.getElementById('game-over-portrait');
    const speech = document.getElementById('game-over-speech');

    if (isVictory) {
      title.innerText = 'VITÓRIA DA DEMOCRACIA!';
      title.style.color = '#facc15';
      sub.innerText = 'Você percorreu o Brasil e defendeu as instituições com soberania popular!';
      portrait.innerHTML = this.selectedHero.portrait ? `<img src="${this.selectedHero.portrait}" class="final-portrait-img" alt="${this.selectedHero.name}">` : '🏆';
      speech.innerText = `"${this.selectedHero.quote}"`;
    } else {
      title.innerText = 'FIM DE JOGO: DEMOCRACIA AMEAÇADA!';
      title.style.color = '#ef4444';
      sub.innerText = 'O autoritarismo venceu temporariamente. Reorganize a base e lute novamente!';
      portrait.innerHTML = this.opponent.portrait ? `<img src="${this.opponent.portrait}" class="final-portrait-img defeat-img" alt="${this.opponent.name}">` : '🗳️';
      speech.innerText = '"A esperança vai vencer o medo. Tente de novo!"';
    }

    document.getElementById('stat-rounds').innerText = this.stats.roundsWon;
    document.getElementById('stat-civic').innerText = `${this.stats.civicUnlocked}/6`;
    document.getElementById('stat-assists').innerText = this.stats.assistsUsed;
  }

  updateHUD() {
    // Barras de Vida
    const p1Fill = document.getElementById('p1-life-fill');
    const p1Pct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
    p1Fill.style.width = `${p1Pct}%`;
    p1Fill.className = `life-bar-fill ${p1Pct < 30 ? 'danger' : ''}`;

    const p2Fill = document.getElementById('p2-life-fill');
    const p2Pct = Math.max(0, (this.opponent.hp / this.opponent.maxHp) * 100);
    p2Fill.style.width = `${p2Pct}%`;
    p2Fill.className = `life-bar-fill p2-fill ${p2Pct < 30 ? 'danger' : ''}`;

    // Especial Jogador (Carregamento Rápido)
    const p1SpecFill = document.getElementById('p1-special-fill');
    const p1SpecPct = Math.min(100, Math.floor(this.player.specialMeter || 0));
    if (p1SpecFill) p1SpecFill.style.width = `${p1SpecPct}%`;
    const p1SpecText = document.getElementById('p1-special-pct');
    if (p1SpecText) p1SpecText.innerText = p1SpecPct;
    const p1SpecFrame = document.getElementById('p1-special-frame');
    if (p1SpecFrame) p1SpecFrame.classList.toggle('ready', p1SpecPct >= 100);

    // Super Jogador (Carregamento Lento)
    const p1SuperFill = document.getElementById('p1-super-fill');
    const p1SuperPct = Math.min(100, Math.floor(this.player.superMeter || 0));
    if (p1SuperFill) p1SuperFill.style.width = `${p1SuperPct}%`;
    const p1SuperText = document.getElementById('p1-super-pct');
    if (p1SuperText) p1SuperText.innerText = p1SuperPct;
    const p1SuperFrame = document.getElementById('p1-super-frame');
    if (p1SuperFrame) p1SuperFrame.classList.toggle('ready', p1SuperPct >= 100);

    // Especial Oponente (CPU - Carregamento Rápido)
    const p2SpecFill = document.getElementById('p2-special-fill');
    const p2SpecPct = Math.min(100, Math.floor(this.opponent.specialMeter || 0));
    if (p2SpecFill) p2SpecFill.style.width = `${p2SpecPct}%`;
    const p2SpecText = document.getElementById('p2-special-pct');
    if (p2SpecText) p2SpecText.innerText = p2SpecPct;
    const p2SpecFrame = document.getElementById('p2-special-frame');
    if (p2SpecFrame) p2SpecFrame.classList.toggle('ready', p2SpecPct >= 100);

    // Super Oponente (CPU - Carregamento Lento)
    const p2SuperFill = document.getElementById('p2-super-fill');
    const p2SuperPct = Math.min(100, Math.floor(this.opponent.superMeter || 0));
    if (p2SuperFill) p2SuperFill.style.width = `${p2SuperPct}%`;
    const p2SuperText = document.getElementById('p2-super-pct');
    if (p2SuperText) p2SuperText.innerText = p2SuperPct;
    const p2SuperFrame = document.getElementById('p2-super-frame');
    if (p2SuperFrame) p2SuperFrame.classList.toggle('ready', p2SuperPct >= 100);

    // Botões de Ação na Tela (Atualização de Labels e Brilho)
    const btnSpec = document.getElementById('btn-action-special');
    const labelSpec = document.getElementById('label-special');
    if (btnSpec && labelSpec) {
      if (p1SpecPct >= 100) {
        btnSpec.classList.add('ready-special');
        labelSpec.innerText = '⚡ PRONTO!';
      } else {
        btnSpec.classList.remove('ready-special');
        labelSpec.innerText = `⚡ ESP ${p1SpecPct}%`;
      }
    }

    const btnSuper = document.getElementById('btn-action-super');
    const labelSuper = document.getElementById('label-super');
    if (btnSuper && labelSuper) {
      if (p1SuperPct >= 100) {
        btnSuper.classList.add('ready-super');
        labelSuper.innerText = '🔥 PRONTO!';
      } else {
        btnSuper.classList.remove('ready-super');
        labelSuper.innerText = `🔥 SUP ${p1SuperPct}%`;
      }
    }

    const btnAssist = document.getElementById('btn-action-assist');
    const labelAssist = document.getElementById('label-assist');
    if (btnAssist && labelAssist) {
      if (this.assistTimer >= 100) {
        btnAssist.classList.add('ready-assist');
        labelAssist.innerText = '🤝 PRONTO!';
      } else {
        btnAssist.classList.remove('ready-assist');
        labelAssist.innerText = `🤝 ${Math.floor(this.assistTimer)}%`;
      }
    }

    // Nomes e Avatares com Imagens Reais
    document.getElementById('p1-name').innerText = this.player.name.toUpperCase();
    const p1PortraitHtml = this.player.portrait ? 
      `<img src="${this.player.portrait}" class="hud-portrait-img" alt="${this.player.name}">` : 
      `<span class="portrait-avatar">${this.player.avatar}</span>`;
    document.getElementById('p1-portrait').innerHTML = p1PortraitHtml;

    document.getElementById('p2-name').innerText = this.opponent.name.toUpperCase();
    const p2PortraitHtml = this.opponent.portrait ? 
      `<img src="${this.opponent.portrait}" class="hud-portrait-img" alt="${this.opponent.name}">` : 
      `<span class="portrait-avatar">${this.opponent.avatar}</span>`;
    document.getElementById('p2-portrait').innerHTML = p2PortraitHtml;

    // Local da Fase
    document.getElementById('stage-location-tag').innerText = `ETAPA ${this.currentStageIndex + 1}: ${this.opponent.stageName.toUpperCase()}`;
    document.getElementById('ai-badge').innerText = `NÍVEL ${this.opponent.difficulty}`;

    // Assist Badge
    const assistState = document.getElementById('assist-state-text');
    if (this.assistTimer >= 100) {
      assistState.innerText = 'PRONTO! (TECLA I/Q)';
      assistState.style.color = '#4ade80';
    } else {
      assistState.innerText = `${Math.floor(this.assistTimer)}%`;
      assistState.style.color = '#cbd5e1';
    }
  }

  // Loop de Lógica e Renderização
  update(delta) {
    if (this.currentScreen !== 'fight' || this.isPaused) return;
    delta = Math.min(delta, 50);

    // 0. Gerenciador do K.O. Dramático com Câmera Lenta (Slow Motion ~25% da velocidade)
    if (this.koDramatic) {
      const kd = this.koDramatic;
      kd.timer--;
      kd.shockwave += 9;

      if (kd.flash > 0) {
        kd.flash = Math.max(0, kd.flash - 0.06);
      }

      // Aplica desaceleração de física cinemática no mundo do jogo
      delta = delta * 0.25;

      if (kd.timer <= 0) {
        const winType = kd.winner;
        this.koDramatic = null;
        this.endRound(winType);
        return;
      }
    }

    // 0.1 Gerenciador do Super Freeze Dramático (0.5s de freeze, flash, tela escurecida e banner)
    if (this.superFreeze) {
      this.superFreeze.timer--;
      const sf = this.superFreeze;

      // Partículas radiantes atrás do atacante durante o freeze
      if (Math.random() < 0.75) {
        Sprites.addSparkle(
          sf.attacker.x + (Math.random() - 0.5) * 45,
          sf.attacker.y - 45 + (Math.random() - 0.5) * 45,
          sf.color
        );
      }

      // Fim do Freeze: Desfere o golpe devastador com knockback violento e tremor
      if (sf.timer <= 0) {
        const target = sf.target;
        const attacker = sf.attacker;
        this.applyDamage(target, sf.damage, true /* isSuper */);
        this.triggerScreenShake(28, 15);

        const pushDir = (target.x >= attacker.x ? 1 : -1);
        target.vx = pushDir * 16;
        target.vy = -11;
        target.isGrounded = false;
        target.isWallBouncing = true;

        Sprites.addSparkle(target.x, target.y - 40, sf.color);
        Sprites.addSparkle(target.x, target.y - 40, '#ffffff');
        this.superFreeze = null;
      }
      return; // Congela os cálculos de física e movimentação durante o Super Freeze
    }

    // Decaimento do Contador de Combos
    if (this.combo && this.combo.timer > 0) {
      this.combo.timer--;
    }

    // Sistema de Carregamento Contínuo (Especial carrega rápido, Super carrega mais lento)
    // Agachar/defender (S ou Seta Baixo) carrega ambos mais rápido!
    const isCharging = (this.keys['KeyS'] || this.keys['ArrowDown']) && this.player.isGrounded;
    const pSpecRate = isCharging ? 0.035 : 0.016; // ~16%/s normal, 35%/s agachado
    const pSuperRate = isCharging ? 0.009 : 0.004; // ~4%/s normal, 9%/s agachado

    this.player.specialMeter = Math.min(100, (this.player.specialMeter || 0) + delta * pSpecRate);
    this.player.superMeter = Math.min(100, (this.player.superMeter || 0) + delta * pSuperRate);

    // Oponente (CPU) também carrega Especial e Super com a mesma mecânica!
    this.opponent.specialMeter = Math.min(100, (this.opponent.specialMeter || 0) + delta * 0.016);
    this.opponent.superMeter = Math.min(100, (this.opponent.superMeter || 0) + delta * 0.004);

    // Recarga do Assist
    if (this.assistTimer < 100) {
      this.assistTimer += delta * 0.015;
    }

    // Atualiza barras no HUD a cada frame
    this.updateHUD();

    // 1. Atualiza Jogador
    if (this.player.stateTimer > 0) {
      this.player.stateTimer--;
      if (this.player.stateTimer <= 0) {
        this.player.state = 'idle';
      }
    }

    // Processamento do Buffer de Input (Executa combos fluídos sem perda de toques rápidos)
    if (this.inputBuffer) {
      this.inputBuffer.timer--;
      if ((this.player.state === 'idle' || this.player.state === 'walk') && this.player.stateTimer <= 0) {
        const bufferedAction = this.inputBuffer.action;
        this.inputBuffer = null;
        this.playerAction(bufferedAction);
      } else if (this.inputBuffer.timer <= 0) {
        this.inputBuffer = null;
      }
    }

    if (this.player.state !== 'knocked' && this.player.state !== 'hit') {
      let isMoving = false;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
        this.player.vx = -this.player.speed;
        this.player.facing = -1;
        isMoving = true;
      } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
        this.player.vx = this.player.speed;
        this.player.facing = 1;
        isMoving = true;
      } else {
        this.player.vx = 0;
        // Se estiver parado ou atacando, vira de frente para o oponente
        if (this.player.state === 'idle' || this.player.state === 'punch' || this.player.state === 'kick' || this.player.state === 'special') {
          this.player.facing = (this.player.x < this.opponent.x) ? 1 : -1;
        }
      }

      if ((this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space']) && this.player.isGrounded) {
        this.player.vy = -14;
        this.player.isGrounded = false;
        AudioPlayer.playJump();
      }

      if (isCharging && this.player.state === 'idle') {
        this.player.state = 'crouch';
      } else if (!isCharging && this.player.state === 'crouch') {
        this.player.state = 'idle';
      } else if (isMoving && this.player.state === 'idle') {
        this.player.state = 'walk';
      } else if (!isMoving && this.player.state === 'walk') {
        this.player.state = 'idle';
      }
    }

    // Gravidade e Física Jogador
    this.player.y += this.player.vy;
    this.player.x += this.player.vx;
    if (this.player.y < 440) {
      this.player.vy += 0.8;
      this.player.isGrounded = false;
    } else {
      this.player.y = 440;
      this.player.vy = 0;
      this.player.isGrounded = true;
    }

    // Limites de tela Jogador e Impacto de Bordas (Wall Bounce)
    if (this.player.x <= 70) {
      this.player.x = 70;
      if (this.player.isWallBouncing) {
        AudioPlayer.playWallBounce();
        this.triggerScreenShake(20, 12);
        this.player.vx = 7;
        this.player.vy = -5;
        this.player.isWallBouncing = false;
        Sprites.addSparkle(this.player.x, this.player.y - 40, '#facc15');
        this.showAnnouncement('💥 IMPACTO NA BORDA!');
      }
    } else if (this.player.x >= 890) {
      this.player.x = 890;
      if (this.player.isWallBouncing) {
        AudioPlayer.playWallBounce();
        this.triggerScreenShake(20, 12);
        this.player.vx = -7;
        this.player.vy = -5;
        this.player.isWallBouncing = false;
        Sprites.addSparkle(this.player.x, this.player.y - 40, '#facc15');
        this.showAnnouncement('💥 IMPACTO NA BORDA!');
      }
    }

    // 2. IA do Oponente (CPU)
    this.updateOpponentAI(delta);

    // 3. Atualiza Projéteis
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;

      // Colisão do projétil com oponente
      if (p.owner === 'player' && Math.abs(p.x - this.opponent.x) < 32 && Math.abs(p.y - (this.opponent.y - 40)) < 42) {
        // Chance do oponente avançado defender
        if (this.opponent.difficulty >= 3 && this.opponent.state !== 'hit' && Math.random() < 0.45) {
          this.opponent.state = 'block';
          this.opponent.stateTimer = 20;
        }

        if (this.opponent.state === 'block') {
          AudioPlayer.playBlock();
          this.triggerScreenShake(8, 4);
          const chip = Math.max(1, Math.floor(p.damage * 0.22));
          this.opponent.hp = Math.max(0, this.opponent.hp - chip);
          Sprites.addSparkle(p.x, p.y, '#38bdf8');
          this.showAnnouncement('🛡️ PROJÉTIL DEFENDIDO!');
          this.updateHUD();
          this.projectiles.splice(i, 1);
          continue;
        }

        // Contador de Combos para projéteis
        if (this.combo.timer > 0) {
          this.combo.count++;
          const bonus = Math.floor(p.damage * 0.22 * (this.combo.count - 1));
          p.damage += bonus;
          this.combo.lastBonus = bonus;
          this.combo.totalDamage += p.damage;
          this.combo.timer = 85;
        } else {
          this.combo.count = 1;
          this.combo.timer = 85;
          this.combo.totalDamage = p.damage;
          this.combo.lastBonus = 0;
        }

        this.applyDamage(this.opponent, p.damage);
        Sprites.addSparkle(p.x, p.y, p.color);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Colisão do projétil com jogador
      if (p.owner === 'opponent' && Math.abs(p.x - this.player.x) < 30 && Math.abs(p.y - (this.player.y - 40)) < 40) {
        const isHoldingBack = (p.vx > 0 && (this.keys['KeyA'] || this.keys['ArrowLeft'])) ||
                              (p.vx < 0 && (this.keys['KeyD'] || this.keys['ArrowRight']));
        const isGuarding = this.keys['KeyS'] || this.keys['ArrowDown'] || isHoldingBack;

        if (isGuarding && this.player.state !== 'knocked') {
          this.player.state = 'block';
          this.player.stateTimer = 18;
          AudioPlayer.playBlock();
          this.triggerHaptic(20);
          this.triggerScreenShake(7, 3);
          const chip = Math.max(1, Math.floor(p.damage * 0.22));
          this.player.hp = Math.max(0, this.player.hp - chip);
          Sprites.addSparkle(p.x, p.y, '#38bdf8');
          this.showAnnouncement('🛡️ PROJÉTIL DEFENDIDO!');
          this.updateHUD();
          this.projectiles.splice(i, 1);
          continue;
        }

        this.applyDamage(this.player, p.damage);
        Sprites.addSparkle(p.x, p.y, p.color);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Saiu da tela
      if (p.x < 0 || p.x > 960) {
        this.projectiles.splice(i, 1);
      }
    }

    // 4. Partículas
    Sprites.updateSparkles();
  }

  // Lógica da Inteligência Artificial (CPU Dinâmica e Desafiadora)
  updateOpponentAI(delta) {
    const opp = this.opponent;
    if (this.isRoundOver || opp.state === 'knocked') return;

    if (opp.stateTimer > 0) {
      opp.stateTimer--;
      // Se estiver agachado carregando, acelera recarga do Especial e Super!
      if (opp.state === 'crouch') {
        opp.specialMeter = Math.min(100, (opp.specialMeter || 0) + 0.45);
        opp.superMeter = Math.min(100, (opp.superMeter || 0) + 0.25);
        if (Math.random() < 0.4) {
          Sprites.addSparkle(opp.x + (Math.random() - 0.5) * 30, opp.y - 25, '#38bdf8');
        }
      }
      if (opp.stateTimer <= 0) opp.state = 'idle';
      return;
    }

    // Oponente sempre vira na direção do jogador (se não estiver atacando ou defendendo)
    if (opp.state !== 'punch' && opp.state !== 'kick' && opp.state !== 'special' && opp.state !== 'block') {
      opp.facing = opp.x > this.player.x ? -1 : 1;
    }
    const dist = Math.abs(opp.x - this.player.x);
    const isAdvanced = (opp.difficulty >= 3); // Pavanato, Moro, Nikolas, Flávio, Bolsonaro, Vorcaro, Carlos

    // Reação a Projétil do Jogador (Pular ou Defender)
    if (isAdvanced && opp.isGrounded) {
      const incoming = this.projectiles.find(p => p.owner === 'player' && Math.abs(p.x - opp.x) < 210 && (p.vx * (opp.x - p.x) > 0));
      if (incoming) {
        if (Math.random() < 0.6) {
          // Pulo evasivo por cima do projétil!
          opp.vy = -13.5;
          opp.isGrounded = false;
          opp.vx = opp.facing * 2.8;
          opp.state = 'idle';
          AudioPlayer.playJump();
          return;
        } else if (Math.random() < 0.8) {
          // Bloqueio do projétil!
          opp.state = 'block';
          opp.stateTimer = 24;
          return;
        }
      }
    }

    opp.aiCooldown--;
    if (opp.aiCooldown <= 0) {
      opp.aiCooldown = Math.max(16, 56 - opp.difficulty * 5);

      // 1. SUPER DO OPONENTE: Ativa Super Freeze Dramático quando atinge 100%!
      if ((opp.superMeter || 0) >= 100 && Math.random() < 0.7) {
        opp.superMeter = 0;
        opp.state = 'special';
        opp.stateTimer = 45;
        AudioPlayer.playSuperFreeze();
        AudioPlayer.playSuper();

        const superTitle = opp.superMove ? opp.superMove.name : 'SUPER GOLPE INIMIGO';
        const sDmg = opp.superMove ? opp.superMove.damage : 30;

        this.superFreeze = {
          attacker: opp,
          target: this.player,
          name: superTitle,
          damage: sDmg,
          color: opp.superMove ? opp.superMove.color : '#ef4444',
          timer: 32,
          maxTimer: 32,
          isPlayer: false
        };
        return;
      }

      // 2. Comportamento Tático Avançado por Distância
      if (dist > 230) {
        // Longe: Se for avançado e meters abaixo de 100%, agachar para carregar especiais!
        if (isAdvanced && (opp.specialMeter < 100 || opp.superMeter < 100) && Math.random() < 0.5) {
          opp.state = 'crouch';
          opp.stateTimer = 32 + opp.difficulty * 3;
          opp.vx = 0;
          return;
        }

        // Se estiver distante E com Especial 100% carregado, dispara o projétil!
        if ((opp.specialMeter || 0) >= 100 && Math.random() < 0.85) {
          opp.specialMeter = 0;
          opp.state = 'special';
          opp.stateTimer = 24;
          AudioPlayer.playSpecial();
          this.projectiles.push({
            x: opp.x + 35 * opp.facing,
            y: opp.y - 45,
            vx: 6.2 * opp.facing,
            color: opp.specialColor || '#f59e0b',
            damage: 14 + opp.difficulty * 2,
            owner: 'opponent'
          });
        } else {
          // Avança para encurtar distância
          opp.vx = opp.facing * (opp.speed * 0.95);
          opp.state = 'walk';
        }
      } else if (dist < 85) {
        // Perto: Se o jogador estiver desferindo soco/chute e oponente for avançado, defender!
        if (isAdvanced && (this.player.state === 'punch' || this.player.state === 'kick') && Math.random() < 0.55) {
          opp.state = 'block';
          opp.stateTimer = 22;
          opp.vx = 0;
          return;
        }

        // Pular para trás (dodge) ou golpear
        if (isAdvanced && Math.random() < 0.22 && opp.isGrounded) {
          opp.vy = -12;
          opp.vx = -opp.facing * 3.5;
          opp.isGrounded = false;
          AudioPlayer.playJump();
          return;
        }

        // Soco ou Chute
        if (Math.random() > 0.42) {
          opp.state = 'punch';
          opp.stateTimer = 18;
          AudioPlayer.playPunch();
          this.checkMeleeHit(opp, this.player, 8 + opp.difficulty * 2, 65);
        } else {
          opp.state = 'kick';
          opp.stateTimer = 22;
          AudioPlayer.playKick();
          this.checkMeleeHit(opp, this.player, 12 + opp.difficulty * 2, 80);
        }
      } else {
        // Média distância (85 a 230)
        // Chance de pulo de aproximação se for avançado
        if (isAdvanced && Math.random() < 0.25 && opp.isGrounded) {
          opp.vy = -13;
          opp.vx = opp.facing * 3.8;
          opp.isGrounded = false;
          AudioPlayer.playJump();
          return;
        }

        if ((opp.specialMeter || 0) >= 100 && Math.random() < 0.6) {
          opp.specialMeter = 0;
          opp.state = 'special';
          opp.stateTimer = 22;
          AudioPlayer.playSpecial();
          this.projectiles.push({
            x: opp.x + 35 * opp.facing,
            y: opp.y - 45,
            vx: 6.2 * opp.facing,
            color: opp.specialColor || '#f59e0b',
            damage: 14 + opp.difficulty * 2,
            owner: 'opponent'
          });
        } else {
          opp.vx = opp.facing * opp.speed;
          opp.state = 'walk';
        }
      }
    }

    // Gravidade e Física Vertical do Oponente
    opp.vy = opp.vy || 0;
    opp.y += opp.vy;
    if (opp.y < 440) {
      opp.vy += 0.8;
      opp.isGrounded = false;
    } else {
      opp.y = 440;
      opp.vy = 0;
      opp.isGrounded = true;
    }

    // Física Horizontal do Oponente com Limites e Impacto de Borda (Wall Bounce)
    opp.x += opp.vx;
    if (opp.x <= 70) {
      opp.x = 70;
      if (opp.isWallBouncing) {
        AudioPlayer.playWallBounce();
        this.triggerScreenShake(20, 12);
        opp.vx = 7;
        opp.vy = -5;
        opp.isWallBouncing = false;
        Sprites.addSparkle(opp.x, opp.y - 40, '#facc15');
        this.showAnnouncement('💥 IMPACTO NA BORDA!');
      }
    } else if (opp.x >= 890) {
      opp.x = 890;
      if (opp.isWallBouncing) {
        AudioPlayer.playWallBounce();
        this.triggerScreenShake(20, 12);
        opp.vx = -7;
        opp.vy = -5;
        opp.isWallBouncing = false;
        Sprites.addSparkle(opp.x, opp.y - 40, '#facc15');
        this.showAnnouncement('💥 IMPACTO NA BORDA!');
      }
    }
  }

  // Renderização Gráfica
  render(time) {
    if (this.currentScreen !== 'fight') return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    // Efeito de Tremor de Tela (Screen Shake)
    if (this.screenShake && this.screenShake.duration > 0) {
      this.screenShake.duration--;
      const shakeX = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      const shakeY = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.ctx.translate(shakeX, shakeY);
    }

    // Efeito de Câmera Lenta e Zoom Dinâmico de K.O. Dramático
    if (this.koDramatic) {
      const kd = this.koDramatic;
      const progress = 1 - (kd.timer / kd.maxTimer);
      const zoom = 1 + 0.16 * Math.sin(progress * Math.PI);
      const focusX = (kd.victim.x + kd.attacker.x) / 2;
      const focusY = (kd.victim.y + kd.attacker.y) / 2 - 25;

      this.ctx.translate(focusX, focusY);
      this.ctx.scale(zoom, zoom);
      this.ctx.translate(-focusX, -focusY);
    }

    // 1. Desenha Cenário com Imagem Real HD
    Stages.drawStage(this.ctx, this.currentOpponent.stageName, time, this.currentOpponent.stageImage);

    // 2. Desenha Assist Ativo
    if (this.activeAssist) {
      this.activeAssist.progress += 0.02;
      Sprites.drawAssistActor(this.ctx, this.activeAssist.data, this.activeAssist.x, this.activeAssist.y, this.activeAssist.progress);
      if (this.activeAssist.progress >= 1) {
        this.activeAssist = null;
      }
    }

    // 3. Desenha Lutadores
    Sprites.drawFighter(this.ctx, this.player, time);
    Sprites.drawFighter(this.ctx, this.opponent, time);

    // 4. Desenha Projéteis
    this.projectiles.forEach(p => Sprites.drawProjectile(this.ctx, p));

    // 5. Desenha Faíscas de Impacto
    Sprites.drawSparkles(this.ctx);

    // 6. Efeito Visual de Super Freeze / Flash Dramático (Estilo Street Fighter / MvC)
    if (this.superFreeze) {
      this.drawSuperFreezeOverlay(time);
    }

    // 7. Contador de Combos Arcade na Tela
    if (this.combo && this.combo.count >= 2 && this.combo.timer > 0) {
      this.drawComboCounter();
    }

    this.ctx.restore();

    // 8. Efeito Visual de K.O. Dramático (Renderizado em coordenadas da tela limpa, sem distorção do zoom)
    if (this.koDramatic) {
      this.drawKODramaticOverlay(time);
    }
  }

  // Overlay Dramático de K.O. com Câmera Lenta Estilo Street Fighter
  drawKODramaticOverlay(time) {
    const kd = this.koDramatic;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const progress = 1 - (kd.timer / kd.maxTimer);

    // 1. Shockwave expansiva no ponto do golpe final
    if (kd.shockwave < 450) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(kd.victim.x, kd.victim.y - 40, kd.shockwave, 0, Math.PI * 2);
      ctx.strokeStyle = kd.isSuper ? '#ef4444' : '#facc15';
      ctx.lineWidth = Math.max(1, 6 * (1 - kd.shockwave / 450));
      ctx.globalAlpha = Math.max(0, 0.7 * (1 - kd.shockwave / 450));
      ctx.stroke();
      ctx.restore();
    }

    // 2. Flash Inicial de Nocaute
    if (kd.flash > 0) {
      ctx.save();
      ctx.fillStyle = kd.isSuper ? `rgba(239, 68, 68, ${kd.flash * 0.75})` : `rgba(255, 255, 255, ${kd.flash * 0.85})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 3. Barras Pretas de Cinema (Cinematic Letterbox)
    const barHeight = 28 * Math.min(1, progress * 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, barHeight);
    ctx.fillRect(0, h - barHeight, w, barHeight);

    // 4. Banner Compacto e Estilizado de K.O.
    ctx.save();
    const bannerCenterY = 180;
    const bannerW = 460;
    const bannerH = 68;
    const bannerX = (w - bannerW) / 2;
    const bannerY = bannerCenterY - (bannerH / 2);

    // Fundo Translúcido com borda suave
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);

    // Linha dourada superior e inferior da cartela
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bannerX, bannerY);
    ctx.lineTo(bannerX + bannerW, bannerY);
    ctx.moveTo(bannerX, bannerY + bannerH);
    ctx.lineTo(bannerX + bannerW, bannerY + bannerH);
    ctx.stroke();

    // Texto de K.O. (Tamanho compacto e proporcional: 36px)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 36px "Outfit", sans-serif';

    // Sombra profunda
    ctx.fillStyle = '#000000';
    ctx.fillText('K. O. !', w / 2 + 2, bannerCenterY - 9);

    // Contorno vermelho escuro
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 6;
    ctx.strokeText('K. O. !', w / 2, bannerCenterY - 11);

    // Gradiente do K.O. (Amarelo Radiante -> Laranja -> Vermelho)
    const textGrad = ctx.createLinearGradient(w / 2, bannerCenterY - 28, w / 2, bannerCenterY + 5);
    textGrad.addColorStop(0, '#fef08a');
    textGrad.addColorStop(0.5, '#f59e0b');
    textGrad.addColorStop(1, '#dc2626');
    ctx.fillStyle = textGrad;
    ctx.fillText('K. O. !', w / 2, bannerCenterY - 11);

    // Subtítulo Perfeitamente Centralizado com Cartela Simétrica
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const isPlayerWin = (kd.winner === 'player_won');
    const subText = isPlayerWin ? '★ VITÓRIA DA DEMOCRACIA ★' : '★ DERROTA NAS URNAS ★';
    ctx.font = '700 11px "Outfit", sans-serif';

    const textWidth = ctx.measureText(subText).width;
    const pillW = textWidth + 28;
    const pillH = 22;
    const pillX = (w - pillW) / 2;
    const pillY = bannerCenterY + 16 - (pillH / 2);

    // Cartela elegante de fundo com contorno contrastante
    ctx.fillStyle = isPlayerWin ? 'rgba(20, 83, 45, 0.92)' : 'rgba(127, 29, 29, 0.92)';
    ctx.strokeStyle = isPlayerWin ? '#4ade80' : '#f87171';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pillX, pillY, pillW, pillH, 4);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();
    ctx.stroke();

    // Texto perfeitamente centralizado no ponto médio do canvas (w / 2)
    ctx.fillStyle = isPlayerWin ? '#86efac' : '#fca5a5';
    ctx.fillText(subText, w / 2, bannerCenterY + 16);
    ctx.restore();

    ctx.restore();
  }

  // Overlay Dramático do Super Freeze
  drawSuperFreezeOverlay(time) {
    const sf = this.superFreeze;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Escurecimento dramático da tela (Dark Screen)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.76)';
    ctx.fillRect(0, 0, w, h);

    // Linhas de velocidade radiantes estilo Capcom CPS2 / Street Fighter
    ctx.save();
    ctx.strokeStyle = sf.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI / 8) + (time * 0.002);
      ctx.beginPath();
      ctx.moveTo(sf.attacker.x, sf.attacker.y - 45);
      ctx.lineTo(
        sf.attacker.x + Math.cos(angle) * 700,
        sf.attacker.y - 45 + Math.sin(angle) * 500
      );
      ctx.stroke();
    }
    ctx.restore();

    // Rastro de sombra cintilante / afterimages ao redor do atacante
    ctx.save();
    [-24, -12, 12, 24].forEach((offset, idx) => {
      ctx.save();
      ctx.globalAlpha = 0.35 - (idx * 0.06);
      ctx.translate(offset, 0);
      Sprites.drawFighter(ctx, sf.attacker, time);
      ctx.restore();
    });
    ctx.restore();

    // Redesenha o atacante iluminado no centro do freeze
    Sprites.drawFighter(ctx, sf.attacker, time);

    // Banner Estilizado do Super (Estilo Capcom CPS2 / Marvel vs Capcom)
    ctx.save();
    const bannerY = 175;
    const bannerH = 74;

    // Faixa diagonal de fundo do banner
    const grad = ctx.createLinearGradient(0, bannerY, w, bannerY + bannerH);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    grad.addColorStop(0.3, sf.color);
    grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.95)');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, bannerY, w, bannerH);

    // Bordas douradas do banner
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, bannerY - 3, w, 3);
    ctx.fillRect(0, bannerY + bannerH, w, 3);

    // Texto de topo: SUPER COMBO / SUPER FLASH
    ctx.font = '900 15px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText('⚡ SUPER FLASH DRAMÁTICO! ⚡', w / 2, bannerY + 24);

    // Nome do Golpe em Destaque
    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = sf.color;
    ctx.shadowBlur = 12;
    ctx.fillText(`"${sf.name.toUpperCase()}"`, w / 2, bannerY + 54);

    ctx.restore();
  }

  // Renderizador do Contador de Combos Arcade
  drawComboCounter() {
    const ctx = this.ctx;
    const count = this.combo.count;
    const bonus = this.combo.lastBonus || 0;

    ctx.save();
    // Posição no topo esquerdo do ringue
    const x = 70;
    const y = 140;

    // Efeito de pulso de escala ao acertar novo golpe
    const scale = 1 + (this.combo.timer / 85) * 0.15;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Caixa de fundo arcade
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-10, -28, 230, 68, 8);
    ctx.fill();
    ctx.stroke();

    // Texto principal de Combo
    ctx.font = '900 20px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 8;
    ctx.fillText(`${count} HITS!`, 0, 0);

    // Subtítulo com bônus de dano
    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 4;
    ctx.fillText(`+${bonus} DANO EXTRA! COMBO`, 0, 24);

    ctx.restore();
  }

  // Loop Master
  loop(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;

    this.update(delta);
    this.render(time);

    requestAnimationFrame((t) => this.loop(t));
  }

  toggleFullscreen() {
    AudioPlayer.playSelect();
    const elem = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  updateFullscreenButtons() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const text = isFull ? '🗗 JANELA' : '⛶ TELA CHEIA';
    ['btn-title-fullscreen', 'btn-settings-fullscreen', 'btn-pause-fullscreen'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.innerText = text;
    });
    const hudBtn = document.getElementById('btn-hud-fullscreen');
    if (hudBtn) hudBtn.innerText = isFull ? '🗗' : '⛶';
  }

  togglePause() {
    if (this.currentScreen !== 'fight' || this.isRoundOver) return;

    this.isPaused = !this.isPaused;
    const modal = document.getElementById('pause-modal');

    if (this.isPaused) {
      AudioPlayer.playSelect();
      AudioPlayer.pauseBGM();

      const stageInfo = document.getElementById('pause-stage-info');
      if (stageInfo && this.opponent) {
        stageInfo.innerText = `ETAPA ${this.currentStageIndex + 1}: ${this.opponent.stageName.toUpperCase()} • ${this.player.name.toUpperCase()} VS ${this.opponent.name.toUpperCase()}`;
      }

      // Sincroniza sliders da pausa com os volumes atuais
      const bgmVal = Math.round(AudioPlayer.bgmVolume * 100);
      const sfxVal = Math.round(AudioPlayer.sfxVolume * 100);

      const pBgmSlider = document.getElementById('pause-bgm-slider');
      const pBgmLabel = document.getElementById('pause-bgm-vol-label');
      if (pBgmSlider) pBgmSlider.value = bgmVal;
      if (pBgmLabel) pBgmLabel.innerText = `${bgmVal}%`;

      const pSfxSlider = document.getElementById('pause-sfx-slider');
      const pSfxLabel = document.getElementById('pause-sfx-vol-label');
      if (pSfxSlider) pSfxSlider.value = sfxVal;
      if (pSfxLabel) pSfxLabel.innerText = `${sfxVal}%`;

      modal.classList.remove('hidden');
    } else {
      AudioPlayer.playSelect();
      AudioPlayer.resumeBGM();
      modal.classList.add('hidden');
      this.lastTime = performance.now();
    }
  }

  initAudioSliders() {
    const bgmVal = Math.round(AudioPlayer.bgmVolume * 100);
    const sfxVal = Math.round(AudioPlayer.sfxVolume * 100);

    const bgmSliders = [document.getElementById('bgm-slider'), document.getElementById('pause-bgm-slider')];
    const bgmLabels = [document.getElementById('bgm-vol-label'), document.getElementById('pause-bgm-vol-label')];
    const sfxSliders = [document.getElementById('sfx-slider'), document.getElementById('pause-sfx-slider')];
    const sfxLabels = [document.getElementById('sfx-vol-label'), document.getElementById('pause-sfx-vol-label')];

    bgmSliders.forEach(s => { if (s) s.value = bgmVal; });
    bgmLabels.forEach(l => { if (l) l.innerText = `${bgmVal}%`; });
    sfxSliders.forEach(s => { if (s) s.value = sfxVal; });
    sfxLabels.forEach(l => { if (l) l.innerText = `${sfxVal}%`; });

    const handleBgm = (val) => {
      AudioPlayer.setBGMVolume(val);
      bgmSliders.forEach(s => { if (s) s.value = val; });
      bgmLabels.forEach(l => { if (l) l.innerText = `${val}%`; });
    };

    const handleSfx = (val) => {
      AudioPlayer.setSFXVolume(val);
      sfxSliders.forEach(s => { if (s) s.value = val; });
      sfxLabels.forEach(l => { if (l) l.innerText = `${val}%`; });
    };

    bgmSliders.forEach(s => {
      if (s) s.addEventListener('input', (e) => handleBgm(parseInt(e.target.value, 10)));
    });

    sfxSliders.forEach(s => {
      if (s) {
        s.addEventListener('input', (e) => handleSfx(parseInt(e.target.value, 10)));
        s.addEventListener('change', () => AudioPlayer.playPunch());
      }
    });
  }

  start() {
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Inicialização automática ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  game.start();
});
