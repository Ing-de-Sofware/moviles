document.addEventListener("DOMContentLoaded", () => {
    const missionButton = document.getElementById("btnMision");
    const visionButton = document.getElementById("btnVision");

    // Scroll smoothly to the Mission section
    missionButton.addEventListener("click", () => {
        document.getElementById("Mision").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Scroll smoothly to the Vision section
    visionButton.addEventListener("click", () => {
        document.getElementById("Vision").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
