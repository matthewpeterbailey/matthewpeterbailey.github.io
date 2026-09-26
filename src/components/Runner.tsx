import { useEffect, useRef } from 'react';

const ridge: [number, number][] = [
  [0, .73], [.10, .78], [.15, .757], [.22, .79], [.29, .838],
  [.35, .85], [.42, .84], [.48, .861], [.54, .89], [.61, .88],
  [.67, .909], [.75, .905], [.82, .907], [.89, .89], [1, .938],
];

const clamp = (number: number) => Math.max(0, Math.min(1, number));

function ridgeY(position: number): number {
  const x = clamp(position);
  for (let index = 1; index < ridge.length; index++) {
    if (x <= ridge[index][0]) {
      const start = ridge[index - 1];
      const end = ridge[index];
      const previous = ridge[Math.max(0, index - 2)];
      const next = ridge[Math.min(ridge.length - 1, index + 1)];
      const t = (x - start[0]) / (end[0] - start[0]);
      const distance = end[0] - start[0];
      const startSlope = (end[1] - previous[1]) / (end[0] - previous[0]);
      const endSlope = (next[1] - start[1]) / (next[0] - start[0]);

      return (2 * t ** 3 - 3 * t ** 2 + 1) * start[1]
        + (t ** 3 - 2 * t ** 2 + t) * startSlope * distance
        + (-2 * t ** 3 + 3 * t ** 2) * end[1]
        + (t ** 3 - t ** 2) * endSlope * distance;
    }
  }
  return ridge.at(-1)?.[1] ?? 1;
}

export default function Runner() {
  const runnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runner = runnerRef.current;
    const journey = document.querySelector<HTMLElement>('.journey');
    const scene = document.querySelector<HTMLElement>('.scene');
    const copy = document.querySelector<HTMLElement>('.hero-copy');
    if (!runner || !journey || !scene || !copy) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let queued = false;
    let lastProgress = 0;
    let direction = 1;

    const render = () => {
      queued = false;
      if (reducedMotion.matches) {
        runner.style.opacity = '0';
        copy.style.opacity = '1';
        copy.style.transform = 'none';
        return;
      }

      const journeyBounds = journey.getBoundingClientRect();
      const sceneBounds = scene.getBoundingClientRect();
      const travel = journey.offsetHeight - scene.offsetHeight;
      const progress = clamp(-journeyBounds.top / travel);
      if (Math.abs(progress - lastProgress) > .001) direction = progress > lastProgress ? 1 : -1;
      lastProgress = progress;

      const scale = Math.max(sceneBounds.width / 1536, sceneBounds.height / 1024);
      const imageWidth = 1536 * scale;
      const imageHeight = 1024 * scale;
      const imageX = (sceneBounds.width - imageWidth) / 2;
      const imageY = sceneBounds.height - imageHeight;
      const startX = -runner.offsetWidth / 2 - 2;
      const endX = sceneBounds.width + runner.offsetWidth / 2 + 2;
      const x = startX + (endX - startX) * progress;
      const y = sceneBounds.top + imageY + ridgeY((x - imageX) / imageWidth) * imageHeight + 1;
      const visible = journeyBounds.top <= 50 && x + runner.offsetWidth / 2 > 0 && x - runner.offsetWidth / 2 < sceneBounds.width;
      const stride = Math.floor((x - startX) / Math.max(18, sceneBounds.width * .015)) % 6;
      const frame = direction > 0 ? stride : (6 - stride) % 6;

      runner.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-100%) scaleX(${direction})`;
      runner.style.backgroundPosition = `${frame * 20}% 50%`;
      runner.style.opacity = visible ? '1' : '0';
      copy.style.opacity = String(1 - clamp(progress * 1.8));
      copy.style.transform = `translateY(${-progress * 65}px)`;
    };

    const schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(render);
      }
    };

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    render();

    return () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
    };
  }, []);

  return <div ref={runnerRef} className="runner" aria-hidden="true" />;
}
