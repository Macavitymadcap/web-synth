export class InstructionList extends HTMLElement {
  connectedCallback() {
    const items = Array.from(this.querySelectorAll('instruction-item'));
    
    let html = '<ul>';
    items.forEach(item => {
      const label = item.getAttribute('label') || '';
      const text = item.textContent || '';
      html += `<li><strong>${label}:</strong> ${text}</li>`;
    });
    html += '</ul>';
    
    this.innerHTML = html;
  }
}

customElements.define('instruction-list', InstructionList);
customElements.define('instruction-item', class extends HTMLElement {});