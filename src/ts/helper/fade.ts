export async function fade_out<T>(el: T, pace: number = 0.005): Promise<T> {
  if (!(el instanceof HTMLElement)) throw new Error('Wrong type');
  return await new Promise(function (resolve) {
    el.style.opacity = '1';

    (function fade() {
      const opacity = parseFloat(el.style.opacity) - pace;
      el.style.opacity = `${opacity}`;
      if (opacity <= 0) {
        resolve(el);
      } else {
        requestAnimationFrame(fade);
      }
    })();
  });
}
