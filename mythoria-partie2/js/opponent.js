import { invoquerUneCarte, attaquer, ajouterAHistorique } from "./combat.js";
import { commencerLeTour } from "./turns.js";

export function jouerLeTourAdverse(partie) {
  if (partie.phase !== "combat" || partie.tour !== "adversaire") return;

  if (partie.adversaire.main.length > 0 && partie.adversaire.terrain.length < 10) {
    const carte = partie.adversaire.main[0];
    invoquerUneCarte(partie, "adversaire", carte.identifiant);
  }

  for (const attaquant of [...partie.adversaire.terrain]) {
    if (partie.phase === "terminee") break;

    const cible = partie.joueur.terrain
      .slice()
      .sort((carteA, carteB) => carteA.vie - carteB.vie)[0];

    if (cible) {
      attaquer(partie, "adversaire", attaquant.identifiant, cible.identifiant);
    } else {
      attaquer(partie, "adversaire", attaquant.identifiant);
    }
  }

  if (partie.phase !== "terminee") {
    ajouterAHistorique(partie, "L'adversaire termine son tour.");
    commencerLeTour(partie, "joueur");
  }
}