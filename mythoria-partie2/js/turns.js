import { piocherUneCarte } from "./cards.js";
import { ajouterAHistorique } from "./combat.js";

export function commencerLeTour(partie, campQuiJoue) {
  if (partie.phase === "terminee") return;

  partie.tour = campQuiJoue;
  const combattant = partie[campQuiJoue];

  combattant.terrain.forEach(carte => {
    carte.actionUtilisee = false;
    carte.enDefense = false;
  });

  if (combattant.main.length < 5) {
    if (!piocherUneCarte(combattant)) {
      ajouterAHistorique(partie, `${combattant.nom} n'a plus de carte à piocher.`);
    }
  }

  ajouterAHistorique(partie, `C'est le tour de ${combattant.nom}.`);
}

export function lancerLaPiece() {
  return Math.random() < 0.5 ? "joueur" : "adversaire";
}