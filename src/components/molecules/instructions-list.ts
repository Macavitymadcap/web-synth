export class InstructionList extends HTMLElement {
  connectedCallback() {
    // Wait for children to be available
    requestAnimationFrame(() => {
      const items = Array.from(this.querySelectorAll('instruction-item'));
      
      if (items.length === 0) return;
      
      const ul = document.createElement('ul');
      
      items.forEach(item => {
        const label = item.getAttribute('label') || '';
        const text = item.textContent || '';
        
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(text));
        
        ul.appendChild(li);
      });
      
      // Clear and append
      this.innerHTML = '';
      this.appendChild(ul);
    });
  }
}

customElements.define('instruction-list', InstructionList);
customElements.define('instruction-item', class extends HTMLElement {});