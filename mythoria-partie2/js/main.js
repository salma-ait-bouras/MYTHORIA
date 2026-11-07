import { creerLesPaquets, distribuerLaMain } from "./cards.js";
import {
  attaquer,
  seDefendre,
  invoquerUneCarte,
  ajouterAHistorique
} from "./combat.js";
import { commencerLeTour, lancerLaPiece } from "./turns.js";
import { jouerLeTourAdverse } from "./opponent.js";
import { afficherArene } from "./ui.js";

const paquets = creerLesPaquets();

const partie = {
  phase: "preparation",
  tour: null,
  vainqueur: null,
  carteSelectionnee: null,
  historique: [],
  joueur: {
    nom: "Le joueur",
    vie: 3000,
    camp: null,
    paquet: paquets.paquetJoueur,
    main: [],
    terrain: []
  },
  adversaire: {
    nom: "L'adversaire",
    vie: 3000,
    camp: null,
    paquet: paquets.paquetAdversaire,
    main: [],
    terrain: []
  }
};

distribuerLaMain(partie.joueur);
distribuerLaMain(partie.adversaire);

function actualiserAffichage() {
  afficherArene(partie);
}

function lancerLeTourAdverse() {
  actualiserAffichage();

  window.setTimeout(() => {
    jouerLeTourAdverse(partie);
    actualiserAffichage();
  }, 700);
}

document.addEventListener("click", evenement => {
  const bouton = evenement.target.closest("button[data-action]");
  if (!bouton) return;

  const action = bouton.dataset.action;

  if (action === "camp") {
    if (partie.phase !== "choixCamp") return;

    partie.joueur.camp = bouton.dataset.camp;
    partie.adversaire.camp =
      partie.joueur.camp === "Lumière" ? "Ténèbres" : "Lumière";

    partie.phase = "combat";
    ajouterAHistorique(partie, `Tu choisis le camp ${partie.joueur.camp}.`);
    commencerLeTour(partie, "joueur");
    actualiserAffichage();
    return;
  }

  if (action === "invoquer") {
    invoquerUneCarte(partie, "joueur", bouton.dataset.id);
    actualiserAffichage();
    return;
  }

  if (action === "attaquer") {
    if (partie.phase !== "combat" || partie.tour !== "joueur") return;

    const attaquant = partie.joueur.terrain.find(
      carte => carte.identifiant === bouton.dataset.id
    );
    if (!attaquant || attaquant.actionUtilisee) return;

    if (partie.adversaire.terrain.length === 0) {
      attaquer(partie, "joueur", attaquant.identifiant);
      partie.carteSelectionnee = null;
    } else {
      partie.carteSelectionnee = attaquant.identifiant;
    }

    actualiserAffichage();
    return;
  }

  if (action === "cible") {
    if (!partie.carteSelectionnee) return;

    attaquer(
      partie,
      "joueur",
      partie.carteSelectionnee,
      bouton.dataset.id
    );

    partie.carteSelectionnee = null;
    actualiserAffichage();
    return;
  }

  if (action === "defendre") {
    seDefendre(partie, "joueur", bouton.dataset.id);
    actualiserAffichage();
  }
});

document.querySelector("#bouton-piece").addEventListener("click", () => {
  if (partie.joueur.main.length === 0 && partie.joueur.paquet.length === 0) {
    document.querySelector("#message-preparation").textContent =
      "Ton deck est vide. Ajoute des cartes depuis la page My Deck.";
    return;
  }

  const premierJoueur = lancerLaPiece();

  if (premierJoueur === "joueur") {
    partie.phase = "choixCamp";
  } else {
    partie.adversaire.camp =
      Math.random() < 0.5 ? "Lumière" : "Ténèbres";
    partie.joueur.camp =
      partie.adversaire.camp === "Lumière" ? "Ténèbres" : "Lumière";

    partie.phase = "combat";
    ajouterAHistorique(partie, "L'adversaire commence et choisit son camp.");
    commencerLeTour(partie, "adversaire");
    lancerLeTourAdverse();
  }

  actualiserAffichage();
});

document.querySelector("#bouton-fin-tour").addEventListener("click", () => {
  if (partie.phase !== "combat" || partie.tour !== "joueur") return;

  partie.carteSelectionnee = null;
  ajouterAHistorique(partie, "Tu termines ton tour.");
  commencerLeTour(partie, "adversaire");
  lancerLeTourAdverse();
});

document.querySelector("#bouton-recommencer").addEventListener("click", () => {
  window.location.reload();
});

actualiserAffichage();