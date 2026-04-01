import { useEffect } from 'react'
export function useParticleCanvas(canvasRef, containerRef) {
  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d'); let w, h, particles = [], animId; let mouse = { x: null, y: null, radius: 140 }
    class P { constructor() { this.x = Math.random()*w; this.y = Math.random()*h; this.size = Math.random()*2+0.5; this.density = Math.random()*20+1; this.vx = (Math.random()-0.5); this.vy = (Math.random()-0.5); this.hue = [0,340,220,200,280][Math.floor(Math.random()*5)] }
      draw() { this.dx = this.x; this.dy = this.y; ctx.fillStyle = `hsla(${this.hue},80%,70%,0.6)`; ctx.beginPath(); ctx.arc(this.dx,this.dy,this.size,0,Math.PI*2); ctx.fill() }
      update() { this.x += this.vx; this.y += this.vy; if(this.x<0)this.x=w; if(this.x>w)this.x=0; if(this.y<0)this.y=h; if(this.y>h)this.y=0; if(mouse.x!=null){let dx=mouse.x-this.x,dy=mouse.y-this.y,d=Math.sqrt(dx*dx+dy*dy); if(d<mouse.radius&&d>0){let f=(mouse.radius-d)/mouse.radius; this.x-=(dx/d)*f*this.density; this.y-=(dy/d)*f*this.density}} } }
    const init = () => { particles = []; for(let i=0;i<Math.floor(w*h/9000);i++) particles.push(new P()) }
    const resize = () => { w = canvas.width = canvas.offsetWidth||window.innerWidth; h = canvas.height = canvas.offsetHeight||(window.innerHeight*1.25); init() }
    const animate = () => { ctx.clearRect(0,0,w,h); particles.forEach(p=>{p.update();p.draw()}); for(let i=0;i<particles.length;i++) for(let j=i;j<particles.length;j++){let dx=particles[i].dx-particles[j].dx,dy=particles[i].dy-particles[j].dy,d=Math.sqrt(dx*dx+dy*dy); if(d<110){ctx.beginPath();ctx.strokeStyle=`hsla(${(particles[i].hue+particles[j].hue)/2},70%,70%,${0.15-d/733})`;ctx.lineWidth=0.8;ctx.moveTo(particles[i].dx,particles[i].dy);ctx.lineTo(particles[j].dx,particles[j].dy);ctx.stroke()}}; animId=requestAnimationFrame(animate) }
    const mm = (e) => { const r=canvas.getBoundingClientRect(); mouse.x=(e.clientX-r.left)*(w/r.width); mouse.y=(e.clientY-r.top)*(h/r.height) }
    const ml = () => { mouse.x=null; mouse.y=null }
    window.addEventListener('resize',resize); container.addEventListener('mousemove',mm); container.addEventListener('mouseleave',ml); resize(); animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize); container.removeEventListener('mousemove',mm); container.removeEventListener('mouseleave',ml) }
  }, [])
}
