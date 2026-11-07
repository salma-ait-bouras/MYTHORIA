function echapperTexte(texte) {
  return String(texte).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[caractere]);
}

export function afficherListe(conteneur, elements, creerElement) {
  conteneur.innerHTML = elements.map(creerElement).join("");
}

export function viderFormulaire(formulaire) {
  if (formulaire) formulaire.reset();
}

function afficherUneCarte(carte, boutons = "") {
  const statut = carte.actionUtilisee ? "Action utilisée" : "Action disponible";
  const defense = carte.enDefense ? " · Défense active" : "";

  return "<article class='min-w-0 min-h-[68px] sm:min-h-[84px] flex flex-col justify-between overflow-hidden rounded-lg border-2 border-yellow-600 bg-purple-950 p-1 text-white sm:p-2'>"
    + "<div><h3 class='truncate text-[9px] font-bold text-yellow-200 sm:text-xs' title='" + echapperTexte(carte.nom) + "'>" + echapperTexte(carte.nom) + "</h3>"
    + "<p class='text-[8px] text-purple-200 sm:text-[10px]'>" + echapperTexte(carte.camp) + "</p>"
    + "<p class='mt-1 text-[9px] sm:text-xs'>ATK " + carte.attaque + " · PV " + carte.vie + "</p></div>"
    + "<p class='truncate text-[8px] text-purple-300 sm:text-[9px]'>" + statut + defense + "</p>"
    + "<div class='mt-1 flex flex-wrap gap-1'>" + boutons + "</div></article>";
}

function afficherTerrain(conteneur, cartes, estAdverse, partie) {
  const emplacements = Array.from({ length: 10 }, (_, index) => cartes[index] || null);

  afficherListe(conteneur, emplacements, carte => {
    if (!carte) {
      return "<div class='min-w-0 min-h-[68px] sm:min-h-[84px] rounded-sm border border-yellow-700 bg-purple-950/70' aria-hidden='true'></div>";
    }

    if (estAdverse) {
      const boutonCible = partie.carteSelectionnee
        ? "<button data-action='cible' data-id='" + carte.identifiant + "' class='rounded bg-red-700 px-1 py-1 text-[8px] text-white transition-transform duration-200 hover:scale-105 sm:text-[10px]'>Cible</button>"
        : "";
      return afficherUneCarte(carte, boutonCible);
    }

    const boutons = partie.phase === "combat"
      && partie.tour === "joueur"
      && !carte.actionUtilisee
      ? "<button data-action='attaquer' data-id='" + carte.identifiant + "' class='rounded bg-red-700 px-1 py-1 text-[8px] text-white transition-transform duration-200 hover:scale-105 sm:text-[10px]'>Attaquer</button>"
        + "<button data-action='defendre' data-id='" + carte.identifiant + "' class='rounded bg-purple-700 px-1 py-1 text-[8px] text-white transition-transform duration-200 hover:scale-105 sm:text-[10px]'>Défendre</button>"
      : "";

    return afficherUneCarte(carte, boutons);
  });
}

export function afficherArene(partie) {
  const preparation = document.querySelector("#preparation");
  const zoneCombat = document.querySelector("#zone-combat");
  const boutonRecommencer = document.querySelector("#bouton-recommencer");

  preparation.classList.toggle(
    "hidden",
    partie.phase === "combat" || partie.phase === "terminee"
  );
  zoneCombat.classList.toggle(
    "hidden",
    partie.phase !== "combat" && partie.phase !== "terminee"
  );
  boutonRecommencer.classList.toggle("hidden", partie.phase !== "terminee");

  if (partie.phase === "preparation") {
    document.querySelector("#message-preparation").textContent =
      "Lance la pièce pour savoir qui commence.";
    document.querySelector("#bouton-piece").classList.remove("hidden");
    document.querySelector("#choix-camps").innerHTML = "";
    return;
  }

  if (partie.phase === "choixCamp") {
    document.querySelector("#message-preparation").textContent =
      "Tu commences ! Choisis ton camp.";
    document.querySelector("#bouton-piece").classList.add("hidden");
    document.querySelector("#choix-camps").innerHTML =
      "<button data-action='camp' data-camp='Lumière' class='rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black transition-transform duration-200 hover:scale-105'>Lumière</button>"
      + "<button data-action='camp' data-camp='Ténèbres' class='rounded-lg bg-purple-700 px-4 py-2 font-bold text-white transition-transform duration-200 hover:scale-105'>Ténèbres</button>";
    return;
  }

  document.querySelector("#camp-joueur").textContent = partie.joueur.camp || "—";
  document.querySelector("#camp-adversaire").textContent = partie.adversaire.camp || "—";
  document.querySelector("#vie-joueur").textContent = partie.joueur.vie;
  document.querySelector("#vie-adversaire").textContent = partie.adversaire.vie;
  document.querySelector("#paquet-joueur").textContent = partie.joueur.paquet.length;
  document.querySelector("#paquet-adversaire").textContent = partie.adversaire.paquet.length;
  document.querySelector("#tour-actuel").textContent =
    partie.tour === "joueur" ? "Joueur" : "Adversaire";

  document.querySelector("#barre-vie-joueur").value =
    Math.max(0, Math.min(3000, partie.joueur.vie));
  document.querySelector("#barre-vie-adversaire").value =
    Math.max(0, Math.min(3000, partie.adversaire.vie));

  afficherTerrain(
    document.querySelector("#terrain-adverse"),
    partie.adversaire.terrain,
    true,
    partie
  );
  afficherTerrain(
    document.querySelector("#terrain-joueur"),
    partie.joueur.terrain,
    false,
    partie
  );

  afficherListe(document.querySelector("#main-joueur"), partie.joueur.main, carte => {
    const bouton = partie.phase === "combat"
      && partie.tour === "joueur"
      && partie.joueur.terrain.length < 10
      ? "<button data-action='invoquer' data-id='" + carte.identifiant + "' class='rounded bg-yellow-400 px-2 py-1 text-[9px] font-bold text-black transition-transform duration-200 hover:scale-105 sm:text-xs'>Invoquer</button>"
      : "";
    return afficherUneCarte(carte, bouton);
  });

  afficherListe(
    document.querySelector("#historique"),
    partie.historique.slice(0, 12),
    ligne => "<li>" + echapperTexte(ligne) + "</li>"
  );

  document.querySelector("#bouton-fin-tour").disabled =
    partie.phase !== "combat" || partie.tour !== "joueur";

  const message = document.querySelector("#message-combat");
  if (partie.phase === "terminee") {
    message.textContent = partie.vainqueur === "joueur"
      ? "Tu as gagné !"
      : "L'adversaire a gagné.";
  } else if (partie.carteSelectionnee) {
    message.textContent = "Choisis une carte adverse comme cible.";
  } else {
    message.textContent = partie.tour === "joueur"
      ? "C'est ton tour. Invoque, attaque ou défends."
      : "L'adversaire joue...";
  }
}