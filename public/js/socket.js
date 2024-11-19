// Connect to the Socket.IO server
const socket = io();

// Listen for the 'orderStatusChanged' event from the backend
socket.on('orderStatusChanged', (data) => {
    const { orderId, status } = data;

    // Find the order on the page by its order ID and update its status
    const orderElement = document.querySelector(`#order-${orderId}`);
    if (orderElement) {
        const statusElement = orderElement.querySelector('.order-status');
        if (statusElement) {
            statusElement.innerText = status; // Update the status in the DOM
        }
    }
});
