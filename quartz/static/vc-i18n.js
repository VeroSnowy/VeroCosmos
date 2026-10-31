/* Vero Cosmos: idiomas (es por defecto, en, fr)
   Para traducir: en DICT.en y DICT.fr, la clave es el texto EXACTO en español y el valor es la traduccion.
   Lo que no tenga traduccion se queda en español. */
(function(){
const DICT={
  en:{
    /* PAGINA PRINCIPAL */
    "De donde confluye el sueño de las estrellas fugaces...":"From the place where the dream of shooting stars converge...",
    "Herramientas destacadas":"Featured Tools",
    "Atlas Astrofotográfico":"Astrophotographic Atlas",
    "Descubrir el universo por catálogos.":"Discovering the universe through catalogs.",
    "Guía Astronómica":"Astronomical Guide",
    "Para aquellos que empiezan desde cero.":"For those starting from scratch.",
    "Contacto":"Contact",
    "¡Dona! :)":"Donate! :)",
    "Creado con":"Built with",
    "Principal":"Home",
    "Atlas":"Atlas",
    "Abrir Atlas Astrofotográfico":"Open Astrophotographic Atlas",
    "Abrir Guía Astronómica":"Open Astronomical Guide",
    "Página principal":"Home page",
    "Abrir menú de páginas":"Open page menu",
    "Cerrar menú de páginas":"Close page menu",
    "Páginas del atlas":"Atlas pages",
    /* ATLAS */
    "Atlas Fotográfico":"Photographic Atlas",
    "Ver todo el atlas":"View full atlas",
    "Vista por grupos":"Group view",
    "Buscar objetos o grupos…":"Search objects or groups…",
    "Bóveda celeste 3D · Arrastra con el ratón para girar · Rueda para acercar o alejar · Clic en un objeto para abrir su ficha.":"3D Celestial Sphere · Drag to rotate · Scroll to zoom · Click on an object to open its profile.",
    "Ver ficha completa →":"View full profile →",
    "Buscar objetos o grupos":"Search objects or groups",
    "Restablecer orientación y zoom":"Reset orientation and zoom",
    "Volver a la posición original":"Reset position",
    /* ATLAS 2b */
    "Catálogos":"Catalogs",
    "Telescopios":"Telescopes",
    "Catálogo Messier":"Messier Catalog",
    "Catálogo NGC":"NGC Catalog",
    "Catálogo Sistema Solar":"Solar System Catalog",
    "Luna":"Moon",
    "Saturno":"Saturn",
    "Sol":"Sun",
    "M2 - Cúmulo Globular":"M2 - Globular Cluster",
    "M42 - Nebulosa de Orión":"M42 - Orion Nebula",
    "NGC 2024 - Nebulosa de la Flama":"NGC 2024 - Flame Nebula",
    "NGC 253 - Galaxia Moneda de Plata":"NGC 253 - Silver Coin Galaxy",
    "Clic para abrir la ficha":"Click to open profile",
    "Clic para ver su grupo":"Click to view group",
    "Cargando...":"Loading…",
    "No hay coincidencias.":"No matches found.",
    "No hay coincidencias en este grupo.":"No matches in this group.",
    "Arrastra con el ratón para girar cualquier vista en 3D · Rueda para acercar o alejar · Clic en un grupo para explorarlo o en un objeto para abrir su ficha. Usa el botón de objetivo para recentrar.":"Drag with the mouse to rotate any 3D view · Scroll to zoom · Click on a group to explore it or on an object to open its profile. Use the target button to recenter.",
    /* GUIA ASTRONOMICA */
    "Guía de Observación":"Observation Guide",
    "Uso de telescopios":"Telescope Usage",
    "Lugar para observar":"Observing Site",
    "Posprocesado de imágenes":"Image Post-Processing",
    "Próximamente":"Coming Soon",
    "Objetos astronómicos":"Astronomical Objects",
    "Sistema Solar":"Solar System",
    "← Sistema Solar":"← Solar System",
    "Otros":"Others",
    "Objeto":"Object",
    "Grupo":"Group",
    "Mercurio":"Mercury",
    "Venus":"Venus",
    "Tierra":"Earth",
    "Marte":"Mars",
    "Júpiter":"Jupiter",
    "Urano":"Uranus",
    "Neptuno":"Neptune",
    "Plutón":"Pluto",
    "La Tierra y la Luna":"Earth and Moon",
    "Posiciones actuales de los planetas del Sistema Solar":"Current Solar System Planet Positions",
    "Volver a centrar":"Recenter",
    "Acercar":"Zoom in",
    "Alejar":"Zoom out",
    "Vista de lista":"List View",
    "Lista":"List",
    "Vista de tarjetas":"Card View",
    "Tarjetas con foto":"Photo Cards",
    "Buscar objetos":"Search objects",
    "Buscar objetos…":"Search objects…",
    /* QUIENES SOMOS */
    "← Volver":"← Back",
    "¿Quiénes somos?":"Who Are We?",
    "Filosofía de Vero Cosmos":"Vero Cosmos' Philosophy",
    "Vero Cosmos concibe la astronomía como una disciplina científica a democratizar debido a su gran interés físico y filosófico. Creemos que la astronomía puede aportar semillas de curiosidad que nos lleven a responder las grandes preguntas del universo.":"Vero Cosmos conceives astronomy as a scientific discipline to be democratized due to its great physical and philosophical interest. We believe that astronomy can plant seeds of curiosity that lead us to answer the great questions of the universe.",
    "Objetivos de Vero Cosmos":"Vero Cosmos' Objectives",
    "Nuestro objetivo principal es ayudar a difundir lo máximo posible la ciencia de la astronomía amateur y científica. Para ello, tenemos programadas diversas actualizaciones centradas en el ámbito divulgativo, social y recreativo entre aficionados del espacio.":"Our main goal is to help spread amateur and scientific astronomy as widely as possible. To this end, we have scheduled various updates focused on educational, social, and recreational outreach among space enthusiasts.",
    "Futuro de Vero Cosmos":"The Future of Vero Cosmos",
    "El futuro, como el propio cosmos, es incierto. Tenemos un programa variable donde queremos incluir nuevas características:":"The future, like the cosmos itself, is uncertain. We have a flexible roadmap where we want to include new features:",
    "Divulgativas:":"Educational:",
    "aumentar la diversidad de objetos fotografiados, extender los recursos sobre uso de telescopios y profundizar en conceptos de posprocesado de imágenes.":"increase the diversity of photographed objects, expand resources on telescope usage, and dive deeper into image post-processing concepts.",
    "Sociales:":"Social:",
    "creación de cuentas personales, publicaciones e interacción entre usuarios.":"creation of personal accounts, posts, and user interaction.",
    "Informativas:":"Informational:",
    "nuevas coordenadas de los cuerpos celestes en el cielo nocturno, mejores lugares para observar las estrellas, eventos astronómicos tales como las lluvias de estrellas, etc.":"new coordinates for celestial bodies in the night sky, best stargazing locations, astronomical events such as meteor showers, etc.",
    "Bajar":"Scroll down",
    "Subir":"Scroll up",
    "Volver arriba":"Back to top",
    "Posición actual de la Luna · rotación y órbita aceleradas · tamaños y distancias no están a escala":"Current Moon position · accelerated rotation and orbit · sizes and distances are not to scale",
    /* ATLAS: PANEL DE FICHA */
    "Ver Atlas Completo":"View Full Atlas",
    "Vista de grupo 3D · Arrastra con el ratón para girar · Rueda para acercar o alejar · Clic en un objeto para abrir su ficha o en otro grupo para explorarlo.":"3D group view · Drag with the mouse to rotate · Scroll to zoom · Click an object to open its profile or another group to explore it.",
    "Cerrar":"Close",
    "Información":"Information",
    "Resumen del objeto":"Object summary",
    /* DESCRIPCIONES CORTAS DE LAS FICHAS */
    "La Luna (del latín “Luna”, y este de la raíz protoindoeuropea “leuksna”) es el único satélite natural de la Tierra. Esta se encuentra a unos 384.400 km de distancia de nuestro planeta y presenta un diámetro de 3474,8 km, 1/4 del de la Tierra. No obstante, su masa es apenas 1/81 comparada con el planeta azul. Esta sufre una fuerza de marea debido a su cercanía terrestre que provoca que siempre veamos la misma cara del satélite, manteniendo la otra oculta durante todo el año. Son destacables los gigantes mares lunares de origen volcánico, así como los diversos cráteres provocados por millones de años de impactos de asteroides.":"The Moon (from the Latin “Luna”, and this from the Proto-Indo-European root “leuksna”) is Earth's only natural satellite. It is located about 384,400 km away from our planet and has a diameter of 3,474.8 km, 1/4 that of Earth. However, its mass is barely 1/81 compared to the blue planet. Due to Earth's proximity, it experiences a tidal force that causes us to always see the same side of the satellite, keeping the other hidden throughout the year. Notable features include the giant volcanic lunar maria, as well as the various craters caused by millions of years of asteroid impacts.",
    "El Cúmulo Globular M2 (también referenciado como Messier 2 o M2) es uno de los cúmulos globulares más brillantes de la Vía Láctea. Este se encuentra en la constelación de Acuario a una distancia de 37.500 años luz de la Tierra. El cúmulo ostenta unos 175 años luz de diámetro y acumula un total de 175.000 estrellas, aunque su gravedad consigue atrapar estrellas que pueden barrer unos 233 años luz de distancia desde su centro. Es uno de los objetos más brillantes del cielo siendo posible verse a simple vista en condiciones de visibilidad extremadamente buenas.":"Globular Cluster M2 (also referred to as Messier 2 or M2) is one of the brightest globular clusters in the Milky Way. It is located in the constellation Aquarius at a distance of 37,500 light-years from Earth. The cluster has a diameter of about 175 light-years and accumulates a total of 175,000 stars, although its gravity manages to trap stars that can span some 233 light-years from its center. It is one of the brightest objects in the sky, making it visible to the naked eye under extremely good visibility conditions.",
    "La Nebulosa de Orión, también referenciada como Messier 42, M42 o NGC 1976, es una nebulosa difusa ubicada al sur del cinturón de Orión. Es uno de los objetos más grandes y luminosos de nuestro cosmos observable. Es tal que es de los pocos objetos capaces de verse a simple vista en lugares con poca contaminación lumínica. Esta está situada a 1270 ± 76 años luz de la Tierra y ostenta un diámetro de aproximadamente 24 años luz.":"The Orion Nebula, also referred to as Messier 42, M42, or NGC 1976, is a diffuse nebula located south of Orion's Belt. It is one of the largest and most luminous objects in our observable cosmos. Indeed, it is one of the few objects visible to the naked eye in locations with low light pollution. It is situated 1,270 ± 76 light-years from Earth and has a diameter of approximately 24 light-years.",
    "La Nebulosa de la Flama (o Nebulosa de la Llama), también referenciada como NGC 2024, se trata de una región de emisión ubicada en el extremo más oriental del cinturón de Orión junto a la estrella Alnitak. Su efecto de fuego se debe a su luminosidad de colores rojizos, pero a la vez esta dificulta su visibilidad debido a su baja frecuencia. La mayor parte de este color es fruto de la ionización que Alnitak produce en los átomos de hidrógeno de la nebulosa haciendo que se ionicen, pierdan y vuelvan a ganar electrones produciendo emisión de luz roja en el proceso.":"The Flame Nebula, also referred to as NGC 2024, is an emission region located at the easternmost edge of Orion's Belt next to the star Alnitak. Its fiery effect is due to its reddish luminosity, which at the same time makes visibility difficult due to its low frequency. Most of this color is the result of ionization produced by Alnitak on the hydrogen atoms of the nebula, causing them to ionize, lose, and regain electrons, producing red light emission in the process.",
    "La Galaxia Moneda de Plata (o Galaxia del Escultor), también referenciada como NGC 253, es una galaxia espiral situada en la constelación del Escultor. Su distancia a la Tierra es de aproximadamente 12,9 millones de años luz convirtiéndose en una de las galaxias brillantes más cercanas a la Vía Láctea fuera del Grupo Local. Su posición en el espacio hace que la veamos casi de canto pudiendo así distinguir su estructura alargada y las impresionantes bandas oscuras de polvo que atraviesan su disco.":"The Silver Coin Galaxy (or Sculptor Galaxy), also referred to as NGC 253, is a spiral galaxy located in the constellation Sculptor. Its distance from Earth is approximately 12.9 million light-years, making it one of the brightest galaxies closest to the Milky Way outside the Local Group. Its position in space causes us to see it almost edge-on, allowing us to distinguish its elongated structure and the impressive dark dust lanes crossing its disk.",
    "Saturno (del latín “Saturnus”, dios romano de la agricultura y la cosecha) es el sexto planeta del sistema solar y el segundo en tamaño y masa después de Júpiter. Es uno de los pocos planetas con anillos (formados a partir de millones de fragmentos de hielo y polvo rocoso) en nuestro sistema, siendo estos los únicos capaces de captarse con un telescopio amateur. Este se encuentra a unos 1.430 millones de kilómetros del Sol y presenta un diámetro de 120.536 km. Es parte de los llamados planetas gaseosos o exteriores formados fundamentalmente de hidrógeno y helio. Por último, es de destacar su extenso vecindario lunar de 283 lunas como por ejemplo Titán o Rea.":"Saturn (from the Latin “Saturnus”, Roman god of agriculture and harvest) is the sixth planet in the solar system and the second in size and mass after Jupiter. It is one of the few ringed planets (formed from millions of fragments of ice and rocky dust) in our system, and these are the only ones capable of being captured with an amateur telescope. It is located about 1,430 million kilometers from the Sun and has a diameter of 120,536 km. It is part of the so-called gas or outer planets formed fundamentally of hydrogen and helium. Finally, its extensive lunar neighborhood of 283 moons, such as Titan or Rhea, is noteworthy.",
    "El Sol (del latín “sol”, “solis”, y este de la raíz protoindoeuropea “sauel”, significando luz), también denominado “astro rey”, es el cuerpo celeste central de nuestro sistema solar. Este es una estrella de tipo G de la secuencia principal y clase de luminosidad V. Representa la mayor parte de la masa (alrededor del 99,86%) y de la energía de todo nuestro sistema planetario. Se trata de una esfera de plasma casi perfecta en cuyo interior se producen las condiciones ideales de presión y temperatura para alcanzar la fusión nuclear que le dota de tal radiación y brillo.":"The Sun (from the Latin “sol”, “solis”, and this from the Proto-Indo-European root “sauel”, meaning light), also called the “king star”, is the central celestial body of our solar system. It is a main-sequence G-type star and luminosity class V. It represents the vast majority of the mass (around 99.86%) and energy of our entire planetary system. It is an almost perfect sphere of plasma inside which ideal conditions of pressure and temperature occur to achieve the nuclear fusion that provides its radiation and brightness."
  },
  fr:{
    /* PAGINA PRINCIPAL */
    "De donde confluye el sueño de las estrellas fugaces...":"Depuis le lieu où le rêve des étoiles filantes converge...",
    "Herramientas destacadas":"Outils Phares",
    "Atlas Astrofotográfico":"Atlas Astrophotographique",
    "Descubrir el universo por catálogos.":"Découvrir l'univers par catalogues.",
    "Guía Astronómica":"Guide Astronomique",
    "Para aquellos que empiezan desde cero.":"Pour ceux qui partent de zéro.",
    "Contacto":"Contact",
    "¡Dona! :)":"Soutenir! :)",
    "Creado con":"Développé avec",
    "Principal":"Accueil",
    "Atlas":"Atlas",
    "Abrir Atlas Astrofotográfico":"Ouvrir l'Atlas Astrophotographique",
    "Abrir Guía Astronómica":"Ouvrir le Guide Astronomique",
    "Página principal":"Page d'accueil",
    "Abrir menú de páginas":"Ouvrir le menu des pages",
    "Cerrar menú de páginas":"Fermer le menu des pages",
    "Páginas del atlas":"Pages de l'atlas",
    /* ATLAS */
    "Atlas Fotográfico":"Atlas photographique",
    "Ver todo el atlas":"Parcourir tout l'atlas",
    "Vista por grupos":"Vue par groupes",
    "Buscar objetos o grupos…":"Rechercher des objets ou des groupes…",
    "Bóveda celeste 3D · Arrastra con el ratón para girar · Rueda para acercar o alejar · Clic en un objeto para abrir su ficha.":"Voûte céleste 3D · Glisser pour pivoter · Molette pour zoomer · Cliquer sur un objet pour ouvrir sa fiche.",
    "Ver ficha completa →":"Voir la fiche complète →",
    "Buscar objetos o grupos":"Rechercher des objets ou des groupes",
    "Restablecer orientación y zoom":"Réinitialiser l'orientation et le zoom",
    "Volver a la posición original":"Remettre à la position initiale",
    /* ATLAS 2b */
    "Catálogos":"Catalogues",
    "Telescopios":"Télescopes",
    "Catálogo Messier":"Catalogue Messier",
    "Catálogo NGC":"Catalogue NGC",
    "Catálogo Sistema Solar":"Catalogue du Système solaire",
    "Luna":"Lune",
    "Saturno":"Saturne",
    "Sol":"Soleil",
    "M2 - Cúmulo Globular":"M2 - Amas globulaire",
    "M42 - Nebulosa de Orión":"M42 - Nébuleuse d'Orion",
    "NGC 2024 - Nebulosa de la Flama":"NGC 2024 - Nébuleuse de la Flamme",
    "NGC 253 - Galaxia Moneda de Plata":"NGC 253 - Galaxie de la Pièce d'argent",
    "Clic para abrir la ficha":"Cliquer pour ouvrir la fiche",
    "Clic para ver su grupo":"Cliquer pour voir le groupe",
    "Cargando...":"Chargement en cours…",
    "No hay coincidencias.":"Aucun résultat trouvé.",
    "No hay coincidencias en este grupo.":"Aucun résultat dans ce groupe.",
    "Arrastra con el ratón para girar cualquier vista en 3D · Rueda para acercar o alejar · Clic en un grupo para explorarlo o en un objeto para abrir su ficha. Usa el botón de objetivo para recentrar.":"Glisser avec la souris pour pivoter n'importe quelle vue 3D · Molette pour zoomer · Cliquer sur un groupe pour l'explorer ou sur un objet pour ouvrir sa fiche. Utiliser le bouton cible pour centrer à nouveau.",
    /* GUIA ASTRONOMICA */
    "Guía de Observación":"Guide d'observation",
    "Uso de telescopios":"Utilisation des télescopes",
    "Lugar para observar":"Lieu d'observation",
    "Posprocesado de imágenes":"Post-traitement d'images",
    "Próximamente":"Prochainement",
    "Objetos astronómicos":"Objets astronomiques",
    "Sistema Solar":"Système solaire",
    "← Sistema Solar":"← Système solaire",
    "Otros":"Autres",
    "Objeto":"Objet",
    "Grupo":"Groupe",
    "Mercurio":"Mercure",
    "Venus":"Vénus",
    "Tierra":"Terre",
    "Marte":"Mars",
    "Júpiter":"Jupiter",
    "Urano":"Uranus",
    "Neptuno":"Neptune",
    "Plutón":"Pluton",
    "La Tierra y la Luna":"La Terre et la Lune",
    "Posiciones actuales de los planetas del Sistema Solar":"Positions actuelles des planètes du Système solaire",
    "Volver a centrar":"Centrer à nouveau",
    "Acercar":"Zoom avant",
    "Alejar":"Zoom arrière",
    "Vista de lista":"Vue en liste",
    "Lista":"Liste",
    "Vista de tarjetas":"Vue en cartes",
    "Tarjetas con foto":"Cartes avec photo",
    "Buscar objetos":"Rechercher des objets",
    "Buscar objetos…":"Rechercher des objets…",
    /* QUIENES SOMOS */
    "← Volver":"← Retour",
    "¿Quiénes somos?":"Qui sommes-nous ?",
    "Filosofía de Vero Cosmos":"Philosophie de Vero Cosmos",
    "Vero Cosmos concibe la astronomía como una disciplina científica a democratizar debido a su gran interés físico y filosófico. Creemos que la astronomía puede aportar semillas de curiosidad que nos lleven a responder las grandes preguntas del universo.":"Vero Cosmos conçoit l'astronomie comme une discipline scientifique à démocratiser en raison de son grand intérêt physique et philosophique. Nous croyons que l'astronomie peut semer des graines de curiosité qui nous poussent à répondre aux grandes questions de l'univers.",
    "Objetivos de Vero Cosmos":"Objectifs de Vero Cosmos",
    "Nuestro objetivo principal es ayudar a difundir lo máximo posible la ciencia de la astronomía amateur y científica. Para ello, tenemos programadas diversas actualizaciones centradas en el ámbito divulgativo, social y recreativo entre aficionados del espacio.":"Notre objectif principal est de contribuer à diffuser le plus largement possible la science de l'astronomie amateur et scientifique. Pour ce faire, nous avons programmé diverses mises à jour axées sur le domaine éducatif, social et récréatif entre passionnés d'espace.",
    "Futuro de Vero Cosmos":"L'avenir de Vero Cosmos",
    "El futuro, como el propio cosmos, es incierto. Tenemos un programa variable donde queremos incluir nuevas características:":"L'avenir, comme le cosmos lui-même, est incertain. Nous avons un programme évolutif dans lequel nous souhaitons inclure de nouvelles fonctionnalités :",
    "Divulgativas:":"Éducatives :",
    "aumentar la diversidad de objetos fotografiados, extender los recursos sobre uso de telescopios y profundizar en conceptos de posprocesado de imágenes.":"augmenter la diversité des objets photographiés, élargir les ressources sur l'utilisation des télescopes et approfondir les concepts de post-traitement d'images.",
    "Sociales:":"Sociales :",
    "creación de cuentas personales, publicaciones e interacción entre usuarios.":"création de comptes personnels, publications et interaction entre utilisateurs.",
    "Informativas:":"D'information :",
    "nuevas coordenadas de los cuerpos celestes en el cielo nocturno, mejores lugares para observar las estrellas, eventos astronómicos tales como las lluvias de estrellas, etc.":"nouvelles coordonnées des corps célestes dans le ciel nocturne, meilleurs sites d'observation des étoiles, événements astronomiques tels que les pluies d'étoiles filantes, etc.",
    "Bajar":"Descendre",
    "Subir":"Monter",
    "Volver arriba":"Retour en haut",
    "Posición actual de la Luna · rotación y órbita aceleradas · tamaños y distancias no están a escala":"Position actuelle de la Lune · rotation et orbite accélérées · tailles et distances non à l'échelle",
    /* ATLAS: PANEL DE FICHA */
    "Ver Atlas Completo":"Voir l'atlas complet",
    "Vista de grupo 3D · Arrastra con el ratón para girar · Rueda para acercar o alejar · Clic en un objeto para abrir su ficha o en otro grupo para explorarlo.":"Vue de groupe 3D · Glisser avec la souris pour pivoter · Molette pour zoomer · Cliquer sur un objet pour ouvrir sa fiche ou sur un autre groupe pour l'explorer.",
    "Cerrar":"Fermer",
    "Información":"Information",
    "Resumen del objeto":"Résumé de l'objet",
    /* DESCRIPCIONES CORTAS DE LAS FICHAS */
    "La Luna (del latín “Luna”, y este de la raíz protoindoeuropea “leuksna”) es el único satélite natural de la Tierra. Esta se encuentra a unos 384.400 km de distancia de nuestro planeta y presenta un diámetro de 3474,8 km, 1/4 del de la Tierra. No obstante, su masa es apenas 1/81 comparada con el planeta azul. Esta sufre una fuerza de marea debido a su cercanía terrestre que provoca que siempre veamos la misma cara del satélite, manteniendo la otra oculta durante todo el año. Son destacables los gigantes mares lunares de origen volcánico, así como los diversos cráteres provocados por millones de años de impactos de asteroides.":"La Lune (du latin « Luna », et celui-ci de la racine proto-indo-européenne « leuksna ») est le seul satellite naturel de la Terre. Elle se trouve à environ 384 400 km de notre planète et présente un diamètre de 3 474,8 km, soit 1/4 de celui de la Terre. Néanmoins, sa masse n'est que de 1/81 par rapport à la planète bleue. En raison de sa proximité avec la Terre, elle subit une force de marée qui fait que nous voyons toujours la même face du satellite, l'autre restant cachée toute l'année. Les mers lunaires géantes d'origine volcanique ainsi que les divers cratères provoqués par des millions d'années d'impacts d'astéroïdes y sont particulièrement remarquables.",
    "El Cúmulo Globular M2 (también referenciado como Messier 2 o M2) es uno de los cúmulos globulares más brillantes de la Vía Láctea. Este se encuentra en la constelación de Acuario a una distancia de 37.500 años luz de la Tierra. El cúmulo ostenta unos 175 años luz de diámetro y acumula un total de 175.000 estrellas, aunque su gravedad consigue atrapar estrellas que pueden barrer unos 233 años luz de distancia desde su centro. Es uno de los objetos más brillantes del cielo siendo posible verse a simple vista en condiciones de visibilidad extremadamente buenas.":"L'amas globulaire M2 (également référencé sous le nom de Messier 2 ou M2) est l'un des amas globulaires les plus brillants de la Voie lactée. Il est situé dans la constellation du Verseau à une distance de 37 500 années-lumière de la Terre. L'amas mesure environ 175 années-lumière de diamètre et rassemble un total de 175 000 étoiles, bien que sa gravité parvienne à capturer des étoiles pouvant s'étendre sur quelque 233 années-lumière depuis son centre. C'est l'un des objets les plus brillants du ciel, observable à l'œil nu dans des conditions de visibilité extrêmement bonnes.",
    "La Nebulosa de Orión, también referenciada como Messier 42, M42 o NGC 1976, es una nebulosa difusa ubicada al sur del cinturón de Orión. Es uno de los objetos más grandes y luminosos de nuestro cosmos observable. Es tal que es de los pocos objetos capaces de verse a simple vista en lugares con poca contaminación lumínica. Esta está situada a 1270 ± 76 años luz de la Tierra y ostenta un diámetro de aproximadamente 24 años luz.":"La nébuleuse d'Orion, également référencée comme Messier 42, M42 ou NGC 1976, est une nébuleuse diffuse située au sud de la ceinture d'Orion. C'est l'un des objets les plus grands et les plus lumineux de notre cosmos observable. À tel point qu'elle fait partie des rares objets visibles à l'œil nu dans des endroits à faible pollution lumineuse. Elle est située à 1 270 ± 76 années-lumière de la Terre et possède un diamètre d'environ 24 années-lumière.",
    "La Nebulosa de la Flama (o Nebulosa de la Llama), también referenciada como NGC 2024, se trata de una región de emisión ubicada en el extremo más oriental del cinturón de Orión junto a la estrella Alnitak. Su efecto de fuego se debe a su luminosidad de colores rojizos, pero a la vez esta dificulta su visibilidad debido a su baja frecuencia. La mayor parte de este color es fruto de la ionización que Alnitak produce en los átomos de hidrógeno de la nebulosa haciendo que se ionicen, pierdan y vuelvan a ganar electrones produciendo emisión de luz roja en el proceso.":"La nébuleuse de la Flamme, également référencée sous le nom de NGC 2024, est une région d'émission située à l'extrême est de la ceinture d'Orion, près de l'étoile Alnitak. Son effet de feu est dû à sa luminosité aux teintes rougeâtres, ce qui rend toutefois sa visibilité difficile en raison de sa basse fréquence. La plus grande partie de cette couleur est le fruit de l'ionisation qu'Alnitak produit sur les atomes d'hydrogène de la nébuleuse, les amenant à s'ioniser, à perdre et à regagner des électrons, produisant ainsi une émission de lumière rouge au cours du processus.",
    "La Galaxia Moneda de Plata (o Galaxia del Escultor), también referenciada como NGC 253, es una galaxia espiral situada en la constelación del Escultor. Su distancia a la Tierra es de aproximadamente 12,9 millones de años luz convirtiéndose en una de las galaxias brillantes más cercanas a la Vía Láctea fuera del Grupo Local. Su posición en el espacio hace que la veamos casi de canto pudiendo así distinguir su estructura alargada y las impresionantes bandas oscuras de polvo que atraviesan su disco.":"La galaxie de la Pièce d'argent (ou galaxie du Sculpteur), également référencée comme NGC 253, est une galaxie spirale située dans la constellation du Sculpteur. Sa distance par rapport à la Terre est d'environ 12,9 millions d'années-lumière, ce qui en fait l'une des galaxies brillantes les plus proches de la Voie lactée en dehors du Groupe local. Sa position dans l'espace fait que nous la voyons presque par la tranche, ce qui permet de distinguer sa structure allongée et les impressionnantes bandes de poussière sombre qui traversent son disque.",
    "Saturno (del latín “Saturnus”, dios romano de la agricultura y la cosecha) es el sexto planeta del sistema solar y el segundo en tamaño y masa después de Júpiter. Es uno de los pocos planetas con anillos (formados a partir de millones de fragmentos de hielo y polvo rocoso) en nuestro sistema, siendo estos los únicos capaces de captarse con un telescopio amateur. Este se encuentra a unos 1.430 millones de kilómetros del Sol y presenta un diámetro de 120.536 km. Es parte de los llamados planetas gaseosos o exteriores formados fundamentalmente de hidrógeno y helio. Por último, es de destacar su extenso vecindario lunar de 283 lunas como por ejemplo Titán o Rea.":"Saturne (du latin « Saturnus », dieu romain de l'agriculture et des moissons) est la sixième planète du système solaire et la deuxième en taille et en masse après Jupiter. C'est l'une des rares planètes dotées d'anneaux (formés de millions de fragments de glace et de poussière rocheuse) de notre système, ceux-ci étant les seuls pouvant être capturés avec un télescope d'amateur. Elle se trouve à environ 1 430 millions de kilomètres du Soleil et présente un diamètre de 120 536 km. Elle fait partie des planètes dites gazeuses ou externes, composées fondamentalement d'hydrogène et d'hélium. Enfin, il convient de souligner son vaste cortège de 283 lunes, telles que Titan ou Rhéa.",
    "El Sol (del latín “sol”, “solis”, y este de la raíz protoindoeuropea “sauel”, significando luz), también denominado “astro rey”, es el cuerpo celeste central de nuestro sistema solar. Este es una estrella de tipo G de la secuencia principal y clase de luminosidad V. Representa la mayor parte de la masa (alrededor del 99,86%) y de la energía de todo nuestro sistema planetario. Se trata de una esfera de plasma casi perfecta en cuyo interior se producen las condiciones ideales de presión y temperatura para alcanzar la fusión nuclear que le dota de tal radiación y brillo.":"Le Soleil (du latin « sol », « solis », et celui-ci de la racine proto-indo-européenne « sauel », signifiant lumière), également appelé « astre du jour », est le corps céleste central de notre système solaire. C'est une étoile de type G de la séquence principale et de classe de luminosité V. Il représente la majeure partie de la masse (environ 99,86 %) et de l'énergie de tout notre système planétaire. Il s'agit d'une sphère de plasma presque parfaite à l'intérieur de laquelle règnent des conditions idéales de pression et de température pour permettre la fusion nucléaire qui lui confère sa radiation et son éclat."
  }
};
const DICTH={
  en:{about:'Vero Cosmos was born as a personal project by <b>Vero Snowy</b>, a student of the Double Degree in Physics and Materials Engineering at the University of Seville, with the aim of teaching, showcasing, and spreading the principles of astrophotography, astronomy, and astrophysics.'},
  fr:{about:"Vero Cosmos est né comme un projet personnel de <b>Vero Snowy</b>, étudiante du double diplôme en physique et en ingénierie des matériaux à l'Université de Séville, dans le but d'enseigner, de présenter et de diffuser les principes de l'astrophotographie, de l'astronomie et de l'astrophysique."}
};
const NAMES={
  es:{es:'Español',en:'Inglés',fr:'Francés'},
  en:{es:'Spanish',en:'English',fr:'French'},
  fr:{es:'Espagnol',en:'Anglais',fr:'Français'}
};
const FLAGS={
  es:'<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#c60b1e"/><rect y=".5" width="3" height="1" fill="#ffc400"/></svg>',
  en:'<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><clipPath id="vcukt"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath><path d="M0,0v30h60v-30z" fill="#012169"/><path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0L60,30M60,0L0,30" clip-path="url(#vcukt)" stroke="#C8102E" stroke-width="4"/><path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></svg>',
  fr:'<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>'
};
const LABEL={es:'Idioma',en:'Language',fr:'Langue'};
const ORDER=['es','en','fr'],ATTRS=['aria-label','title','placeholder','alt'];
let lang='es';
try{const s=localStorage.getItem('vc-lang');if(ORDER.includes(s))lang=s}catch(e){}

/* Frases con numeros o fechas: se reconocen por patron sobre el texto original en espanol */
const MESES={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11};
const LOC={en:'en-GB',fr:'fr-FR'};
function fecha(txt,l){
  const m=/^(\d{1,2}) de ([a-záéíóú]+) de (\d{4})$/i.exec(txt.trim());
  if(!m||!(m[2].toLowerCase() in MESES))return txt;
  return new Intl.DateTimeFormat(LOC[l],{day:'numeric',month:'long',year:'numeric'}).format(new Date(+m[3],MESES[m[2].toLowerCase()],+m[1]));
}
const PATTERNS=[
  [/^(.+) · (\d+),(\d+) UA del Sol$/,{
    en:m=>tr(m[1])+' · '+m[2]+'.'+m[3]+' AU from the Sun',
    fr:m=>tr(m[1])+' · '+m[2]+','+m[3]+' UA du Soleil'}],
  [/^(\d+) objeto fotografiado$/,{en:m=>m[1]+' photographed object',fr:m=>m[1]+' objet photographié'}],
  [/^(\d+) objetos fotografiados$/,{en:m=>m[1]+' photographed objects',fr:m=>m[1]+' objets photographiés'}],
  [/^(\d+) de (\d+) objetos fotografiados$/,{en:m=>m[1]+' of '+m[2]+' photographed objects',fr:m=>m[1]+' sur '+m[2]+' objets photographiés'}],
  [/^(\d+) de (\d+) objetos$/,{en:m=>m[1]+' of '+m[2]+' objects',fr:m=>m[1]+' sur '+m[2]+' objets'}],
  [/^\u00daltima foto: (.+)$/,{en:m=>'Last photo: '+m[1],fr:m=>'Derni\u00e8re photo : '+m[1]}],
  [/^(\d+) objetos?$/,{en:m=>m[1]+(m[1]==='1'?' object':' objects'),fr:m=>m[1]+(+m[1]>1?' objets':' objet')}],
  [/^Posiciones calculadas para el (.+?) · escala de distancias comprimida · arrastra para girar, rueda o pellizco para acercar$/,{
    en:m=>'Positions calculated for '+fecha(m[1],'en')+' · compressed distance scale · drag to rotate, scroll or pinch to zoom',
    fr:m=>'Positions calculées pour le '+fecha(m[1],'fr')+' · échelle de distances compressée · glisser pour pivoter, molette ou pincement pour zoomer'}],
  [/^Posiciones calculadas para el (.+?) · escala comprimida · arrastra para girar, pellizca para acercar$/,{
    en:m=>'Positions calculated for '+fecha(m[1],'en')+' · compressed scale · drag to rotate, pinch to zoom',
    fr:m=>'Positions calculées pour le '+fecha(m[1],'fr')+' · échelle compressée · glisser pour pivoter, pincer pour zoomer'}]
];
function skip(el){return el.closest&&el.closest('[data-no-i18n],[data-i18n-html],script,style,canvas')}
/* francés: espacio fino antes de ? ! : ; y dentro de « » (no se parte la linea) */
function frTypo(t){return t.replace(/ ([?!:;»])/g,'\u00a0$1').replace(/« /g,'«\u00a0')}
function tr(es){
  const r=tr0(es);
  return lang==='fr'&&r!==es?frTypo(r):r;
}
function tr0(es){
  if(lang==='es')return es;
  const d=DICT[lang];
  if(d&&Object.prototype.hasOwnProperty.call(d,es)&&d[es])return d[es];
  const ns=es.replace(/\s+/g,' ');
  if(d&&ns!==es&&Object.prototype.hasOwnProperty.call(d,ns)&&d[ns])return d[ns];
  /* descripcion recortada con "…" (tooltip): se traduce la completa y se recorta igual */
  if(d&&es.length>40&&es.charAt(es.length-1)==='\u2026'){
    const base=ns.slice(0,-1);
    for(const k in d){if(k.length>base.length&&k.startsWith(base)&&d[k]){let t=d[k];if(t.length>320){t=t.slice(0,320).replace(/\s+\S*$/,'')+'\u2026'}return t}}
  }
  for(const p of PATTERNS){const m=p[0].exec(es);if(m&&p[1][lang])return p[1][lang](m)}
  return es;
}
function doText(n){
  if(n.__vcApplied!==undefined&&n.nodeValue!==n.__vcApplied)n.__vcEs=undefined;      /* la app lo cambio: nuevo original */
  if(n.__vcEs===undefined)n.__vcEs=n.nodeValue;
  const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(n.__vcEs);
  if(!m[2])return;
  const v=m[1]+tr(m[2])+m[3];
  n.__vcApplied=v;if(n.nodeValue!==v)n.nodeValue=v;
}
function doAttrs(el){
  if(!el.getAttribute)return;
  for(const a of ATTRS){
    if(!el.hasAttribute(a))continue;
    el.__vcA=el.__vcA||{};
    const cur=el.getAttribute(a),rec=el.__vcA[a];
    if(!rec||rec.applied!==cur)el.__vcA[a]={es:cur,applied:cur};
    const v=tr(el.__vcA[a].es);
    el.__vcA[a].applied=v;if(cur!==v)el.setAttribute(a,v);
  }
}
function doHtml(el){
  if(el.__vcHtmlEs===undefined)el.__vcHtmlEs=el.innerHTML;
  const k=el.getAttribute('data-i18n-html'),h=lang!=='es'&&DICTH[lang]&&DICTH[lang][k]?DICTH[lang][k]:el.__vcHtmlEs;
  if(el.innerHTML!==h)el.innerHTML=h;
}
function walk(root){
  if(root.nodeType===3){if(root.parentNode&&!skip(root.parentNode))doText(root);return}
  if(root.nodeType!==1)return;
  if(root.hasAttribute('data-i18n-html')){if(!root.closest('[data-no-i18n]'))doHtml(root);return}
  if(skip(root))return;
  doAttrs(root);
  for(const c of root.childNodes)walk(c);
}
let busy=false;
function apply(){busy=true;try{walk(document.body)}finally{busy=false}}
const mo=new MutationObserver(ms=>{
  if(busy)return;
  busy=true;
  try{
    for(const m of ms){
      if(m.type==='childList')m.addedNodes.forEach(n=>walk(n));
      else if(m.type==='characterData'){if(m.target.parentNode&&!skip(m.target.parentNode))doText(m.target)}
      else if(m.type==='attributes')doAttrs(m.target);
    }
  }finally{busy=false}
});
function setLang(l){
  if(!ORDER.includes(l))return;
  lang=l;
  try{localStorage.setItem('vc-lang',l)}catch(e){}
  document.documentElement.lang=l;
  try{if(window.top!==window)window.top.document.documentElement.lang=l}catch(e){}
  apply();refreshUI();
  window.dispatchEvent(new CustomEvent('vc-lang',{detail:l}));
}

/* ---- interfaz: boton con bandera + menu */
let btn,menu;
const CSS=`
.vc-lang{position:absolute;top:12px;right:64px;z-index:7;font:inherit}
.vc-lang button{display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:1px solid #343b60;border-radius:11px;background:#0e1226ef;box-shadow:0 5px 22px #0003;cursor:pointer;transition:border-color .18s ease,transform .18s ease}
.vc-lang button:hover,.vc-lang button:focus-visible{border-color:#8ab4ff;transform:scale(1.05);outline:none}
.vc-flag{display:block;width:26px;height:18px;border-radius:3px;overflow:hidden;box-shadow:0 0 0 1px #ffffff2a}
.vc-flag svg{display:block;width:100%;height:100%}
.vc-lang-menu{position:absolute;top:46px;right:0;min-width:150px;padding:5px;border:1px solid #232846;border-radius:9px;background:#0b0e1ff5;box-shadow:0 12px 30px #0008;backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-6px) scale(.98);transform-origin:top right;transition:opacity .17s ease,transform .22s cubic-bezier(.2,.8,.2,1),visibility 0s .22s}
.vc-lang.open .vc-lang-menu{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity .17s ease,transform .22s cubic-bezier(.2,.8,.2,1),visibility 0s}
.vc-lang-menu button{display:flex;align-items:center;gap:12px;width:100%;height:auto;padding:9px 11px;border:0;border-radius:6px;background:none;box-shadow:none;color:#eef1ff;font:inherit;text-align:left;transform:none}
.vc-lang-menu button:hover,.vc-lang-menu button:focus-visible{background:#1a2040;transform:none}
@media(pointer:coarse){.vc-lang-menu button{min-height:44px}}
`;
function flag(l){return '<span class="vc-flag">'+FLAGS[l]+'</span>'}
function refreshUI(){
  if(!btn)return;
  btn.innerHTML=flag(lang);btn.setAttribute('aria-label',LABEL[lang]);btn.setAttribute('title',LABEL[lang]);
  menu.innerHTML='';
  ORDER.filter(l=>l!==lang).forEach(l=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('lang',l);
    b.innerHTML=flag(l)+'<span>'+NAMES[lang][l]+'</span>';
    b.addEventListener('click',()=>{close();setLang(l)});
    menu.append(b);
  });
}
function close(){if(!btn)return;btn.parentNode.classList.remove('open');btn.setAttribute('aria-expanded','false')}
function mount(parent){
  if(!document.getElementById('vc-lang-css')){const st=document.createElement('style');st.id='vc-lang-css';st.textContent=CSS;document.head.append(st)}
  const wrap=document.createElement('div');wrap.className='vc-lang';wrap.setAttribute('data-no-i18n','');
  btn=document.createElement('button');btn.type='button';btn.setAttribute('aria-haspopup','true');btn.setAttribute('aria-expanded','false');
  menu=document.createElement('div');menu.className='vc-lang-menu';
  wrap.append(btn,menu);parent.append(wrap);
  btn.addEventListener('click',()=>{const o=wrap.classList.toggle('open');btn.setAttribute('aria-expanded',String(o))});
  document.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  refreshUI();
  /* etiqueta accesible del boton, en el idioma actual */
  document.documentElement.lang=lang;
  return wrap;
}
function start(){apply();mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS})}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
window.addEventListener('storage',e=>{if(e.key==='vc-lang'&&ORDER.includes(e.newValue)&&e.newValue!==lang){lang=e.newValue;document.documentElement.lang=lang;apply();refreshUI();window.dispatchEvent(new CustomEvent('vc-lang',{detail:lang}))}});
window.vcI18n={mount,setLang,t:tr,get lang(){return lang},DICT};
})();
