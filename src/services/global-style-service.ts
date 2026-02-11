export class GlobalStyleService {

  static ensureStyles(styleId: string, styles: string) {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ${styles}
    `;
      
    document.head.appendChild(style);
  }
}
