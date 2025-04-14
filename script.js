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

document.getElementById("copiar").addEventListener("click", async () => {
  const urlInput = document.getElementById("url");
  urlInput.select();

  try {
    await navigator.clipboard.writeText(urlInput.value);
    mostrarMensaje("¡Enlace copiado al portapeles!", "success");
  } catch (error) {
    // Fallback para navegadores antiguos
    document.execCommand("copy");
    mostrarMensaje("Copiado (método antiguo).", "success");
  }
});


const translations = {
  es: {
    // Meta tags
    title: "TempURL - Enlaces autodestructivos seguros",
    description: "Crea enlaces temporales que se autodestruyen después de un solo uso. Comparte información sensible de forma privada.",
    
    // Interfaz
    header: "Crea un enlace temporal",
    placeholder: "Escribe tu mensaje secreto...",
    generateBtn: "Generar Enlace",
    timeLabel: "Tiempo de vida:",
    timeOptions: {
      "1": "1 minuto",
      "5": "5 minutos",
      "10": "10 minutos",
      "30": "30 minutos",
      "60": "1 hora"
    },
    resultText: "¡Listo! Copia este enlace:",
    copyBtn: "Copiar",
    donationText: "¿Te gusta TempURL? ¡Apoya el proyecto!",
    
    // Mensajes
    successGenerate: "Enlace generado con éxito.",
    errorEmpty: "Por favor, escribe un mensaje.",
    copied: "¡Enlace copiado!",
    expired: "⚠️ Este enlace ha expirado."
  },
  en: {
    title: "TempURL - Secure Self-Destructing Links",
    description: "Create temporary links that disappear after one use. Share sensitive information privately.",
    header: "Create a temporary link",
    placeholder: "Type your secret message...",
    generateBtn: "Generate Link",
    timeLabel: "Lifetime:",
    timeOptions: {
      "1": "1 minute",
      "5": "5 minutes",
      "10": "10 minutes",
      "30": "30 minutes",
      "60": "1 hour"
    },
    resultText: "Done! Copy this link:",
    copyBtn: "Copy",
    donationText: "Like TempURL? Support the project!",
    successGenerate: "Link generated successfully.",
    errorEmpty: "Please enter a message.",
    copied: "Link copied!",
    expired: "⚠️ This link has expired."
  },
  fr: {
    title: "TempURL - Liens autodestructeurs sécurisés",
    description: "Créez des liens temporaires qui disparaissent après utilisation. Partagez des informations sensibles en privé.",
    header: "Créer un lien temporaire",
    placeholder: "Écrivez votre message secret...",
    generateBtn: "Générer le Lien",
    timeLabel: "Durée de vie:",
    timeOptions: {
      "1": "1 minute",
      "5": "5 minutes",
      "10": "10 minutes",
      "30": "30 minutes",
      "60": "1 heure"
    },
    resultText: "Terminé ! Copiez ce lien :",
    copyBtn: "Copier",
    donationText: "Vous aimez TempURL ? Soutenez le projet !",
    successGenerate: "Lien généré avec succès.",
    errorEmpty: "Veuillez écrire un message.",
    copied: "Lien copié !",
    expired: "⚠️ Ce lien a expiré."
  }
};


// Cargar idioma guardado o usar el del navegador
let currentLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en';

// Selector de idioma en HTML
document.getElementById('language-select').addEventListener('change', (e) => {
  currentLang = e.target.value;
  localStorage.setItem('lang', currentLang);
  updateLanguage();
});

document.addEventListener('DOMContentLoaded', () => {
  // Configurar el selector
  document.getElementById('language-select').value = currentLang;
  updateLanguage();
});

// Actualizar la interfaz
function updateLanguage() {
  const lang = currentLang in translations ? currentLang : 'en';
  const t = translations[lang];

  // Actualizar meta tags (SEO)
  document.title = t.title;
  document.querySelector('meta[name="description"]').setAttribute('content', t.description);
  document.querySelector('meta[property="og:title"]').setAttribute('content', t.title);
  document.querySelector('meta[property="og:description"]').setAttribute('content', t.description);

  // Actualizar interfaz
  document.getElementById('texto').placeholder = t.placeholder;
  document.getElementById('generar').textContent = t.generateBtn;
  document.querySelector('label[for="tiempo"]').textContent = t.timeLabel;
  document.getElementById('copiar').textContent = t.copyBtn;
  document.getElementById('description').textContent = t.description;
  document.getElementById('resultText').textContent = t.resultText;
  document.getElementById('donationText').textContent = t.donationText;
  

  // Actualizar opciones de tiempo
  const selectTiempo = document.getElementById('tiempo');
  Array.from(selectTiempo.options).forEach(option => {
    option.textContent = t.timeOptions[option.value];
  });

  // Actualizar textos dinámicos (ej. mensajes de error)
  window.messages = {
    successGenerate: t.successGenerate,
    errorEmpty: t.errorEmpty,
    copied: t.copied,
    expired: t.expired
  };

  // Actualizar dirección del texto (para árabe/hebreo)
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

