document.addEventListener("DOMContentLoaded", () => {
  const texto = document.getElementById("texto");
  const generarBtn = document.getElementById("generar");
  const resultadoDiv = document.getElementById("resultado");
  const urlInput = document.getElementById("url");
  const copiarBtn = document.getElementById("copiar");
  const mensajeDiv = document.getElementById("mensaje");

  // Reemplaza la función que genera el URL con esta versión:
  generarBtn.addEventListener("click", async () => {
    if (!texto.value.trim()) {
      mostrarMensaje("Por favor, escribe un mensaje.", "error");
      return;
    }

    const minutos = parseInt(document.getElementById("tiempo").value) || 5; // Default: 5 min
    const tiempoMs = minutos * 60 * 1000; // Convertir a milisegundos

    try {
      const clave = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Añadir timestamp de expiración al mensaje
      const expiracion = Date.now() + tiempoMs;
      const mensajeConTiempo = `${texto.value}|${expiracion}`;

      const textoCodificado = new TextEncoder().encode(mensajeConTiempo);
      const cifrado = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        await crypto.subtle.importKey(
          "raw",
          clave,
          { name: "AES-GCM" },
          false,
          ["encrypt"]
        ),
        textoCodificado
      );

      const claveB64 = btoa(String.fromCharCode(...clave));
      const ivB64 = btoa(String.fromCharCode(...iv));
      const cifradoB64 = btoa(String.fromCharCode(...new Uint8Array(cifrado)));

      const url = `${window.location.origin}${window.location.pathname}#${claveB64}:${ivB64}:${cifradoB64}`;
      urlInput.value = url;
      resultadoDiv.classList.remove("hidden");
      mostrarMensaje(`Enlace generado (expira en ${minutos} min).`, "success");
    } catch (error) {
      mostrarMensaje("Error al generar el enlace.", "error");
      console.error(error);
    }
  });

  // Modifica la parte del descifrado para validar el tiempo:
  if (window.location.hash) {
    (async () => {
      try {
        const [claveB64, ivB64, cifradoB64] = window.location.hash
          .substring(1)
          .split(":");

        const clave = new Uint8Array(
          [...atob(claveB64)].map((c) => c.charCodeAt(0))
        );
        const iv = new Uint8Array([...atob(ivB64)].map((c) => c.charCodeAt(0)));
        const cifrado = new Uint8Array(
          [...atob(cifradoB64)].map((c) => c.charCodeAt(0))
        );

        const descifrado = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          await crypto.subtle.importKey(
            "raw",
            clave,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
          ),
          cifrado
        );

        const [mensaje, expiracion] = new TextDecoder()
          .decode(descifrado)
          .split("|");

        if (Date.now() > parseInt(expiracion)) {
          mostrarMensaje("⚠️ Este enlace ha expirado.", "error");
        } else {
          mostrarMensaje(`Mensaje: ${mensaje}`, "success");
        }

        history.replaceState(null, null, " ");
      } catch (error) {
        mostrarMensaje("Enlace inválido o ya usado.", "error");
      }
    })();
  }

  function mostrarMensaje(texto, tipo) {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo;
    mensajeDiv.classList.remove("hidden");
    setTimeout(() => mensajeDiv.classList.add("hidden"), 5000);
  }
});

document.getElementById('copiar').addEventListener('click', async () => {
  const urlInput = document.getElementById('url');
  urlInput.select();
  
  try {
    await navigator.clipboard.writeText(urlInput.value);
    mostrarMensaje('¡Enlace copiado al portapeles!', 'success');
  } catch (error) {
    // Fallback para navegadores antiguos
    document.execCommand('copy');
    mostrarMensaje('Copiado (método antiguo).', 'success');
  }
});

// Donaciones - Lógica
document.getElementById("mostrar-cripto").addEventListener("click", () => {
  document.getElementById("cripto-popup").classList.toggle("hidden");
});

document.getElementById("copiar-wallet").addEventListener("click", () => {
  const wallet = document.getElementById("wallet-address");
  wallet.select();
  document.execCommand("copy");
  mostrarMensaje("¡Dirección copiada!", "success");
});

// Donación personalizada (simulación)
document.getElementById("donar-custom").addEventListener("click", () => {
  const monto = document.getElementById("monto").value;
  if (!monto || monto < 1) {
    mostrarMensaje("Ingresa un monto válido.", "error");
    return;
  }

  // Simular redirección a PayPal con monto personalizado
  const paypalUrl = `https://paypal.me/tuusuario/${monto}USD`;
  mostrarMensaje(`Redirigiendo a PayPal para donar $${monto}...`, "success");

  // Abrir en nueva pestaña después de 2 segundos (para UX)
  setTimeout(() => {
    window.open(paypalUrl, "_blank");
  }, 2000);
});
