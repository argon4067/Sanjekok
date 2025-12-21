function openModal(imgUrl) {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");

    modalImg.src = imgUrl; 
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("imgModal").style.display = "none";
}
