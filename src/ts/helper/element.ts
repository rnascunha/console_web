export function roll_to_bottom(el: HTMLElement): void {
  el.scrollTo(0, el.scrollHeight);
}

export function is_at_bottom(el: HTMLElement): boolean {
  return el.scrollTop - (el.scrollHeight - el.offsetHeight) >= -1;
}

export function roll_to_top(el: HTMLElement): void {
  el.scrollTo(0, 0);
}

export function is_at_top(el: HTMLElement): boolean {
  return el.scrollTop === 0;
}
