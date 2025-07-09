document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;

    if (scrollTop + windowHeight >= docHeight - 10) {
      console.log("Has llegado al final de los términos y condiciones.");
      alert("¡Gracias por leer nuestros términos y condiciones!");
    }
  });
});
