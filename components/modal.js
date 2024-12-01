function handleCodeBlockClick(preElement) {
    const modal = document.querySelector("dialog");
    const modalContent = modal.children[0];
    modalContent.innerHTML = preElement.innerHTML;
    modal.showModal();

    const closeModal = () => {
        modal.close();
        modalContent.innerHTML = "";
    };
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

}

const modal = document.createElement('dialog');
const modalContent = document.createElement('pre');
modal.appendChild(modalContent);
document.body.appendChild(modal);

addEventListener('zero-md-rendered', (e) => {
    const shadowHost = document.querySelector('zero-md'); 
    const shadowRoot = shadowHost.shadowRoot;
    const shadowCode = shadowRoot.querySelectorAll('code');
    shadowCode.forEach(codeBlock => {
        codeBlock.addEventListener("click", (ev) => {
            const preElement = ev.target.closest('pre');
            if (preElement) {
                console.log(preElement);
                handleCodeBlockClick(preElement);
            } else {
                console.log('No parent <pre> element found.');
            }
        });

    });

})