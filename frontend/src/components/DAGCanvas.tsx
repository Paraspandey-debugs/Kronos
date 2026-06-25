import React, { useEffect, useRef } from 'react';

export const DAGCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let nodes: any[] = [];
    let edges: any[] = [];
    let time = 0;
    let animationFrameId: number;

    const numNodes = 70;
    const xSpread = 700;
    const maxRadius = 250;

    const resize = () => {
      if (!canvas.parentElement) return;
      width = window.innerWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const init = () => {
      resize();
      window.addEventListener('resize', resize);
      nodes = [];
      edges = [];

      // Anchors
      nodes.push({ id: 0, x: -xSpread / 2, y: 0, z: 0, isAnchor: true });
      nodes.push({ id: 1, x: xSpread / 2, y: 0, z: 0, isAnchor: true });

      // Intermediate Nodes
      for (let i = 0; i < numNodes; i++) {
        // Distribute along x-axis from -xSpread/2 to xSpread/2, concentrated in the middle
        const xPos = (Math.random() - 0.5) * xSpread * 0.8; 
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;
        
        // Random offsets for "4D" movement
        const offsetX = Math.random() * 100;
        const offsetY = Math.random() * 100;
        const offsetZ = Math.random() * 100;
        const speed = 0.3 + Math.random() * 1.2;

        nodes.push({
          id: i + 2,
          baseX: xPos,
          baseY: Math.cos(angle) * radius,
          baseZ: Math.sin(angle) * radius,
          offsetX, offsetY, offsetZ, speed,
          isAnchor: false
        });
      }

      // Sort by base X for logical left-to-right DAG flow
      const intermediateNodes = nodes.slice(2).sort((a, b) => a.baseX - b.baseX);
      
      // Connect Left Anchor to first 8 nodes
      for (let i = 0; i < 8; i++) {
        edges.push([0, intermediateNodes[i].id]);
      }

      // Interconnect nodes
      for (let i = 0; i < intermediateNodes.length - 1; i++) {
        const current = intermediateNodes[i];
        let connections = 0;
        const maxConnections = Math.floor(Math.random() * 3) + 2;

        for (let j = i + 1; j < intermediateNodes.length && connections < maxConnections; j++) {
          const target = intermediateNodes[j];
          // Connect to nodes that are further along X but not too far
          if (target.baseX > current.baseX && target.baseX - current.baseX < xSpread * 0.4) {
            edges.push([current.id, target.id]);
            connections++;
          }
        }
      }

      // Connect last 8 nodes to Right Anchor
      for (let i = intermediateNodes.length - 8; i < intermediateNodes.length; i++) {
        edges.push([intermediateNodes[i].id, 1]);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      const cx = width * 0.7; // Shift right side
      const cy = height * 0.5;

      // Update positions for 4D effect and rotation
      const projected = nodes.map(node => {
        if (node.isAnchor) {
          return { id: node.id, x: node.x, y: node.y, z: node.z, isAnchor: true };
        }
        
        // 4D floating effect
        const dx = Math.sin(time * node.speed + node.offsetX) * 40;
        const dy = Math.cos(time * node.speed + node.offsetY) * 40;
        const dz = Math.sin(time * node.speed + node.offsetZ) * 40;

        const currentX = node.baseX + dx;
        const currentY = node.baseY + dy;
        const currentZ = node.baseZ + dz;

        // Overall rotation around X axis for cylinder roll
        const ry = currentY * Math.cos(time * 0.3) - currentZ * Math.sin(time * 0.3);
        const rz = currentY * Math.sin(time * 0.3) + currentZ * Math.cos(time * 0.3);

        // Slow rotation around Y axis to give that 3D depth feeling
        const tiltAngle = Math.sin(time * 0.1) * 0.3;
        const rx = currentX * Math.cos(tiltAngle) + rz * Math.sin(tiltAngle);
        const finalZ = -currentX * Math.sin(tiltAngle) + rz * Math.cos(tiltAngle);

        return { id: node.id, x: rx, y: ry, z: finalZ, isAnchor: false };
      });

      // Quick lookup map
      const nodeMap = new Map();
      projected.forEach(p => nodeMap.set(p.id, p));

      // Draw Edges
      ctx.lineWidth = 1.2;
      edges.forEach(edge => {
        const p1 = nodeMap.get(edge[0]);
        const p2 = nodeMap.get(edge[1]);

        if (!p1 || !p2) return;

        const zAvg = (p1.z + p2.z) / 2;
        // Z range is roughly -maxRadius to +maxRadius
        const normalizedZ = (zAvg + maxRadius) / (maxRadius * 2); 
        const alpha = Math.max(0.05, Math.min(0.6, 0.1 + normalizedZ * 0.6));

        const grad = ctx.createLinearGradient(p1.x + cx, p1.y + cy, p2.x + cx, p2.y + cy);
        
        // Kronos brand colors: Cyan to Purple
        grad.addColorStop(0, `rgba(0, 245, 212, ${alpha})`); 
        grad.addColorStop(1, `rgba(157, 78, 221, ${alpha})`);

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x + cx, p1.y + cy);
        
        // Organic curve
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const curveOffset = Math.sin(time * 2 + p1.id) * 20;
        
        ctx.quadraticCurveTo(
          midX + cx, 
          midY + cy + curveOffset, 
          p2.x + cx, 
          p2.y + cy
        );
        ctx.stroke();
      });

      // Draw Nodes
      projected.forEach(p => {
        const normalizedZ = (p.z + maxRadius) / (maxRadius * 2);
        
        const scale = p.isAnchor ? 6 : Math.max(0.5, 1.5 + normalizedZ * 3);
        const alpha = p.isAnchor ? 1 : Math.max(0.1, 0.2 + normalizedZ * 0.8);

        ctx.fillStyle = p.isAnchor ? '#ffffff' : `rgba(200, 200, 220, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x + cx, p.y + cy, scale, 0, Math.PI * 2);
        
        if (p.isAnchor) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#00f5d4'; // Cyan glow for anchors
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    init();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="dag-canvas" ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}></canvas>;
};
