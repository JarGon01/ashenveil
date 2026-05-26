import { WAYSTONES } from '../data/waystones.js';

export class WaystoneUI {
  constructor(canvas, fastTravelSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fts = fastTravelSystem;
    this.visible = false;
    this.message = null;
    this.selectedIndex = 0;
    this.availableWaystones = [];
  }

  open() {
    this.message = null;
    if (!this.fts.fastTravelUnlocked) {
      this.showLockedMessage();
      return;
    }
    this.availableWaystones = WAYSTONES.filter(w =>
      this.fts.isWaystoneDiscovered(w.id)
    );
    if (this.availableWaystones.length === 0) {
      this.showNoWaystonesMessage();
      return;
    }
    this.selectedIndex = 0;
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.message = null;
  }

  navigate(direction) {
    if (!this.visible) return;
    if (direction === 'up') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    } else if (direction === 'down') {
      this.selectedIndex = Math.min(
        this.availableWaystones.length - 1,
        this.selectedIndex + 1
      );
    }
  }

  confirm() {
    if (!this.visible) return null;
    const selected = this.availableWaystones[this.selectedIndex];
    if (!selected) return null;
    this.close();
    return this.fts.travelTo(selected.id);
  }

  showLockedMessage() {
    // Render a brief "Fast Travel Locked" notice
    this._renderMessage(
      'Fast Travel Locked',
      [
        'Unlock by:',
        '• Exploring all 7 zones',
        '• Finding the Cartographer (Lv.10+)',
        '• Reaching Level 20'
      ]
    );
  }

  showNoWaystonesMessage() {
    this._renderMessage(
      'No Waystones Discovered',
      ['Find Waystone Shrines', 'in each zone to unlock', 'fast travel points.']
    );
  }

  render() {
    if (this.message) {
      this._drawMessage(this.message.title, this.message.lines);
      return;
    }

    if (!this.visible) return;
    const { ctx, canvas } = this;
    const w = 320, h = 280;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    // Background panel
    ctx.fillStyle = 'rgba(10, 10, 30, 0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#a0785a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Title
    ctx.fillStyle = '#f0c060';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('⬡ WAYSTONE MAP', x + 16, y + 28);

    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    ctx.fillText('↑↓ Navigate   A/Enter Confirm   B/Esc Close', x + 16, y + 46);

    // Divider
    ctx.strokeStyle = '#a0785a';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 54);
    ctx.lineTo(x + w - 10, y + 54);
    ctx.stroke();

    // Waystone list
    this.availableWaystones.forEach((ws, i) => {
      const rowY = y + 72 + i * 28;
      const isSelected = i === this.selectedIndex;

      if (isSelected) {
        ctx.fillStyle = 'rgba(160, 120, 90, 0.3)';
        ctx.fillRect(x + 10, rowY - 14, w - 20, 24);
      }

      ctx.fillStyle = isSelected ? '#f0c060' : '#c0b090';
      ctx.font = `${isSelected ? 'bold ' : ''}12px monospace`;
      ctx.fillText(`⬡ ${ws.name}`, x + 24, rowY);

      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.fillText(ws.zone.toUpperCase(), x + w - 80, rowY);
    });
  }

  _renderMessage(title, lines) {
    this.message = { title, lines };
    setTimeout(() => { this.close(); }, 3000);
  }

  _drawMessage(title, lines) {
    const { ctx, canvas } = this;
    const w = 300, h = 160;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.fillStyle = 'rgba(10, 10, 30, 0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#a0785a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#f0c060';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(title, x + 16, y + 30);

    ctx.fillStyle = '#c0b090';
    ctx.font = '11px monospace';
    lines.forEach((line, i) => {
      ctx.fillText(line, x + 16, y + 56 + i * 20);
    });
  }
}
